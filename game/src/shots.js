// Sizzle & Serve — shots: stage real game state for the four screenshots.
// Every shot drives the real simulation state (real orders, real cook slots,
// real plates) — never a painted fake frame. The game freezes after staging,
// so the screenshot is stable.
import { RECIPES } from './config.js';
import { stationById } from './kitchen.js';
import { addPopup, addPuff } from './particles.js';

function makeOrder(id, recipeId, patience, patienceMax) {
  const recipe = RECIPES.find((r) => r.id === recipeId);
  return { id, recipe, patience, patienceMax, bornAt: 0 };
}

export function stageShot(g, name) {
  const kitchen = g.kitchen;
  const grill = stationById(kitchen, 'grill');
  const fryer = stationById(kitchen, 'fryer');
  const counter1 = stationById(kitchen, 'counter-1');
  const counter2 = stationById(kitchen, 'counter-2');

  if (name === 'title') {
    g.screen = 'title';
    g.best = 265;
    return;
  }

  if (name === 'play') {
    // COVER — mid-rush, level 2: three live tickets, a plate mid-assembly,
    // a patty on the grill, fries in the fryer, timer and coins showing.
    g.elapsed = 85;
    g.shiftLeft = 95;
    g.level = 2;
    g.coins = 87;
    g.combo = 4;
    g.comboMultiplier = 1.75;
    g.bestCombo = 4;
    g.served = 6;
    g.board.orders = [
      makeOrder(1, 'classic', 38, 52),
      makeOrder(2, 'cheeseburger', 24, 52),
      makeOrder(3, 'garden', 47, 58),
    ];
    g.board.spawnTimer = 99;
    const chef = g.chef;
    chef.x = 1010;
    chef.y = 300;
    chef.dirX = 1;
    chef.dirY = 0;
    chef.carry = { type: 'plate', items: ['bun', 'pattyCooked', 'lettuceChopped'] };
    grill.slots[0] = { item: 'patty', t: 4.5 };
    grill.slots[1] = { item: 'patty', t: 6.8 };
    fryer.slots[0] = { item: 'potatoChopped', t: 3.2 };
    counter1.item = { type: 'ingredient', item: 'tomatoChopped' };
    counter2.item = { type: 'ingredient', item: 'cheese' };
    addPopup(g.particles, 1160, 600, '+$21', '#ffc93c');
    addPuff(g.particles, 1184, 220, 'rgba(255,255,255,0.8)', 3);
    g.hint = 'E — Serve the plate!';
    g.hotStation = stationById(kitchen, 'window');
    return;
  }

  if (name === 'rush') {
    // RUSH HOUR — four tickets, two nearly out of patience, a burnt patty
    // smoking on the grill, one heart left, combo on the line.
    g.elapsed = 138;
    g.shiftLeft = 42;
    g.level = 3;
    g.coins = 132;
    g.combo = 5;
    g.comboMultiplier = 2;
    g.bestCombo = 5;
    g.served = 11;
    g.failed = 2;
    g.hearts = 1;
    g.board.rush = true;
    g.board.rushTimer = 12;
    g.board.orders = [
      makeOrder(1, 'doublestack', 9, 46),
      makeOrder(2, 'loadedfries', 13, 46),
      makeOrder(3, 'sunrise', 27, 46),
      makeOrder(4, 'gardenburger', 35, 46),
    ];
    g.board.spawnTimer = 99;
    const chef = g.chef;
    chef.x = 1060;
    chef.y = 300;
    chef.dirX = 1;
    chef.dirY = 0;
    chef.carry = { type: 'plate', items: ['bun'] };
    grill.slots[0] = { item: 'patty', t: 11.5 }; // burnt
    grill.slots[1] = { item: 'patty', t: 5.1 };
    fryer.slots[0] = { item: 'potatoChopped', t: 4.6 };
    counter1.item = { type: 'ingredient', item: 'lettuceChopped' };
    addPopup(g.particles, 1184, 190, 'BURNT!', '#e4572e');
    addPuff(g.particles, 1184, 220, '#5b6470', 5);
    g.hint = 'Burnt! Trash it and start over';
    g.hotStation = grill;
    return;
  }

  if (name === 'win') {
    // SHIFT COMPLETE — the tally screen with two stars.
    g.elapsed = 180;
    g.shiftLeft = 0;
    g.level = 3;
    g.coins = 265;
    g.tips = 38;
    g.combo = 6;
    g.comboMultiplier = 2.25;
    g.bestCombo = 6;
    g.served = 14;
    g.failed = 1;
    g.hearts = 2;
    g.stars = 2;
    g.endState = 'win';
    g.endReason = '';
    g.best = 265;
    g.board.orders = [];
    g.board.spawnTimer = 99;
    g.screen = 'win';
  }
}
