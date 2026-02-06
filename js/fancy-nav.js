/*
  fancy-nav.js
  Adapted from the CodePen logic you provided.

  What it does:
  - Click burger to open fullscreen menu
  - Click X (close) or press ESC to close
  - Adds data-add-text numbering (01, 02, ...) to items, matching the demo

  NOTE:
  - This script is intentionally scoped to the new Fancy Navigation elements.
*/
(function () {
  const PATH = {
    closeToggler: ".toggler-close",
    expandableNav: ".main-nav__expandable",
    navItem: ".main-nav__item",
    openToggler: ".toggler-open",
  };

  const nav = document.querySelector(PATH.expandableNav);
  const openBtn = document.querySelector(PATH.openToggler);
  const closeBtn = document.querySelector(PATH.closeToggler);

  if (!nav || !openBtn || !closeBtn) return;

  // Number items like 01, 02, ...
  const navElems = Array.from(document.querySelectorAll(PATH.navItem));
  navElems.forEach((elem, index) => {
    // If the HTML already defines a number (ex: "4.1"), keep it.
    if (!elem.dataset.addText || elem.dataset.addText === "true") {
      elem.dataset.addText = String(index + 1).padStart(2, "0");
    }
  });

  const setAria = (isOpen) => {
    openBtn.setAttribute("aria-expanded", String(isOpen));
    nav.setAttribute("aria-hidden", String(!isOpen));
  };

  const openNav = () => {
    nav.classList.add("js-open");
    setAria(true);
  };

  const closeNav = () => {
    nav.classList.remove("js-open");
    setAria(false);
  };

  document.body.addEventListener("click", (e) => {
    const target = e.target;

    if (target.closest(PATH.openToggler)) {
      openNav();
    }

    if (target.closest(PATH.closeToggler)) {
      closeNav();
    }

    // Optional: close if user clicks outside the inner content
    if (nav.classList.contains("js-open")) {
      const clickedInside = target.closest(".main-nav__expandable-inner");
      if (target === nav && !clickedInside) closeNav();
    }
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("js-open")) {
      closeNav();
    }
  });

  // Close after clicking a link (nice UX)
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) closeNav();
  });

  // initial aria state
  setAria(false);
})();
