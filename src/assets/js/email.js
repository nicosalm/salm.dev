document.querySelectorAll("[data-email]").forEach((el) => {
    const address = el.dataset.email.split("").reverse().join("");

    if (el.dataset.emailAction === "mailto") {
        el.href = `mailto:${address}`;
        el.title = "email me";
        return;
    }

    el.setAttribute("role", "button");
    el.style.cursor = "pointer";

    const label = el.querySelector(".copy-label");
    if (!label) el.title = "copy email";
    let timer;
    el.addEventListener("click", (ev) => {
        ev.preventDefault();
        navigator.clipboard.writeText(address);
        if (label) label.textContent = "copied";
        else el.title = "copied";
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (label) label.textContent = "copy";
            else el.title = "copy email";
        }, 2000);
    });
});
