// Sizzle & Serve — chef: movement, facing, and the one thing the chef can
// carry: either a loose ingredient or a plate (a plate is a container that
// holds ingredients). Carrying is the game's central juggling act.
import { CHEF_SPEED, CHEF_RADIUS, CHEF_START, MAX_PLATE_ITEMS, INGREDIENTS } from './config.js';
import { moveChef } from './kitchen.js';

export function createChef() {
  return {
    x: CHEF_START.x,
    y: CHEF_START.y,
    dirX: 0,
    dirY: 1, // facing down at the start
    moving: false,
    // carry: null | { type: 'ingredient', item } | { type: 'plate', items: [] }
    carry: null,
    chopProgress: 0, // 0..1 while chopping the carried item
    walkTarget: null,
    bobT: 0, // walk-cycle phase for the render
  };
}

export function chefCarrying(chef) {
  return chef.carry !== null;
}

export function chefCarryingPlate(chef) {
  return chef.carry !== null && chef.carry.type === 'plate';
}

export function chefCarryingIngredient(chef) {
  return chef.carry !== null && chef.carry.type === 'ingredient';
}

export function chefCarriedItem(chef) {
  return chef.carry && chef.carry.type === 'ingredient' ? chef.carry.item : null;
}

export function chefPlateItems(chef) {
  return chef.carry && chef.carry.type === 'plate' ? chef.carry.items : [];
}

export function chefTakeIngredient(chef, item) {
  if (chef.carry) return false;
  chef.carry = { type: 'ingredient', item };
  chef.chopProgress = 0;
  return true;
}

export function chefTakePlate(chef) {
  if (chef.carry) return false;
  chef.carry = { type: 'plate', items: [] };
  return true;
}

// Add an ingredient onto the carried plate. Returns false when it does not fit.
export function chefAddToPlate(chef, item) {
  if (!chefCarryingPlate(chef)) return false;
  const items = chef.carry.items;
  if (items.length >= MAX_PLATE_ITEMS) return false;
  if (item === 'bun' && items.includes('bun')) return false; // one bun per dish
  items.push(item);
  return true;
}

export function chefDropCarry(chef) {
  const old = chef.carry;
  chef.carry = null;
  chef.chopProgress = 0;
  return old;
}

export function chefCarryLabel(chef) {
  if (!chef.carry) return 'hands empty';
  if (chef.carry.type === 'plate') {
    if (chef.carry.items.length === 0) return 'empty plate';
    return `plate: ${chef.carry.items.map((i) => INGREDIENTS[i].label).join(', ')}`;
  }
  return INGREDIENTS[chef.carry.item].label;
}

export function updateChef(chef, kitchen, input, dt) {
  let mx = input.moveX;
  let my = input.moveY;
  if (mx === 0 && my === 0 && input.walkTarget) {
    const dx = input.walkTarget.x - chef.x;
    const dy = input.walkTarget.y - chef.y;
    const d = Math.hypot(dx, dy);
    if (d < 8) {
      input.walkTarget = null;
    } else {
      mx = dx / d;
      my = dy / d;
    }
  }
  const len = Math.hypot(mx, my);
  chef.moving = len > 0;
  if (len > 0) {
    const nx = (mx / len) * CHEF_SPEED * dt;
    const ny = (my / len) * CHEF_SPEED * dt;
    const pos = moveChef(kitchen, chef.x, chef.y, CHEF_RADIUS, nx, ny);
    chef.x = pos.x;
    chef.y = pos.y;
    chef.dirX = mx / len;
    chef.dirY = my / len;
    chef.bobT += dt * 11;
  }
}
