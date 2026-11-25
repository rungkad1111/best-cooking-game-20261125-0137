// Sizzle & Serve — config: canvas, palette, ingredients, recipes, stations, levels.
// One place for every number the rest of the game reads, so tuning never
// means hunting through the simulation or the renderer.

export const W = 1280;
export const H = 800;
export const HUD_H = 80;

export const SHIFT_SECONDS = 180;
export const TARGET_COINS = 150;
export const STAR_COINS = [150, 220, 300];
export const MAX_HEARTS = 3;
export const MAX_ORDERS = 4;
export const MAX_PLATE_ITEMS = 6;

export const CHOP_SECONDS = 1.4;
export const GRILL_SECONDS = 6; // patty is cooked at this point
export const GRILL_BURN_SECONDS = 10; // past this the patty is burnt
export const FRY_SECONDS = 5; // chopped potato becomes fries
export const FRY_BURN_SECONDS = 9;

export const CHEF_SPEED = 265; // px per second
export const CHEF_RADIUS = 20;
export const INTERACT_RANGE = 52; // extra px around a station rect that counts as "near"

// ---------------------------------------------------------------- palette
export const PAL = {
  floorA: '#c98d5f',
  floorB: '#bd7f52',
  floorLine: '#a96f47',
  wall: '#8a5a3b',
  counterTop: '#e8dcc8',
  counterSide: '#7a4a2b',
  counterEdge: '#5d3620',
  steel: '#b9c4cc',
  steelDark: '#8b98a3',
  hud: '#2b1d16',
  hudPanel: '#3a2a20',
  cream: '#fff6e6',
  ink: '#2b1d16',
  gold: '#ffc93c',
  green: '#58b368',
  red: '#e4572e',
  orange: '#f08a24',
  blue: '#4aa3df',
  purple: '#9b7ede',
  pink: '#ff8fa3',
};

// ------------------------------------------------------------- ingredients
// kind -> draw data. Cooked/chopped variants are their own kinds so the
// plate, the tickets and the stations all draw the same picture.
export const INGREDIENTS = {
  bun: { label: 'Bun', color: '#e8a94f', dark: '#c07f2e' },
  patty: { label: 'Raw Patty', color: '#c65d7b', dark: '#9c3f5c' },
  pattyCooked: { label: 'Grilled Patty', color: '#7a4a21', dark: '#54301a' },
  pattyBurnt: { label: 'Burnt Patty', color: '#2b2b2b', dark: '#141414' },
  lettuce: { label: 'Lettuce', color: '#7ac74f', dark: '#4e9a2f' },
  lettuceChopped: { label: 'Chopped Lettuce', color: '#8fd45f', dark: '#5da83a' },
  tomato: { label: 'Tomato', color: '#e8483f', dark: '#b32a24' },
  tomatoChopped: { label: 'Chopped Tomato', color: '#f0604f', dark: '#c23a2c' },
  cheese: { label: 'Cheese', color: '#ffc93c', dark: '#e0a100' },
  onion: { label: 'Onion', color: '#c9a7e8', dark: '#9b7ede' },
  onionChopped: { label: 'Chopped Onion', color: '#d9c2f2', dark: '#a988e0' },
  potato: { label: 'Potato', color: '#d9b380', dark: '#a97f4e' },
  potatoChopped: { label: 'Chopped Potato', color: '#f2d8a0', dark: '#c9a35e' },
  fries: { label: 'Fries', color: '#ffd94d', dark: '#e0a100' },
  friesBurnt: { label: 'Burnt Fries', color: '#3a2e22', dark: '#1d1712' },
};

// What the chopping board turns a raw ingredient into, and what the grill
// and fryer turn their inputs into.
export const CHOPS_TO = { lettuce: 'lettuceChopped', tomato: 'tomatoChopped', onion: 'onionChopped', potato: 'potatoChopped' };
export const GRILLS_TO = { patty: 'pattyCooked' };
export const FRIES_TO = { potatoChopped: 'fries' };

// ---------------------------------------------------------------- recipes
export const RECIPES = [
  { id: 'classic', name: 'Classic Burger', items: ['bun', 'pattyCooked', 'lettuceChopped'], price: 12 },
  { id: 'cheeseburger', name: 'Cheese Burger', items: ['bun', 'pattyCooked', 'cheese', 'tomatoChopped'], price: 15 },
  { id: 'garden', name: 'Garden Salad', items: ['lettuceChopped', 'tomatoChopped', 'onionChopped'], price: 10 },
  { id: 'loadedfries', name: 'Loaded Fries', items: ['fries', 'cheese', 'onionChopped'], price: 11 },
  { id: 'sunrise', name: 'Sunrise Burger', items: ['bun', 'pattyCooked', 'tomatoChopped', 'cheese'], price: 14 },
  { id: 'doublestack', name: 'Double Stack', items: ['bun', 'pattyCooked', 'pattyCooked', 'cheese', 'lettuceChopped'], price: 19 },
  { id: 'gardenburger', name: 'Garden Burger', items: ['bun', 'pattyCooked', 'lettuceChopped', 'tomatoChopped', 'onionChopped'], price: 18 },
];

// --------------------------------------------------------------- stations
// kind: crate | board | grill | fryer | plates | counter | window | trash
// crates carry an ingredient; grill/fryer have cook slots; counters hold items.
export const STATIONS = [
  { id: 'crate-bun', kind: 'crate', item: 'bun', label: 'Buns', x: 16, y: 84, w: 172, h: 80 },
  { id: 'crate-patty', kind: 'crate', item: 'patty', label: 'Patties', x: 194, y: 84, w: 172, h: 80 },
  { id: 'crate-lettuce', kind: 'crate', item: 'lettuce', label: 'Lettuce', x: 372, y: 84, w: 172, h: 80 },
  { id: 'crate-tomato', kind: 'crate', item: 'tomato', label: 'Tomatoes', x: 550, y: 84, w: 172, h: 80 },
  { id: 'crate-cheese', kind: 'crate', item: 'cheese', label: 'Cheese', x: 728, y: 84, w: 172, h: 80 },
  { id: 'crate-onion', kind: 'crate', item: 'onion', label: 'Onions', x: 906, y: 84, w: 172, h: 80 },
  { id: 'crate-potato', kind: 'crate', item: 'potato', label: 'Potatoes', x: 1084, y: 84, w: 172, h: 80 },

  { id: 'board', kind: 'board', label: 'Chopping Board', x: 16, y: 200, w: 160, h: 100 },
  { id: 'trash', kind: 'trash', label: 'Trash', x: 16, y: 320, w: 160, h: 84 },

  { id: 'grill', kind: 'grill', label: 'Grill', slots: 2, x: 1104, y: 200, w: 160, h: 140 },
  { id: 'fryer', kind: 'fryer', label: 'Fryer', slots: 1, x: 1104, y: 360, w: 160, h: 120 },

  { id: 'plates', kind: 'plates', label: 'Plates', x: 16, y: 620, w: 160, h: 100 },
  { id: 'counter-1', kind: 'counter', label: 'Counter', x: 420, y: 380, w: 150, h: 90 },
  { id: 'counter-2', kind: 'counter', label: 'Counter', x: 580, y: 380, w: 150, h: 90 },
  { id: 'counter-3', kind: 'counter', label: 'Counter', x: 740, y: 380, w: 150, h: 90 },
  { id: 'window', kind: 'window', label: 'Serving Window', x: 1064, y: 620, w: 200, h: 100 },
];

export const CHEF_START = { x: 640, y: 600 };

// Difficulty by shift minute: order interval, patience, recipe pool size.
export function levelFor(elapsedSeconds) {
  if (elapsedSeconds < 60) return 1;
  if (elapsedSeconds < 120) return 2;
  return 3;
}

export function orderIntervalSeconds(level, rush) {
  if (rush) return 7;
  return level === 1 ? 16 : level === 2 ? 13 : 10;
}

export function orderPatienceSeconds(level, rush) {
  const base = level === 1 ? 58 : level === 2 ? 52 : 46;
  return rush ? base - 10 : base;
}

// Recipes an order may ask for at this level (harder dishes unlock later).
export function recipePool(level) {
  if (level === 1) return RECIPES.slice(0, 4);
  if (level === 2) return RECIPES.slice(0, 6);
  return RECIPES;
}
