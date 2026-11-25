// Sizzle & Serve — input: keyboard state plus mouse clicks, translated into
// one small shape the game loop reads: a move vector, an interact edge, and
// a click point. Click-to-move sets a walk target; any key press cancels it.
export function createInput(canvas) {
  const keys = new Set();
  const input = {
    moveX: 0,
    moveY: 0,
    interactHeld: false,
    interactPressed: false, // edge: true for exactly one frame after a press
    lastKey: null, // code of the last Enter/R/P/Escape press, one frame only
    clickPoint: null, // {x, y} in canvas coordinates, consumed by the game
    walkTarget: null,
    anyKeyPressed: false,
  };

  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
  };

  function refreshMoveVector() {
    const x = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0);
    const y = (keys.has('down') ? 1 : 0) - (keys.has('up') ? 1 : 0);
    input.moveX = x;
    input.moveY = y;
    if (x !== 0 || y !== 0) input.walkTarget = null;
  }

  window.addEventListener('keydown', (event) => {
    if (KEYMAP[event.code]) {
      keys.add(KEYMAP[event.code]);
      refreshMoveVector();
      event.preventDefault();
    }
    if (event.code === 'KeyE' || event.code === 'Space') {
      if (!input.interactHeld) input.interactPressed = true;
      input.interactHeld = true;
      event.preventDefault();
    }
    if (event.code === 'KeyP' || event.code === 'Escape') input.lastKey = event.code;
    if (['Enter', 'KeyR'].includes(event.code)) input.lastKey = event.code;
  });

  window.addEventListener('keyup', (event) => {
    if (KEYMAP[event.code]) {
      keys.delete(KEYMAP[event.code]);
      refreshMoveVector();
    }
    if (event.code === 'KeyE' || event.code === 'Space') input.interactHeld = false;
  });

  window.addEventListener('blur', () => {
    keys.clear();
    input.interactHeld = false;
    refreshMoveVector();
  });

  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    input.clickPoint = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  });

  // The game calls this at the end of each frame so edges fire once.
  input.endFrame = () => {
    input.interactPressed = false;
    input.lastKey = null;
    input.clickPoint = null;
  };

  return input;
}
