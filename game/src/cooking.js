// Sizzle & Serve — cooking: chopping on the board, grilling patties and
// frying potatoes. Each station slot holds one item and a cook timer; food
// left too long burns and must be trashed.
import { CHOP_SECONDS, GRILL_SECONDS, GRILL_BURN_SECONDS, FRY_SECONDS, FRY_BURN_SECONDS, CHOPS_TO, GRILLS_TO, FRIES_TO } from './config.js';
import { sfx } from './audio.js';

// --- chopping -----------------------------------------------------------
// Hold E at the board with a choppable item: progress fills, then the item
// transforms in hand. Returns 'chopping' | 'done' | 'idle'.
export function updateChopping(chef, held, dt) {
  const item = chef.carry && chef.carry.type === 'ingredient' ? chef.carry.item : null;
  if (!item || !(item in CHOPS_TO) || !held) {
    if (chef.chopProgress > 0 && (!held || !item)) chef.chopProgress = 0;
    return 'idle';
  }
  chef.chopProgress += dt / CHOP_SECONDS;
  if (Math.random() < dt * 8) sfx.chop();
  if (chef.chopProgress >= 1) {
    chef.carry.item = CHOPS_TO[item];
    chef.chopProgress = 0;
    sfx.chopDone();
    return 'done';
  }
  return 'chopping';
}

// --- grill & fryer ------------------------------------------------------
// Advance every occupied slot. Returns events the game turns into popups:
// {type:'burnt', station, slot} when food crosses into burnt.
export function updateCookSlots(kitchen, dt) {
  const events = [];
  for (const station of kitchen.stations) {
    if (!station.slots) continue;
    for (const slot of station.slots) {
      if (!slot.item) continue;
      const wasBurnt = slotBurnt(station.kind, slot.t);
      slot.t += dt;
      if (!wasBurnt && slotBurnt(station.kind, slot.t)) {
        events.push({ type: 'burnt', station, slot });
        sfx.burn();
      }
    }
  }
  return events;
}

// 0 = raw/cooking, 1 = ready to take, 2 = burnt.
export function slotState(kind, t) {
  if (kind === 'grill') {
    if (t >= GRILL_BURN_SECONDS) return 2;
    if (t >= GRILL_SECONDS) return 1;
    return 0;
  }
  if (kind === 'fryer') {
    if (t >= FRY_BURN_SECONDS) return 2;
    if (t >= FRY_SECONDS) return 1;
    return 0;
  }
  return 0;
}

export function slotBurnt(kind, t) {
  return slotState(kind, t) === 2;
}

export function slotReady(kind, t) {
  return slotState(kind, t) === 1;
}

// What comes out when the chef takes a finished slot.
export function slotTakeResult(kind, item) {
  if (kind === 'grill') {
    if (item in GRILLS_TO) return GRILLS_TO[item];
    return item;
  }
  if (kind === 'fryer') {
    if (item in FRIES_TO) return FRIES_TO[item];
    return item;
  }
  return item;
}

// Cook progress 0..1 toward "ready" (clamped; burnt food stays at 1).
export function slotProgress(kind, t) {
  const readyAt = kind === 'grill' ? GRILL_SECONDS : FRY_SECONDS;
  return Math.min(1, t / readyAt);
}

// The finished (possibly burnt) item a slot yields when taken.
export function slotYield(kind, item, t) {
  if (slotBurnt(kind, t)) {
    if (kind === 'grill') return 'pattyBurnt';
    if (kind === 'fryer') return 'friesBurnt';
  }
  return slotTakeResult(kind, item);
}
