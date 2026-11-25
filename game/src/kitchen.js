// Sizzle & Serve — kitchen: the station layout, collision, and the
// "nearest station" query the chef uses to interact. Stations are solid
// rectangles; the chef slides around them.
import { STATIONS, INTERACT_RANGE, W, H, HUD_H } from './config.js';

export function createKitchen() {
  const stations = STATIONS.map((s) => ({
    ...s,
    item: s.item ?? null, // counter slot contents (null = empty)
    slots: s.kind === 'grill' || s.kind === 'fryer'
      ? Array.from({ length: s.slots }, () => ({ item: null, t: 0 }))
      : null,
  }));
  return { stations };
}

export function stationById(kitchen, id) {
  return kitchen.stations.find((s) => s.id === id);
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// Move a circle (chef) by (dx, dy), resolving against every station rect
// and the kitchen walls. Returns the new position.
export function moveChef(kitchen, x, y, radius, dx, dy) {
  let nx = x + dx;
  let ny = y + dy;
  const minX = radius + 4;
  const maxX = W - radius - 4;
  const minY = HUD_H + radius + 4;
  const maxY = H - radius - 4;
  nx = Math.max(minX, Math.min(maxX, nx));
  ny = Math.max(minY, Math.min(maxY, ny));

  for (const s of kitchen.stations) {
    if (rectsOverlap(nx - radius, ny - radius, radius * 2, radius * 2, s.x, s.y, s.w, s.h)) {
      // Try x-only, then y-only, so the chef slides along counters.
      const xOnly = !rectsOverlap(nx - radius, y - radius, radius * 2, radius * 2, s.x, s.y, s.w, s.h);
      const yOnly = !rectsOverlap(x - radius, ny - radius, radius * 2, radius * 2, s.x, s.y, s.w, s.h);
      if (xOnly) ny = y;
      else if (yOnly) nx = x;
      else { nx = x; ny = y; }
    }
  }
  return { x: nx, y: ny };
}

// The nearest station whose rect, grown by INTERACT_RANGE, contains the point.
export function nearestStation(kitchen, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const s of kitchen.stations) {
    const cx = Math.max(s.x, Math.min(x, s.x + s.w));
    const cy = Math.max(s.y, Math.min(y, s.y + s.h));
    const d = Math.hypot(x - cx, y - cy);
    if (d <= INTERACT_RANGE && d < bestD) {
      best = s;
      bestD = d;
    }
  }
  return best;
}

// Station whose rect contains the point (for mouse clicks).
export function stationAtPoint(kitchen, x, y) {
  return kitchen.stations.find((s) => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) ?? null;
}

// True when any grill or fryer slot is cooking something.
export function anyCooking(kitchen) {
  return kitchen.stations.some((s) => s.slots && s.slots.some((slot) => slot.item !== null));
}
