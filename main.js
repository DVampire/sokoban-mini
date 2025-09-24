// Sokoban Mini - vanilla JS
(function() {
  const level = [
    "##########",
    "#        #",
    "#  .     #",
    "#   $    #",
    "#        #",
    "#   @    #",
    "#        #",
    "#        #",
    "#        #",
    "##########"
  ];

  const H = level.length;
  const W = level[0].length;

  const game = document.getElementById('game');
  const statusEl = document.getElementById('status');
  const resetBtn = document.getElementById('resetBtn');

  game.style.gridTemplateColumns = `repeat(${W}, var(--tile))`;

  // Helper key
  const K = (r, c) => `${r},${c}`;

  // Static
  const walls = new Set();
  const goals = new Set();

  // Dynamic
  let boxes = new Set();
  let player = { r: 0, c: 0 };

  // Initial snapshot
  let initialBoxes = null;
  let initialPlayer = null;

  function parseLevel() {
    walls.clear(); goals.clear(); boxes.clear();
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        const ch = level[r][c];
        if (ch === '#') walls.add(K(r, c));
        if (ch === '.') goals.add(K(r, c));
        if (ch === '$') boxes.add(K(r, c));
        if (ch === '@') player = { r, c };
        if (ch === '*') { boxes.add(K(r, c)); goals.add(K(r, c)); }
        if (ch === '+') { goals.add(K(r, c)); player = { r, c }; }
        if (ch === ' ') { /* floor */ }
      }
    }
    initialBoxes = new Set([...boxes]);
    initialPlayer = { ...player };
  }

  function isWall(r, c) { return walls.has(K(r, c)); }
  function isGoal(r, c) { return goals.has(K(r, c)); }
  function hasBox(r, c) { return boxes.has(K(r, c)); }

  function render() {
    game.innerHTML = '';
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        const el = document.createElement('div');
        el.className = 'tile';
        if (isWall(r, c)) el.classList.add('wall');
        else el.classList.add('floor');
        if (isGoal(r, c)) el.classList.add('goal');
        if (hasBox(r, c)) el.classList.add('box');
        if (player.r === r && player.c === c) el.classList.add('player');
        game.appendChild(el);
      }
    }
  }

  function allBoxesOnGoals() {
    for (const k of boxes) if (!goals.has(k)) return false;
    return boxes.size > 0; // win only if there is at least one box
  }

  function tryMove(dx, dy) {
    if (statusEl.dataset.win === '1') return; // freeze after win

    const nr = player.r + dy;
    const nc = player.c + dx;
    if (isWall(nr, nc)) return;

    const k1 = K(nr, nc);
    if (boxes.has(k1)) {
      const nnr = nr + dy;
      const nnc = nc + dx;
      if (isWall(nnr, nnc) || boxes.has(K(nnr, nnc))) return; // blocked
      boxes.delete(k1);
      boxes.add(K(nnr, nnc));
    }
    player.r = nr; player.c = nc;
    render();

    if (allBoxesOnGoals()) {
      statusEl.textContent = 'You win! Great job!';
      statusEl.dataset.win = '1';
    }
  }

  function reset() {
    boxes = new Set([...initialBoxes]);
    player = { ...initialPlayer };
    statusEl.textContent = '';
    delete statusEl.dataset.win;
    render();
  }

  function onKey(e) {
    const k = e.key.toLowerCase();
    const map = {
      arrowleft: [-1, 0], a: [-1, 0],
      arrowright: [1, 0], d: [1, 0],
      arrowup: [0, -1], w: [0, -1],
      arrowdown: [0, 1], s: [0, 1],
    };
    if (k === 'r') { e.preventDefault(); reset(); return; }
    if (map[k]) {
      e.preventDefault();
      const [dx, dy] = map[k];
      tryMove(dx, dy);
    }
  }

  // Init
  parseLevel();
  render();
  document.addEventListener('keydown', onKey);
  resetBtn.addEventListener('click', reset);
})();
