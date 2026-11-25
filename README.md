# Sizzle & Serve — a busy-bistro cooking game

[![Make the best cooking game](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/rungkad1111/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/rungkad1111/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

**Sizzle & Serve** is a complete, original cooking game that plays offline in a
desktop browser from its own files — no network, no build step, no external
assets. You are the only chef on a lunch shift: grab ingredients from the
crates, chop them on the board, grill patties (don't let them burn!), fry
potatoes, build each order exactly as ticketed, and serve it at the window
before the customer's patience runs out.

## How it plays

- **Move** with WASD / arrow keys, or click the floor to walk there.
- **Interact** with E / Space, or click a station when you are next to it.
  The hint bar at the bottom always tells you what E does right now.
- **Cook**: lettuce, tomato, onion and potato are chopped on the board
  (hold E); patties grill in 6 seconds and burn after 10; chopped potato
  fries in 5 seconds and burns after 9.
- **Assemble**: take a plate, then add ingredients to it from any crate or
  station. Counters hold things down while you juggle. The trash takes
  anything you regret.
- **Serve**: carry the finished plate to the Serving Window. An exact match
  pays the ticket price plus a tip scaled by the patience left, multiplied
  by your combo. A wrong dish is refused; an expired ticket costs a heart.
- **Win the shift**: earn $150 before the 3-minute shift ends. Three failed
  orders end the shift early. Orders arrive faster and recipes get longer
  as the shift goes on, and the last 15 seconds of every minute are
  **Rush Hour**. Earn up to 3 stars ($150 / $220 / $300).

Seven recipes: Classic Burger, Cheese Burger, Garden Salad, Loaded Fries,
Sunrise Burger, Double Stack, and Garden Burger — each with its own price,
so planning a route through the kitchen matters more than rushing.

## Feel

- Chopping, plating and serving answer at once: particles, floating score
  popups, screen shake on a burnt patty or a failed order.
- A timer you can feel: the shift clock turns red in the last 30 seconds,
  patience bars drain green → amber → red, and tickets flash under 10 seconds.
- Sound is synthesized live with WebAudio (sizzle, chop, ding, coin) — no
  audio files, nothing to download.

## Play it

Serve `game/` with any static server and open `index.html`, or run
`node serve.ts` and open http://localhost:8080. Press Enter to start a
shift, P to pause, R to cook again after a shift ends.

## Structure

The game's own source lives in `game/src/`, one file per job:

| File | Job |
| --- | --- |
| `config.js` | Canvas, palette, ingredients, recipes, station layout, difficulty |
| `random.js` | Seeded RNG for reproducible orders and screenshots |
| `audio.js` | Synthesized WebAudio sound effects |
| `input.js` | Keyboard and mouse input |
| `kitchen.js` | Station layout, collision, nearest-station queries |
| `orders.js` | Order tickets, patience, recipe matching |
| `chef.js` | Movement and the one thing the chef carries |
| `cooking.js` | Chopping, grilling, frying, and burning |
| `particles.js` | Score popups, steam, sparkles |
| `render.js` | All canvas drawing: kitchen, food, chef, HUD, screens |
| `shots.js` | Deterministic screenshot staging from real game state |
| `main.js` | Game state, loop, interactions, scoring |

`main.ts` (Node 22, standard library only) hands the entry in: it copies
`game/` and `screenshots/` to `/output` and writes `dossier.json` with the
kit's `vendor/makefun-game.ts`.

## Entry

Built for the make.fun bounty
[Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137)
(`best-cooking-game-20261125-0137`). License: MIT.
