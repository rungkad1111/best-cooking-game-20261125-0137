// Sizzle & Serve — orders: the ticket board. Orders arrive on a timer,
// each with a recipe and a patience bar that drains; serving the exact
// plate earns coins + tip, a wrong plate is refused, an expired ticket
// costs a heart.
import { MAX_ORDERS, RECIPES } from './config.js';
import { levelFor, orderIntervalSeconds, orderPatienceSeconds, recipePool } from './config.js';
import { pickRandom } from './random.js';
import { sfx } from './audio.js';

let nextOrderId = 1;

export function createOrderBoard(rng) {
  return {
    rng,
    orders: [], // {id, recipe, patience, patienceMax, served}
    spawnTimer: 4, // first order arrives quickly so the game starts busy
    rush: false,
    rushTimer: 0,
  };
}

// Count how many of each item a recipe needs (recipes may repeat items).
export function recipeNeeds(recipe) {
  const needs = {};
  for (const item of recipe.items) needs[item] = (needs[item] ?? 0) + 1;
  return needs;
}

// Does the plate's contents exactly match the recipe? Order-free, duplicates count.
export function plateMatchesRecipe(plateItems, recipe) {
  if (plateItems.length !== recipe.items.length) return false;
  const have = {};
  for (const item of plateItems) have[item] = (have[item] ?? 0) + 1;
  const needs = recipeNeeds(recipe);
  for (const key of Object.keys(needs)) {
    if (have[key] !== needs[key]) return false;
  }
  return true;
}

export function spawnOrder(board, elapsedSeconds) {
  if (board.orders.length >= MAX_ORDERS) return null;
  const level = levelFor(elapsedSeconds);
  const recipe = pickRandom(board.rng, recipePool(level));
  const patience = orderPatienceSeconds(level, board.rush);
  const order = {
    id: nextOrderId,
    recipe,
    patience,
    patienceMax: patience,
    bornAt: elapsedSeconds,
  };
  nextOrderId += 1;
  board.orders.push(order);
  sfx.orderIn();
  return order;
}

// Advance timers. Returns orders that just expired (caller charges hearts).
export function updateOrderBoard(board, dt, elapsedSeconds) {
  const expired = [];
  for (const order of board.orders) {
    order.patience -= dt;
    if (order.patience <= 0) expired.push(order);
  }
  if (expired.length > 0) {
    board.orders = board.orders.filter((o) => o.patience > 0);
  }

  // Rush hour: the last 15 seconds of each minute after the first.
  const inRushWindow = elapsedSeconds >= 60 && (elapsedSeconds % 60) >= 45;
  if (inRushWindow && !board.rush) {
    board.rush = true;
    board.rushTimer = 15;
    sfx.rush();
  }
  if (board.rush) {
    board.rushTimer -= dt;
    if (board.rushTimer <= 0) board.rush = false;
  }

  board.spawnTimer -= dt;
  if (board.spawnTimer <= 0) {
    spawnOrder(board, elapsedSeconds);
    board.spawnTimer = orderIntervalSeconds(levelFor(elapsedSeconds), board.rush);
  }
  return expired;
}

export function removeOrder(board, orderId) {
  board.orders = board.orders.filter((o) => o.id !== orderId);
}

// The best order this plate can serve (highest price first), or null.
export function findMatchingOrder(board, plateItems) {
  const matches = board.orders.filter((o) => plateMatchesRecipe(plateItems, o.recipe));
  if (matches.length === 0) return null;
  matches.sort((a, b) => b.recipe.price - a.recipe.price);
  return matches[0];
}

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}
