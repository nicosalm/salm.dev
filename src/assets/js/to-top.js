const toTop = document.querySelector(".to-top");

if (toTop) {
    const update = () => toTop.classList.toggle("visible", window.scrollY > window.innerHeight);
    window.addEventListener("scroll", update, { passive: true });
    update();
}
