/*
  nav.js
  - Hamburger toggles the drawer.
  - "Recent Clients" toggles a second-level menu (desktop + mobile).
  - Keyboard friendly: Escape closes.
  - TIP: If you add new pages, update the nav HTML in each page template.
*/
(function () {
  const btn = document.querySelector("[data-menu-button]");
  const drawer = document.querySelector("[data-nav-drawer]");
  const overlay = document.querySelector("[data-nav-overlay]");
  const closeBtn = document.querySelector("[data-nav-close]");

  const submenuParent = drawer ? drawer.querySelector(".has-submenu") : null;
  const submenuLink = submenuParent ? submenuParent.querySelector("a") : null;

  function openMenu() {
    drawer.setAttribute("aria-hidden", "false");
    overlay.dataset.open = "true";
    btn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    drawer.setAttribute("aria-hidden", "true");
    overlay.dataset.open = "false";
    btn.setAttribute("aria-expanded", "false");
    if (submenuParent) submenuParent.dataset.open = "false";
    document.body.style.overflow = "";
  }

  function toggleSubmenu(force) {
    if (!submenuParent) return;
    const isOpen = submenuParent.dataset.open === "true";
    const next = (force !== undefined) ? force : !isOpen;
    submenuParent.dataset.open = next ? "true" : "false";
    if (submenuLink) submenuLink.setAttribute("aria-expanded", next ? "true" : "false");
  }

  if (btn && drawer && overlay) {
    btn.addEventListener("click", () => {
      const isOpen = drawer.getAttribute("aria-hidden") === "false";
      if (isOpen) closeMenu();
      else openMenu();
    });

    overlay.addEventListener("click", closeMenu);
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.getAttribute("aria-hidden") === "false") {
        closeMenu();
      }
    });

    // Active link highlight
    const path = (location.pathname.split("/").pop() || "start-here.html").toLowerCase();
    drawer.querySelectorAll("a").forEach(a => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (href === path) a.setAttribute("aria-current", "page");
    });

    // Click "Recent Clients" to toggle submenu (desktop + mobile).
    if (submenuLink) {
      submenuLink.addEventListener("click", (e) => {
        const open = submenuParent.dataset.open === "true";
        if (!open) {
          e.preventDefault();
          toggleSubmenu(true);
        } else {
          toggleSubmenu(false);
        }
      });

      // Hover still works, but click makes it stable.
      submenuParent.addEventListener("mouseenter", () => toggleSubmenu(true));
      submenuParent.addEventListener("mouseleave", () => toggleSubmenu(false));
    }
  }
})();
