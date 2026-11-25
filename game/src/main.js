// Sizzle & Serve — main: the game state, the loop, every interaction, and
// the scoring. The kitchen, the orders, the chef and the renderer each own
// their own file; this file wires them together.
import { W, H, HUD_H, SHIFT_SECONDS, TARGET_COINS, STAR_COINS, MAX_HEARTS, CHOPS_TO, GRILLS_TO, FRIES_TO } from './config.js';
import { levelFor } from './config.js';
import { createKitchen, nearestStation, stationAtPoint, anyCooking } from './kitchen.js';
import { createChef, updateChef, chefCarrying, chefCarryingPlate, chefCarryingIngredient, chefCarriedItem, chefTakeIngredient, chefTakePlate, chefAddToPlate, chefDropCarry, chefPlateItems } from './chef.js';
import { createOrderBoard, updateOrderBoard, findMatchingOrder, recipeNeeds } from './orders.js';
import { updateChopping, updateCookSlots, slotState, slotYield, slotReady } from './cooking.js';
import { createParticles, addPopup, addPuff, updateParticles } from './particles.js';
import { createInput } from './input.js';
import { drawKitchen, drawChef, drawHUD, drawParticles, drawHint, drawTitle, drawEnd, drawPause } from './render.js';
import { mulberry32 } from './random.js';
import { sfx, sizzleAmbience, unlockAudio } from './audio.js';
import { stageShot } from './shots.js';
import { RECIPES } from './config.js';

const BEST_KEY = 'sizzle-and-serve-best';

function loadBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage may be unavailable; the best score is a nicety, not the game.
  }
}

export function createGame(seed) {
  const rng = mulberry32(seed);
  return {
    screen: 'title', // title | play | paused | win | lose
    rng,
    seed,
    kitchen: createKitchen(),
    chef: createChef(),
    board: createOrderBoard(rng),
    particles: createParticles(),
    recipes: RECIPES,
    elapsed: 0,
    shiftTotal: SHIFT_SECONDS,
    shiftLeft: SHIFT_SECONDS,
    level: 1,
    coins: 0,
    tips: 0,
    combo: 0,
    comboMultiplier: 1,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    maxHearts: MAX_HEARTS,
    served: 0,
    failed: 0,
    targetCoins: TARGET_COINS,
    stars: 0,
    endState: null,
    endReason: '',
    best: loadBest(),
    hint: '',
    hotStation: null,
    shake: 0,
    frozen: false, // screenshot mode: render the staged frame, never advance
    lowPatienceWarned: new Set(),
  };
}

function startShift(g) {
  const fresh = createGame((Date.now() % 2147483647) || 1);
  fresh.best = g.best;
  fresh.screen = 'play';
  Object.assign(g, fresh);
  g.screen = 'play';
}

// ------------------------------------------------------------ interactions
function comboMultiplierFor(combo) {
  return Math.min(3, 1 + 0.25 * Math.max(0, combo - 1));
}

function servePlate(g, windowStation) {
  const chef = g.chef;
  if (!chefCarryingPlate(chef)) {
    g.hint = 'Bring a finished plate to the window (E)';
    return;
  }
  const items = chefPlateItems(chef);
  if (items.length === 0) {
    g.hint = 'That plate is empty — add ingredients first';
    sfx.buzz();
    return;
  }
  const order = findMatchingOrder(g.board, items);
  if (!order) {
    sfx.buzz();
    g.combo = 0;
    g.comboMultiplier = 1;
    g.shake = 7;
    addPopup(g.particles, windowStation.x + windowStation.w / 2, windowStation.y - 10, 'WRONG DISH!', '#e4572e');
    g.hint = 'No order wants that plate — check the tickets';
    return;
  }
  const patienceFrac = Math.max(0, order.patience / order.patienceMax);
  const tip = Math.round(order.recipe.price * 0.5 * patienceFrac);
  const total = Math.round((order.recipe.price + tip) * g.comboMultiplier);
  g.coins += total;
  g.tips += Math.round(tip * g.comboMultiplier);
  g.combo += 1;
  g.bestCombo = Math.max(g.bestCombo, g.combo);
  g.comboMultiplier = comboMultiplierFor(g.combo);
  g.served += 1;
  g.board.orders = g.board.orders.filter((o) => o.id !== order.id);
  chefDropCarry(chef);
  sfx.ding();
  setTimeout(() => sfx.coin(), 90);
  addPopup(g.particles, windowStation.x + windowStation.w / 2, windowStation.y - 10, `+$${total}`, '#ffc93c');
  if (tip > 0) addPopup(g.particles, windowStation.x + windowStation.w / 2, windowStation.y - 34, `tip $${tip}`, '#58b368');
  if (g.combo >= 3) addPopup(g.particles, g.chef.x, g.chef.y - 60, `COMBO x${g.comboMultiplier.toFixed(2)}!`, '#f08a24');
  addPuff(g.particles, windowStation.x + windowStation.w / 2, windowStation.y, '#ffc93c', 8);
}

// One E press at a station. Every branch either does something or explains
// why it cannot, through the hint line.
function interactAtStation(g, station) {
  const chef = g.chef;
  const carrying = chefCarrying(chef);

  if (station.kind === 'crate') {
    if (!carrying) {
      chefTakeIngredient(chef, station.item);
      sfx.pickup();
      return;
    }
    if (chefCarryingPlate(chef)) {
      if (chefAddToPlate(chef, station.item)) {
        sfx.place();
        addPuff(g.particles, chef.x, chef.y - 40, '#fff6e6', 3);
      } else if (chefPlateItems(chef).includes('bun') && station.item === 'bun') {
        g.hint = 'Only one bun per dish';
        sfx.buzz();
      } else {
        g.hint = 'The plate is full — serve it or trash it';
        sfx.buzz();
      }
      return;
    }
    g.hint = 'Hands full — set it down on a counter first';
    return;
  }

  if (station.kind === 'board') {
    if (chefCarryingIngredient(chef) && chefCarriedItem(chef) in CHOPS_TO) {
      g.hint = 'Hold E to chop…';
      return;
    }
    if (chefCarryingIngredient(chef)) {
      g.hint = 'That can’t be chopped — try the grill or fryer';
      return;
    }
    g.hint = 'Bring lettuce, tomato, onion or potato to chop';
    return;
  }

  if (station.kind === 'grill' || station.kind === 'fryer') {
    const accepts = station.kind === 'grill' ? GRILLS_TO : FRIES_TO;
    // Taking first: a ready (or burnt) slot beats placing.
    for (const slot of station.slots) {
      if (slot.item && (slotReady(station.kind, slot.t) || slotState(station.kind, slot.t) === 2)) {
        const out = slotYield(station.kind, slot.item, slot.t);
        if (chefCarryingPlate(chef)) {
          if (chefAddToPlate(chef, out)) {
            slot.item = null; slot.t = 0;
            sfx.place();
            return;
          }
          g.hint = 'The plate is full — serve it or trash it';
          sfx.buzz();
          return;
        }
        if (!carrying) {
          chefTakeIngredient(chef, out);
          slot.item = null; slot.t = 0;
          sfx.pickup();
          if (out === 'pattyBurnt' || out === 'friesBurnt') {
            g.hint = 'Burnt! Trash it and start over';
          }
          return;
        }
        g.hint = 'Hands full — set it down on a counter first';
        return;
      }
    }
    // Placing: a raw input into a free slot.
    if (chefCarryingIngredient(chef) && chefCarriedItem(chef) in accepts) {
      const free = station.slots.find((s) => !s.item);
      if (free) {
        free.item = chefCarriedItem(chef);
        free.t = 0;
        chefDropCarry(chef);
        sfx.place();
        addPuff(g.particles, station.x + station.w / 2, station.y + 20, '#ffffff', 4);
        return;
      }
      g.hint = 'No free slot — wait for the food to finish';
      return;
    }
    if (station.slots.some((s) => s.item)) {
      g.hint = 'Still cooking — watch the ring fill up';
      return;
    }
    g.hint = station.kind === 'grill' ? 'Bring a raw patty to grill' : 'Bring chopped potato to fry';
    return;
  }

  if (station.kind === 'plates') {
    if (!carrying) {
      chefTakePlate(chef);
      sfx.pickup();
      return;
    }
    g.hint = 'Hands full — set it down on a counter first';
    return;
  }

  if (station.kind === 'counter') {
    if (!station.item && carrying) {
      station.item = chefDropCarry(chef);
      sfx.place();
      return;
    }
    if (station.item && !carrying) {
      chef.carry = station.item;
      station.item = null;
      sfx.pickup();
      return;
    }
    if (station.item && chefCarryingPlate(chef) && station.item.type === 'ingredient') {
      if (chefAddToPlate(chef, station.item.item)) {
        station.item = null;
        sfx.place();
        return;
      }
      g.hint = 'The plate is full — serve it or trash it';
      sfx.buzz();
      return;
    }
    g.hint = 'Nothing to do here right now';
    return;
  }

  if (station.kind === 'window') {
    servePlate(g, station);
    return;
  }

  if (station.kind === 'trash') {
    if (carrying) {
      chefDropCarry(chef);
      sfx.place();
      addPuff(g.particles, station.x + station.w / 2, station.y, '#5b6470', 5);
      return;
    }
    g.hint = 'Nothing to throw away';
  }
}

// The hint line: what E does right now, at the nearest station.
function computeHint(g) {
  const chef = g.chef;
  const station = nearestStation(g.kitchen, chef.x, chef.y);
  g.hotStation = station;
  if (!station) {
    g.hint = chefCarrying(chef)
      ? 'Carrying — find a counter, the grill, or the window'
      : 'Walk to a crate to grab an ingredient';
    return;
  }
  const carrying = chefCarrying(chef);
  const labels = {
    crate: !carrying ? `E — Take ${station.label}` : chefCarryingPlate(chef) ? `E — Add ${station.label} to plate` : 'Hands full',
    board: chefCarryingIngredient(chef) && chefCarriedItem(chef) in CHOPS_TO ? 'Hold E — Chop' : 'Chopping Board',
    grill: 'Grill — E to place / take a patty',
    fryer: 'Fryer — E to place / take fries',
    plates: !carrying ? 'E — Take a plate' : 'Hands full',
    counter: !station.item && carrying ? 'E — Set it down' : station.item && !carrying ? 'E — Pick it up' : 'Counter',
    window: chefCarryingPlate(chef) ? 'E — Serve the plate!' : 'Serving Window — bring a plate',
    trash: carrying ? 'E — Throw it away' : 'Trash',
  };
  g.hint = labels[station.kind] ?? '';
}

// ------------------------------------------------------------- game flow
function endShift(g, won, reason) {
  g.endState = won ? 'win' : 'lose';
  g.endReason = reason;
  g.stars = g.coins >= STAR_COINS[2] ? 3 : g.coins >= STAR_COINS[1] ? 2 : g.coins >= STAR_COINS[0] ? 1 : 0;
  if (g.coins > g.best) {
    g.best = g.coins;
    saveBest(g.best);
  }
  g.screen = g.endState;
  if (won) sfx.win();
  else sfx.lose();
}

function updatePlay(g, dt, input) {
  g.elapsed += dt;
  g.shiftLeft = Math.max(0, g.shiftTotal - g.elapsed);
  g.level = levelFor(g.elapsed);

  updateChef(g.chef, g.kitchen, input, dt);

  // Chopping: hold E at the board.
  const near = nearestStation(g.kitchen, g.chef.x, g.chef.y);
  if (near && near.kind === 'board' && input.interactHeld) {
    const result = updateChopping(g.chef, true, dt);
    if (result === 'done') {
      addPopup(g.particles, g.chef.x, g.chef.y - 60, 'Chopped!', '#58b368');
    }
  } else if (g.chef.chopProgress > 0) {
    g.chef.chopProgress = 0;
  }

  // Orders.
  const expired = updateOrderBoard(g.board, dt, g.elapsed);
  for (const order of expired) {
    g.hearts -= 1;
    g.failed += 1;
    g.combo = 0;
    g.comboMultiplier = 1;
    sfx.buzz();
    g.shake = 6;
    addPopup(g.particles, W / 2, 130, `Order failed: ${order.recipe.name}`, '#e4572e');
    if (g.hearts <= 0) {
      endShift(g, false, 'Too many orders failed — the lunch crowd walked out.');
      return;
    }
  }
  // Low-patience tick.
  for (const order of g.board.orders) {
    if (order.patience <= 10 && order.patience > 0 && !g.lowPatienceWarned.has(order.id)) {
      g.lowPatienceWarned.add(order.id);
      sfx.tick();
    }
  }

  // Cooking slots.
  const burnEvents = updateCookSlots(g.kitchen, dt);
  for (const ev of burnEvents) {
    addPopup(g.particles, ev.station.x + ev.station.w / 2, ev.station.y - 8, 'BURNT!', '#e4572e');
    addPuff(g.particles, ev.station.x + ev.station.w / 2, ev.station.y + 30, '#5b6470', 6);
  }
  sizzleAmbience(anyCooking(g.kitchen), dt);

  // Steam puffs over active cook slots.
  for (const station of g.kitchen.stations) {
    if (!station.slots) continue;
    for (const slot of station.slots) {
      if (slot.item && Math.random() < dt * 3) {
        addPuff(g.particles, station.x + station.w / 2 + (Math.random() - 0.5) * 60, station.y + 24, 'rgba(255,255,255,0.8)', 1);
      }
    }
  }

  updateParticles(g.particles, dt);
  if (g.shake > 0) g.shake = Math.max(0, g.shake - dt * 30);
  computeHint(g);

  if (g.shiftLeft <= 0) {
    const won = g.coins >= g.targetCoins;
    endShift(g, won, won ? '' : `You earned $${g.coins} of the $${g.targetCoins} goal.`);
  }
}

// ------------------------------------------------------------------- boot
export function bootGame(canvas) {
  const params = new URLSearchParams(window.location.search);
  const shotName = params.get('shot');
  const seed = Number(params.get('seed')) || 1;
  const g = createGame(shotName ? seed : (Date.now() % 2147483647) || 1);
  const input = createInput(canvas);

  if (shotName) {
    g.screen = 'play';
    stageShot(g, shotName);
    g.frozen = true;
  }

  const ctx = canvas.getContext('2d');

  function handleClick() {
    if (!input.clickPoint) return;
    const { x, y } = input.clickPoint;
    if (g.screen === 'title') {
      startShift(g);
      return;
    }
    if (g.screen === 'win' || g.screen === 'lose') {
      startShift(g);
      return;
    }
    if (g.screen !== 'play') return;
    const station = stationAtPoint(g.kitchen, x, y);
    if (station) {
      const near = nearestStation(g.kitchen, g.chef.x, g.chef.y);
      if (near === station) {
        interactAtStation(g, station);
        return;
      }
      // Walk toward the clicked station.
      const tx = Math.max(station.x, Math.min(g.chef.x, station.x + station.w));
      const ty = Math.max(station.y, Math.min(g.chef.y, station.y + station.h));
      input.walkTarget = { x: tx, y: ty };
      return;
    }
    input.walkTarget = { x, y };
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - frame.last) / 1000 || 0.016);
    frame.last = now;

    if (!g.frozen) {
      // Keys.
      if (input.lastKey === 'Enter' && g.screen === 'title') startShift(g);
      else if (input.lastKey === 'KeyR' && (g.screen === 'win' || g.screen === 'lose')) startShift(g);
      else if ((input.lastKey === 'KeyP' || input.lastKey === 'Escape') && g.screen === 'play') g.screen = 'paused';
      else if ((input.lastKey === 'KeyP' || input.lastKey === 'Escape') && g.screen === 'paused') g.screen = 'play';

      handleClick();

      if (g.screen === 'play') {
        if (input.interactPressed) {
          const station = nearestStation(g.kitchen, g.chef.x, g.chef.y);
          if (station) interactAtStation(g, station);
        }
        updatePlay(g, dt, input);
      } else if (g.screen === 'paused') {
        updateParticles(g.particles, dt);
      }
    }

    // Render.
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (g.shake > 0) ctx.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake);
    drawKitchen(ctx, g, now);
    drawChef(ctx, g, now);
    drawParticles(ctx, g.particles);
    ctx.restore();
    if (g.screen === 'play' || g.screen === 'paused') {
      drawHUD(ctx, g, now);
      drawHint(ctx, g.hint);
    }
    if (g.screen === 'title') drawTitle(ctx, g);
    if (g.screen === 'win' || g.screen === 'lose') {
      drawHUD(ctx, g, now);
      drawEnd(ctx, g);
    }
    if (g.screen === 'paused') drawPause(ctx);

    input.endFrame();
    requestAnimationFrame(frame);
  }
  frame.last = performance.now();

  canvas.addEventListener('mousedown', unlockAudio);
  window.addEventListener('keydown', unlockAudio, { once: true });
  requestAnimationFrame(frame);
}
