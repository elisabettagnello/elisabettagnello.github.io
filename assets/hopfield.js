/* Hero signature: ring-shaped, fully connected Hopfield network acting as associative memory.
   Nodes: +1 (accent pink) or -1 (dim white). Start from a noisy stored pattern, update
   asynchronously until it converges, rest, repeat with the next pattern. */
(function () {
  var canvas = document.getElementById("hopfield");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var N = 24;
  var ACCENT = "#d45087";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Stored patterns: blocks of +1/-1 around the ring
  function blocks(size, shift) {
    var p = [];
    for (var i = 0; i < N; i++) p.push(Math.floor(((i + shift) % N) / size) % 2 === 0 ? 1 : -1);
    return p;
  }
  var patterns = [blocks(12, 0), blocks(4, 0), blocks(3, 1)];

  // Hebbian couplings, no self-coupling
  var J = [];
  for (var i = 0; i < N; i++) {
    J.push([]);
    for (var j = 0; j < N; j++) {
      var s = 0;
      if (i !== j) for (var m = 0; m < patterns.length; m++) s += patterns[m][i] * patterns[m][j];
      J[i].push(s / N);
    }
  }

  var state = patterns[0].slice();
  var current = 0;
  var phase = "rest";   // "update" | "rest"
  var queue = [];
  var lastStep = 0, restUntil = 0, stableCount = 0;
  var running = false, rafId = 0;
  var W = 0, H = 0, cx = 0, cy = 0, R = 0, nodeR = 4;
  var pos = [];

  function layout() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var wide = W >= 720;
    cx = wide ? W * 0.74 : W * 0.5;
    cy = H * 0.5;
    R = Math.min(H * 0.44, wide ? W * 0.22 : W * 0.42);
    nodeR = Math.max(3, R * 0.045);
    pos = [];
    for (var i = 0; i < N; i++) {
      var a = (i / N) * Math.PI * 2 - Math.PI / 2;
      pos.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
    }
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.beginPath();
    for (var i = 0; i < N; i++)
      for (var j = i + 1; j < N; j++) {
        ctx.moveTo(pos[i][0], pos[i][1]);
        ctx.lineTo(pos[j][0], pos[j][1]);
      }
    ctx.stroke();
    for (var k = 0; k < N; k++) {
      ctx.beginPath();
      ctx.arc(pos[k][0], pos[k][1], nodeR, 0, Math.PI * 2);
      ctx.fillStyle = state[k] === 1 ? ACCENT : "rgba(255,255,255,0.28)";
      ctx.fill();
    }
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function startRecall() {
    current = (current + 1) % patterns.length;
    state = patterns[current].slice();
    // start from a noisy version of the pattern: flip 4 of 24 nodes
    shuffle(state.map(function (_, i) { return i; })).slice(0, 4).forEach(function (i) { state[i] = -state[i]; });
    phase = "update";
    queue = [];
    stableCount = 0;
  }

  function stepOnce() {
    if (!queue.length) queue = shuffle(state.map(function (_, i) { return i; }));
    var i = queue.pop();
    var h = 0;
    for (var j = 0; j < N; j++) h += J[i][j] * state[j];
    var next = h > 0 ? 1 : h < 0 ? -1 : state[i];
    if (next === state[i]) stableCount++; else { state[i] = next; stableCount = 0; }
    return stableCount >= N; // a full sweep without change: converged
  }

  function frame(t) {
    if (!running) return;
    if (phase === "rest") {
      if (t >= restUntil) { startRecall(); lastStep = t; draw(); }
    } else if (t - lastStep > 140) {
      lastStep = t;
      var done = stepOnce();
      draw();
      if (done) { phase = "rest"; restUntil = t + 3200; }
    }
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduce) return;
    running = true;
    restUntil = performance.now() + 1200;
    rafId = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(rafId); }

  layout();
  window.addEventListener("resize", layout);
  if (reduce) { state = patterns[1].slice(); draw(); return; }  // static converged frame
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  start();
})();
