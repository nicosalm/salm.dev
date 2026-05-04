(function () {
    const CELL_SIZE = 4;
    const RULE = 30;
    const RESIZE_DEBOUNCE_MS = 150;

    const ruleBits = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
        ruleBits[i] = (RULE >> i) & 1;
    }

    function parseHex(css) {
        let hex = css.trim().replace(/^#/, "");
        if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        const n = parseInt(hex, 16);
        if (Number.isNaN(n)) return [0x55, 0x55, 0x55];
        return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
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

    function draw(canvas, rgb) {
        const ctx = canvas.getContext("2d");
        const cols = Math.floor(canvas.clientWidth / CELL_SIZE);
        const rows = Math.floor(canvas.clientHeight / CELL_SIZE);
        if (cols === 0 || rows === 0) return;

        canvas.width = cols;
        canvas.height = rows;

        const [rr, gg, bb] = rgb;
        const imgData = ctx.createImageData(cols, rows);
        const pixels = imgData.data;

        let cur = new Uint8Array(cols);
        let next = new Uint8Array(cols);
        for (let i = 0; i < cols; i++) {
            cur[i] = Math.random() < 0.5 ? 1 : 0;
        }

        for (let y = 0; y < rows; y++) {
            const rowOff = y * cols;
            for (let x = 0; x < cols; x++) {
                if (cur[x]) {
                    const off = (rowOff + x) * 4;
                    pixels[off] = rr;
                    pixels[off + 1] = gg;
                    pixels[off + 2] = bb;
                    pixels[off + 3] = 255;
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
        const fg = getComputedStyle(document.documentElement).getPropertyValue("--text-tertiary");
        const rgb = parseHex(fg);
        document.querySelectorAll(".index-sidebar canvas, .index-banner canvas").forEach(function (c) {
            if (c.offsetParent === null) return;
            draw(c, rgb);
        });
    }

    init();

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", init);

    let resizeTimer = null;
    window.addEventListener("resize", function () {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(init, RESIZE_DEBOUNCE_MS);
    });
})();
