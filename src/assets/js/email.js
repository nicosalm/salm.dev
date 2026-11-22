document.querySelectorAll("[data-email]").forEach((el) => {
    const address = el.dataset.email.split("").reverse().join("");

    if (el.dataset.emailAction === "mailto") {
        el.href = `mailto:${address}`;
        el.title = "email me";
        return;
    }

    el.setAttribute("role", "button");
    el.style.cursor = "pointer";

    el.dataset.tip = "(copy email)";
    let timer;
    el.addEventListener("click", (ev) => {
        ev.preventDefault();
        navigator.clipboard.writeText(address);
        el.dataset.tip = "(copied!)";
        const r = el.getBoundingClientRect();
        const x = ev.detail ? ev.clientX : r.right;
        const y = ev.detail ? ev.clientY : r.bottom;
        el.dispatchEvent(new CustomEvent("tip:show", { bubbles: true, detail: { x, y } }));
        clearTimeout(timer);
        timer = setTimeout(() => {
            el.dataset.tip = "(copy email)";
        }, 2000);
    });
});
