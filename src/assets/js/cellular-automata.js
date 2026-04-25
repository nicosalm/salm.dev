(function () {
  const CELL_SIZE = 4;
  const RULE = 30;

  const ruleBits = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    ruleBits[i] = (RULE >> i) & 1;
  }

  function nextGen(cur, next) {
    const len = cur.length;
    for (let i = 0; i < len; i++) {
      const l = cur[i === 0 ? len - 1 : i - 1];
      const c = cur[i];
      const r = cur[i === len - 1 ? 0 : i + 1];
      next[i] = ruleBits[(l << 2) | (c << 1) | r];
    }
    return next;
  }

  function draw(canvas, fg) {
    const ctx = canvas.getContext("2d");
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w;
    canvas.height = h;

    const cols = Math.floor(w / CELL_SIZE);
    const rows = Math.floor(h / CELL_SIZE);
    if (cols === 0 || rows === 0) return;

    // Parse fg color to RGB
    ctx.fillStyle = fg;
    ctx.fillRect(0, 0, 1, 1);
    const [rr, gg, bb] = ctx.getImageData(0, 0, 1, 1).data;
    ctx.clearRect(0, 0, w, h);

    const imgData = ctx.createImageData(w, h);
    const pixels = imgData.data;

    let cur = new Uint8Array(cols);
    let next = new Uint8Array(cols);
    for (let i = 0; i < cols; i++) {
      cur[i] = Math.random() < 0.5 ? 1 : 0;
    }

    for (let y = 0; y < rows; y++) {
      const py = y * CELL_SIZE;
      for (let x = 0; x < cols; x++) {
        if (cur[x]) {
          const px = x * CELL_SIZE;
          for (let dy = 0; dy < CELL_SIZE && py + dy < h; dy++) {
            for (let dx = 0; dx < CELL_SIZE && px + dx < w; dx++) {
              const off = ((py + dy) * w + (px + dx)) * 4;
              pixels[off] = rr;
              pixels[off + 1] = gg;
              pixels[off + 2] = bb;
              pixels[off + 3] = 255;
            }
          }
        }
      }
      nextGen(cur, next);
      const tmp = cur;
      cur = next;
      next = tmp;
    }

    ctx.putImageData(imgData, 0, 0);
  }

  function init() {
    const style = getComputedStyle(document.documentElement);
    const fg = style.getPropertyValue("--text-secondary").trim() || "#555";
    document.querySelectorAll(".index-sidebar canvas, .index-banner canvas").forEach(function (c) {
      if (c.offsetParent === null) return;
      draw(c, fg);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", init);

  let resizeTimer = null;
  window.addEventListener("resize", function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 150);
  });
})();
