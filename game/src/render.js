// Sizzle & Serve — render: every pixel of the kitchen, the food, the chef
// and the HUD is drawn in canvas code. No image files, no network.
import { W, H, HUD_H, PAL, INGREDIENTS, MAX_PLATE_ITEMS, STAR_COINS } from './config.js';
import { slotState, slotProgress } from './cooking.js';
import { recipeNeeds } from './orders.js';

// ------------------------------------------------------------ ingredients
// Draw one ingredient icon centred at (x, y), roughly `s` pixels wide.
export function drawIngredientIcon(ctx, kind, x, y, s) {
  const u = s / 40; // unit: icons are designed on a 40px grid
  ctx.save();
  ctx.translate(x, y);
  switch (kind) {
    case 'bun': {
      ctx.fillStyle = '#e8a94f';
      roundRect(ctx, -16 * u, -2 * u, 32 * u, 10 * u, 5 * u);
      ctx.fill();
      ctx.fillStyle = '#f2c078';
      ctx.beginPath();
      ctx.arc(0, -2 * u, 15 * u, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#fff3d6';
      for (const [sx, sy] of [[-8, -12], [0, -15], [8, -12]]) {
        ctx.beginPath(); ctx.arc(sx * u, sy * u, 1.8 * u, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'patty':
    case 'pattyCooked':
    case 'pattyBurnt': {
      const c = INGREDIENTS[kind].color;
      ctx.fillStyle = c;
      roundRect(ctx, -17 * u, -8 * u, 34 * u, 16 * u, 8 * u);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1.5 * u;
      if (kind === 'pattyCooked') {
        for (const lx of [-8, 0, 8]) {
          ctx.beginPath(); ctx.moveTo(lx * u, -7 * u); ctx.lineTo(lx * u, 7 * u); ctx.stroke();
        }
      } else if (kind === 'patty') {
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        for (const [sx, sy] of [[-9, -3], [2, 3], [9, -4]]) {
          ctx.beginPath(); ctx.arc(sx * u, sy * u, 1.6 * u, 0, Math.PI * 2); ctx.fill();
        }
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath(); ctx.moveTo(-6 * u, -6 * u); ctx.quadraticCurveTo(0, -14 * u, 6 * u, -6 * u); ctx.stroke();
      }
      break;
    }
    case 'lettuce': {
      ctx.fillStyle = '#7ac74f';
      for (const [ox, oy, r] of [[-9, 0, 9], [0, -3, 10], [9, 0, 9]]) {
        ctx.beginPath(); ctx.arc(ox * u, oy * u, r * u, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = '#4e9a2f';
      ctx.lineWidth = 1.5 * u;
      ctx.beginPath(); ctx.moveTo(-12 * u, 2 * u); ctx.quadraticCurveTo(0, -6 * u, 12 * u, 2 * u); ctx.stroke();
      break;
    }
    case 'lettuceChopped': {
      ctx.strokeStyle = '#7ac74f';
      ctx.lineWidth = 4 * u;
      ctx.lineCap = 'round';
      for (const [x1, y1, x2, y2] of [[-14, -6, -2, -8], [-6, 2, 6, -2], [-2, 8, 12, 6], [4, -10, 14, -12]]) {
        ctx.beginPath(); ctx.moveTo(x1 * u, y1 * u); ctx.lineTo(x2 * u, y2 * u); ctx.stroke();
      }
      break;
    }
    case 'tomato': {
      ctx.fillStyle = '#e8483f';
      ctx.beginPath(); ctx.arc(0, 1 * u, 14 * u, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.arc(-5 * u, -4 * u, 4 * u, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4e9a2f';
      ctx.beginPath(); ctx.moveTo(-4 * u, -12 * u); ctx.lineTo(4 * u, -12 * u); ctx.lineTo(0, -6 * u); ctx.closePath(); ctx.fill();
      break;
    }
    case 'tomatoChopped': {
      ctx.fillStyle = '#f0604f';
      for (const rot of [0, Math.PI * 0.66, Math.PI * 1.33]) {
        ctx.save(); ctx.rotate(rot);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 13 * u, -0.5, 0.5); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#ffd9d0';
      ctx.beginPath(); ctx.arc(0, 0, 3 * u, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'cheese': {
      ctx.fillStyle = '#ffc93c';
      ctx.beginPath(); ctx.moveTo(-16 * u, 10 * u); ctx.lineTo(16 * u, 10 * u); ctx.lineTo(0, -12 * u); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e0a100';
      for (const [hx, hy] of [[-4, 4], [5, 5], [0, -3]]) {
        ctx.beginPath(); ctx.arc(hx * u, hy * u, 2.2 * u, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'onion': {
      ctx.strokeStyle = '#c9a7e8';
      ctx.lineWidth = 3.5 * u;
      for (const r of [6, 10, 14]) {
        ctx.beginPath(); ctx.arc(0, 1 * u, r * u, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = '#9b7ede';
      ctx.beginPath(); ctx.arc(0, 1 * u, 3 * u, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'onionChopped': {
      ctx.strokeStyle = '#d9c2f2';
      ctx.lineWidth = 3 * u;
      for (const [ox, oy, r] of [[-8, -4, 5], [6, -6, 4], [0, 6, 5], [9, 5, 3.5]]) {
        ctx.beginPath(); ctx.arc(ox * u, oy * u, r * u, 0, Math.PI * 2); ctx.stroke();
      }
      break;
    }
    case 'potato': {
      ctx.fillStyle = '#d9b380';
      ctx.beginPath(); ctx.ellipse(0, 0, 15 * u, 11 * u, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a97f4e';
      for (const [dx, dy] of [[-6, -3], [4, 2], [8, -4]]) {
        ctx.beginPath(); ctx.arc(dx * u, dy * u, 1.6 * u, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'potatoChopped': {
      ctx.fillStyle = '#f2d8a0';
      ctx.strokeStyle = '#c9a35e';
      ctx.lineWidth = 1.5 * u;
      for (const [ox, oy] of [[-9, -6], [4, -7], [-3, 5], [8, 4]]) {
        roundRect(ctx, ox * u, oy * u, 11 * u, 11 * u, 2 * u);
        ctx.fill(); ctx.stroke();
      }
      break;
    }
    case 'fries':
    case 'friesBurnt': {
      const stick = kind === 'fries' ? '#ffd94d' : '#3a2e22';
      ctx.strokeStyle = stick;
      ctx.lineWidth = 4.5 * u;
      ctx.lineCap = 'round';
      for (const [x1, y1, x2, y2] of [[-11, 4, -13, -14], [-4, 6, -4, -16], [3, 6, 5, -15], [10, 4, 13, -12]]) {
        ctx.beginPath(); ctx.moveTo(x1 * u, y1 * u); ctx.lineTo(x2 * u, y2 * u); ctx.stroke();
      }
      ctx.fillStyle = '#e4572e';
      ctx.beginPath(); ctx.moveTo(-15 * u, -2 * u); ctx.lineTo(15 * u, -2 * u); ctx.lineTo(11 * u, 14 * u); ctx.lineTo(-11 * u, 14 * u); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff6e6';
      ctx.beginPath(); ctx.arc(0, 6 * u, 4.5 * u, 0, Math.PI * 2); ctx.fill();
      break;
    }
    default:
      ctx.fillStyle = '#888';
      ctx.fillRect(-10 * u, -10 * u, 20 * u, 20 * u);
  }
  ctx.restore();
}

// A plate with its stacked ingredients, seen from above-ish: the plate
// ellipse, then each item drawn slightly higher than the last.
export function drawPlate(ctx, items, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#f4f6f8';
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.62, s * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c8ccd2';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.62, s * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.42, s * 0.26, 0, 0, Math.PI * 2); ctx.stroke();
  items.forEach((item, i) => {
    drawIngredientIcon(ctx, item, 0, -6 - i * Math.min(7, s * 0.12), s * 0.62);
  });
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---------------------------------------------------------------- kitchen
export function drawKitchen(ctx, g, now) {
  const { kitchen } = g;
  // Floor: warm checker tiles.
  const tile = 64;
  for (let ty = HUD_H; ty < H; ty += tile) {
    for (let tx = 0; tx < W; tx += tile) {
      const even = ((tx / tile) + (ty / tile)) % 2 === 0;
      ctx.fillStyle = even ? PAL.floorA : PAL.floorB;
      ctx.fillRect(tx, ty, tile, tile);
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let ty = HUD_H; ty < H; ty += tile) ctx.fillRect(0, ty, W, 1);
  for (let tx = 0; tx < W; tx += tile) ctx.fillRect(tx, HUD_H, 1, H - HUD_H);

  // Wall trim under the HUD.
  ctx.fillStyle = PAL.wall;
  ctx.fillRect(0, HUD_H, W, 6);

  for (const s of kitchen.stations) drawStation(ctx, g, s, now);
}

function drawStation(ctx, g, s, now) {
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  const hot = g.hotStation === s;
  // Counter body.
  ctx.fillStyle = PAL.counterSide;
  roundRect(ctx, s.x, s.y + 6, s.w, s.h, 8);
  ctx.fill();
  ctx.fillStyle = PAL.counterTop;
  roundRect(ctx, s.x, s.y, s.w, s.h - 6, 8);
  ctx.fill();
  ctx.strokeStyle = PAL.counterEdge;
  ctx.lineWidth = 2;
  roundRect(ctx, s.x, s.y, s.w, s.h - 6, 8);
  ctx.stroke();
  if (hot) {
    ctx.strokeStyle = PAL.gold;
    ctx.lineWidth = 3;
    roundRect(ctx, s.x - 3, s.y - 3, s.w + 6, s.h, 10);
    ctx.stroke();
  }

  // Label.
  ctx.fillStyle = PAL.ink;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const labelY = s.y + s.h - 8;

  switch (s.kind) {
    case 'crate': {
      drawIngredientIcon(ctx, s.item, cx, cy - 8, 44);
      ctx.fillText(s.label, cx, labelY);
      break;
    }
    case 'board': {
      // Wooden board with a knife.
      ctx.fillStyle = '#d9a05b';
      roundRect(ctx, cx - 52, cy - 26, 104, 52, 6);
      ctx.fill();
      ctx.strokeStyle = '#8a5a2b';
      ctx.lineWidth = 2;
      roundRect(ctx, cx - 52, cy - 26, 104, 52, 6);
      ctx.stroke();
      ctx.strokeStyle = '#c8ccd2';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(cx + 18, cy - 14); ctx.lineTo(cx + 48, cy - 14); ctx.stroke();
      ctx.fillStyle = '#5d3620';
      ctx.fillRect(cx + 46, cy - 17, 10, 6);
      ctx.fillText(s.label, cx, labelY);
      break;
    }
    case 'trash': {
      ctx.fillStyle = '#5b6470';
      roundRect(ctx, cx - 34, cy - 24, 68, 48, 6);
      ctx.fill();
      ctx.fillStyle = '#3d444e';
      roundRect(ctx, cx - 38, cy - 30, 76, 12, 5);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillText('TRASH', cx, cy - 2);
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText(s.label, cx, labelY);
      break;
    }
    case 'grill': {
      // Grill: dark grate, glowing coals, slots with progress rings.
      ctx.fillStyle = '#3a3f45';
      roundRect(ctx, s.x + 8, s.y + 8, s.w - 16, s.h - 34, 6);
      ctx.fill();
      ctx.strokeStyle = '#22262b';
      ctx.lineWidth = 3;
      for (let i = 1; i < 5; i += 1) {
        const gy = s.y + 8 + ((s.h - 34) / 5) * i;
        ctx.beginPath(); ctx.moveTo(s.x + 10, gy); ctx.lineTo(s.x + s.w - 10, gy); ctx.stroke();
      }
      ctx.fillStyle = '#ff7a2f';
      const flicker = 0.5 + Math.sin(now / 130) * 0.2;
      ctx.globalAlpha = 0.35 + flicker * 0.3;
      ctx.beginPath(); ctx.ellipse(cx, s.y + s.h - 30, 46, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      s.slots.forEach((slot, i) => {
        const sx = s.x + 40 + i * 80;
        const sy = s.y + 52;
        if (slot.item) {
          const state = slotState('grill', slot.t);
          drawIngredientIcon(ctx, slot.item, sx, sy, 44);
          drawCookRing(ctx, sx, sy, 30, slotProgress('grill', slot.t), state);
          if (state === 1) {
            ctx.fillStyle = PAL.green;
            ctx.font = 'bold 11px system-ui, sans-serif';
            ctx.fillText('READY', sx, sy + 34);
          } else if (state === 2) {
            ctx.fillStyle = PAL.red;
            ctx.font = 'bold 11px system-ui, sans-serif';
            ctx.fillText('BURNT!', sx, sy + 34);
          }
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.35)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.arc(sx, sy, 26, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
        }
      });
      ctx.fillText(s.label, cx, labelY);
      break;
    }
    case 'fryer': {
      ctx.fillStyle = '#8b98a3';
      roundRect(ctx, s.x + 10, s.y + 8, s.w - 20, s.h - 34, 6);
      ctx.fill();
      const slot = s.slots[0];
      const bubbling = slot.item !== null;
      ctx.fillStyle = bubbling ? '#f2b233' : '#c98f2e';
      roundRect(ctx, s.x + 18, s.y + 16, s.w - 36, s.h - 52, 5);
      ctx.fill();
      if (bubbling) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        for (let i = 0; i < 6; i += 1) {
          const bx = s.x + 30 + ((i * 23 + Math.floor(now / 90)) % (s.w - 60));
          const by = s.y + 24 + ((i * 17) % (s.h - 70));
          ctx.beginPath(); ctx.arc(bx, by, 2.5, 0, Math.PI * 2); ctx.fill();
        }
        drawIngredientIcon(ctx, slot.item, cx, s.y + 52, 40);
        const state = slotState('fryer', slot.t);
        drawCookRing(ctx, cx, s.y + 52, 28, slotProgress('fryer', slot.t), state);
        if (state === 1) {
          ctx.fillStyle = PAL.green;
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.fillText('READY', cx, s.y + 92);
        } else if (state === 2) {
          ctx.fillStyle = PAL.red;
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.fillText('BURNT!', cx, s.y + 92);
        }
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.fillText('drop chopped potato', cx, s.y + 52);
      }
      ctx.fillStyle = PAL.ink;
      ctx.fillText(s.label, cx, labelY);
      break;
    }
    case 'plates': {
      // A stack of plates.
      for (let i = 0; i < 3; i += 1) {
        ctx.fillStyle = '#f4f6f8';
        ctx.beginPath(); ctx.ellipse(cx, cy - 8 - i * 7, 42, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#c8ccd2';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(cx, cy - 8 - i * 7, 42, 12, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = PAL.ink;
      ctx.fillText(s.label, cx, labelY);
      break;
    }
    case 'counter': {
      if (s.item) {
        if (s.item.type === 'plate') drawPlate(ctx, s.item.items, cx, cy - 4, 64);
        else drawIngredientIcon(ctx, s.item.item, cx, cy - 4, 46);
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.font = 'italic 12px system-ui, sans-serif';
        ctx.fillText('set things down here', cx, cy);
      }
      ctx.fillStyle = PAL.ink;
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText(s.label, cx, labelY);
      break;
    }
    case 'window': {
      // Serving window: warm light, a bell, and a "SERVE" sign.
      ctx.fillStyle = '#ffe9b0';
      roundRect(ctx, s.x + 10, s.y + 8, s.w - 20, 52, 6);
      ctx.fill();
      ctx.fillStyle = '#c98f2e';
      ctx.beginPath(); ctx.arc(cx, s.y + 34, 12, Math.PI, 0); ctx.fill();
      ctx.fillRect(cx - 12, s.y + 34, 24, 4);
      ctx.fillStyle = '#e4572e';
      ctx.font = 'bold 17px system-ui, sans-serif';
      ctx.fillText('SERVE  ▲', cx, s.y + 82);
      ctx.fillStyle = PAL.ink;
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText(s.label, cx, labelY);
      break;
    }
    default:
      break;
  }
}

function drawCookRing(ctx, x, y, r, progress, state) {
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = state === 2 ? PAL.red : state === 1 ? PAL.green : PAL.gold;
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2); ctx.stroke();
}

// ------------------------------------------------------------------- chef
export function drawChef(ctx, g, now) {
  const { chef } = g;
  const bob = chef.moving ? Math.sin(chef.bobT) * 2 : 0;
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(chef.x, chef.y + 20, 22, 8, 0, 0, Math.PI * 2); ctx.fill();
  // Body (white chef coat + apron).
  ctx.fillStyle = '#f8f8f8';
  ctx.beginPath(); ctx.arc(chef.x, chef.y + 6 + bob, 19, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d5d5d5';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(chef.x, chef.y + 6 + bob, 19, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#4aa3df';
  roundRect(ctx, chef.x - 8, chef.y + 2 + bob, 16, 16, 4);
  ctx.fill();
  // Head.
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath(); ctx.arc(chef.x, chef.y - 14 + bob, 13, 0, Math.PI * 2); ctx.fill();
  // Eyes look toward movement.
  ctx.fillStyle = '#2b1d16';
  const ex = chef.dirX * 3;
  const ey = chef.dirY * 2;
  ctx.beginPath(); ctx.arc(chef.x - 5 + ex, chef.y - 15 + bob + ey, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(chef.x + 5 + ex, chef.y - 15 + bob + ey, 1.8, 0, Math.PI * 2); ctx.fill();
  // Toque.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(chef.x - 7, chef.y - 26 + bob, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(chef.x + 7, chef.y - 26 + bob, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(chef.x, chef.y - 29 + bob, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(chef.x - 12, chef.y - 27 + bob, 24, 5);

  // Carried item floats above the chef's hands.
  if (chef.carry) {
    const hx = chef.x + chef.dirX * 16;
    const hy = chef.y - 44 + bob;
    if (chef.carry.type === 'plate') drawPlate(ctx, chef.carry.items, hx, hy, 52);
    else drawIngredientIcon(ctx, chef.carry.item, hx, hy, 40);
  }
  // Chop progress ring while chopping.
  if (chef.chopProgress > 0) {
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(chef.x, chef.y - 44, 24, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = PAL.green;
    ctx.beginPath(); ctx.arc(chef.x, chef.y - 44, 24, -Math.PI / 2, -Math.PI / 2 + chef.chopProgress * Math.PI * 2); ctx.stroke();
    ctx.fillStyle = PAL.ink;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CHOPPING…', chef.x, chef.y - 72);
  }
}

// -------------------------------------------------------------------- HUD
export function drawHUD(ctx, g, now) {
  // Bar.
  ctx.fillStyle = PAL.hud;
  ctx.fillRect(0, 0, W, HUD_H);
  ctx.fillStyle = PAL.hudPanel;
  ctx.fillRect(0, HUD_H - 4, W, 4);

  // Order tickets.
  const ticketW = 196;
  g.board.orders.forEach((order, i) => {
    drawOrderTicket(ctx, order, 16 + i * (ticketW + 8), 8, ticketW, 64, now);
  });
  if (g.board.orders.length === 0) {
    ctx.fillStyle = 'rgba(255,246,230,0.55)';
    ctx.font = 'italic 14px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('No orders yet — the lunch rush is coming…', 16, 46);
  }

  // Shift timer (centre-right).
  const tx = 900;
  const remain = Math.max(0, g.shiftLeft);
  const mm = Math.floor(remain / 60);
  const ss = Math.floor(remain % 60);
  const urgent = remain <= 30;
  ctx.fillStyle = urgent && Math.floor(now / 400) % 2 === 0 ? PAL.red : PAL.cream;
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${mm}:${String(ss).padStart(2, '0')}`, tx, 40);
  ctx.fillStyle = 'rgba(255,246,230,0.6)';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText(`SHIFT · LV ${g.level}`, tx, 58);
  // Shift progress bar.
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  roundRect(ctx, tx - 70, 64, 140, 6, 3);
  ctx.fill();
  ctx.fillStyle = PAL.gold;
  const frac = 1 - remain / g.shiftTotal;
  roundRect(ctx, tx - 70, 64, 140 * frac, 6, 3);
  ctx.fill();

  // Coins, combo, hearts (right).
  ctx.textAlign = 'right';
  ctx.fillStyle = PAL.gold;
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillText(`$${g.coins}`, 1264, 38);
  ctx.fillStyle = 'rgba(255,246,230,0.6)';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('EARNED', 1264, 56);
  // Combo.
  if (g.combo >= 2) {
    ctx.fillStyle = PAL.orange;
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText(`COMBO x${g.comboMultiplier.toFixed(2).replace(/0$/, '')}  (${g.combo} in a row)`, 1264, 72);
  }
  // Hearts.
  ctx.textAlign = 'left';
  for (let i = 0; i < g.maxHearts; i += 1) {
    const hx = 1030 + i * 26;
    drawHeart(ctx, hx, 26, 10, i < g.hearts ? PAL.red : 'rgba(255,255,255,0.22)');
  }
  ctx.fillStyle = 'rgba(255,246,230,0.6)';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('FAILED ORDERS', 1030, 52);

  // Rush banner.
  if (g.board.rush) {
    const pulse = 0.75 + Math.sin(now / 120) * 0.25;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = PAL.red;
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ RUSH HOUR — ORDERS ARE POURING IN ⚡', W / 2, HUD_H + 108);
    ctx.globalAlpha = 1;
  }

}

function drawOrderTicket(ctx, order, x, y, w, h, now) {
  const frac = Math.max(0, order.patience / order.patienceMax);
  const urgent = order.patience <= 10;
  const flash = urgent && Math.floor(now / 300) % 2 === 0;
  ctx.fillStyle = flash ? '#ffe1d6' : '#fff6e6';
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = urgent ? PAL.red : '#d9c9a8';
  ctx.lineWidth = urgent ? 3 : 1.5;
  roundRect(ctx, x, y, w, h, 8);
  ctx.stroke();
  // Recipe name + price.
  ctx.fillStyle = PAL.ink;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(order.recipe.name, x + 8, y + 17);
  ctx.fillStyle = PAL.green;
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`$${order.recipe.price}`, x + w - 8, y + 17);
  // Ingredient icons.
  const needs = recipeNeeds(order.recipe);
  const kinds = Object.keys(needs);
  kinds.forEach((kind, i) => {
    const ix = x + 20 + i * 30;
    drawIngredientIcon(ctx, kind, ix, y + 36, 26);
    if (needs[kind] > 1) {
      ctx.fillStyle = PAL.ink;
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`x${needs[kind]}`, ix + 10, y + 30);
    }
  });
  // Patience bar.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  roundRect(ctx, x + 8, y + h - 10, w - 16, 5, 2.5);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? PAL.green : frac > 0.25 ? PAL.orange : PAL.red;
  roundRect(ctx, x + 8, y + h - 10, (w - 16) * frac, 5, 2.5);
  ctx.fill();
}

function drawHeart(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.9);
  ctx.bezierCurveTo(x - s * 1.2, y, x - s * 0.5, y - s, x, y - s * 0.3);
  ctx.bezierCurveTo(x + s * 0.5, y - s, x + s * 1.2, y, x, y + s * 0.9);
  ctx.fill();
}

// ------------------------------------------------------------- particles
export function drawParticles(ctx, particles) {
  for (const p of particles.puffs) {
    ctx.globalAlpha = 1 - p.t / p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  for (const p of particles.popups) {
    const rise = p.t * 34;
    ctx.globalAlpha = 1 - p.t / p.life;
    ctx.fillStyle = p.color;
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(p.text, p.x, p.y - rise);
  }
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------ hint pill
export function drawHint(ctx, text) {
  if (!text) return;
  ctx.font = 'bold 15px system-ui, sans-serif';
  const w = ctx.measureText(text).width + 28;
  const x = (W - w) / 2;
  const y = H - 44;
  ctx.fillStyle = 'rgba(43,29,22,0.85)';
  roundRect(ctx, x, y, w, 32, 16);
  ctx.fill();
  ctx.fillStyle = PAL.cream;
  ctx.textAlign = 'center';
  ctx.fillText(text, W / 2, y + 21);
}

// ------------------------------------------------------------- screens
function dimScreen(ctx) {
  ctx.fillStyle = 'rgba(30,18,12,0.72)';
  ctx.fillRect(0, 0, W, H);
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = '#fff6e6';
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = '#d9c9a8';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 16);
  ctx.stroke();
}

export function drawTitle(ctx, g) {
  dimScreen(ctx);
  panel(ctx, 240, 90, 800, 620);
  ctx.textAlign = 'center';
  ctx.fillStyle = PAL.red;
  ctx.font = 'bold 64px system-ui, sans-serif';
  ctx.fillText('SIZZLE & SERVE', W / 2, 170);
  ctx.fillStyle = PAL.ink;
  ctx.font = 'italic 20px system-ui, sans-serif';
  ctx.fillText('One chef. One rush hour. Don’t burn the patties.', W / 2, 205);

  // Recipe book.
  ctx.fillStyle = PAL.ink;
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillText('— TODAY’S MENU —', W / 2, 250);
  const recipes = g.recipes;
  recipes.forEach((r, i) => {
    const y = 282 + i * 34;
    ctx.textAlign = 'left';
    ctx.fillStyle = PAL.ink;
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(r.name, 330, y);
    r.items.forEach((item, j) => {
      drawIngredientIcon(ctx, item, 640 + j * 30, y - 5, 24);
    });
    ctx.textAlign = 'right';
    ctx.fillStyle = PAL.green;
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(`$${r.price}`, 950, y);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = PAL.ink;
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText('Move: WASD / Arrows · Interact: E or Space · Click a station to use it · Click the floor to walk there', W / 2, 545);
  ctx.fillText('Chop on the board · Grill patties (don’t let them burn!) · Fry chopped potatoes · Serve exact plates at the window', W / 2, 570);
  ctx.fillStyle = PAL.red;
  ctx.font = 'bold 19px system-ui, sans-serif';
  const blink = Math.floor(performance.now() / 500) % 2 === 0;
  if (blink) ctx.fillText('Press ENTER to start your shift', W / 2, 615);
  if (g.best > 0) {
    ctx.fillStyle = PAL.ink;
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText(`Best shift so far: $${g.best}`, W / 2, 655);
  }
  ctx.fillStyle = 'rgba(43,29,22,0.6)';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`Goal: earn $${g.targetCoins} before the shift ends · 3 failed orders ends the shift`, W / 2, 685);
}

export function drawEnd(ctx, g) {
  dimScreen(ctx);
  const won = g.endState === 'win';
  panel(ctx, 320, 130, 640, 520);
  ctx.textAlign = 'center';
  ctx.fillStyle = won ? PAL.green : PAL.red;
  ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.fillText(won ? 'SHIFT COMPLETE!' : 'SHIFT OVER', W / 2, 210);
  ctx.fillStyle = PAL.ink;
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillText(won ? 'The lunch crowd is fed and happy.' : g.endReason, W / 2, 245);

  // Stars.
  const stars = g.stars;
  for (let i = 0; i < 3; i += 1) {
    drawStar(ctx, W / 2 - 90 + i * 90, 300, 34, i < stars ? PAL.gold : '#d9d2c4');
  }

  const rows = [
    ['Coins earned', `$${g.coins}`],
    ['Orders served', `${g.served}`],
    ['Orders failed', `${g.failed}`],
    ['Best combo', `x${g.bestCombo}`],
    ['Tips earned', `$${g.tips}`],
  ];
  rows.forEach(([label, value], i) => {
    const y = 360 + i * 34;
    ctx.textAlign = 'left';
    ctx.fillStyle = PAL.ink;
    ctx.font = '17px system-ui, sans-serif';
    ctx.fillText(label, 420, y);
    ctx.textAlign = 'right';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.fillText(value, 860, y);
  });

  ctx.fillStyle = PAL.red;
  ctx.font = 'bold 19px system-ui, sans-serif';
  const blink = Math.floor(performance.now() / 500) % 2 === 0;
  if (blink) ctx.fillText('Press R to cook again', W / 2, 580);
  if (g.best > 0) {
    ctx.fillStyle = PAL.ink;
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText(`Best shift: $${g.best}`, W / 2, 615);
  }
}

function drawStar(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(ang) * rad;
    const py = y + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

export function drawPause(ctx) {
  dimScreen(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = PAL.cream;
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.fillText('PAUSED', W / 2, H / 2 - 10);
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillText('Press P to keep cooking', W / 2, H / 2 + 30);
}
