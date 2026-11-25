// Sizzle & Serve — particles: floating score popups, steam puffs, and
// sparkles. Purely cosmetic; nothing here touches the simulation.
export function createParticles() {
  return { popups: [], puffs: [] };
}

export function addPopup(particles, x, y, text, color) {
  particles.popups.push({ x, y, text, color, t: 0, life: 1.4 });
}

export function addPuff(particles, x, y, color, count = 1) {
  for (let i = 0; i < count; i += 1) {
    particles.puffs.push({
      x: x + (Math.random() - 0.5) * 24,
      y: y + (Math.random() - 0.5) * 10,
      vy: -18 - Math.random() * 22,
      r: 3 + Math.random() * 5,
      color,
      t: 0,
      life: 0.9 + Math.random() * 0.6,
    });
  }
}

export function updateParticles(particles, dt) {
  for (const p of particles.popups) p.t += dt;
  particles.popups = particles.popups.filter((p) => p.t < p.life);
  for (const p of particles.puffs) {
    p.t += dt;
    p.y += p.vy * dt;
    p.r += dt * 6;
  }
  particles.puffs = particles.puffs.filter((p) => p.t < p.life);
}
