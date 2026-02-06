/*
  accordion.js
  - Desktop: hover expands via CSS. Click navigates (regular <a> link).
  - Touch/mobile: first tap expands the item (prevents navigation),
    second tap on the already-expanded item follows the link.

  HOW TO EDIT:
  - If you want different links per tile, change the href in start-here.html.
*/
(function(){
  const items = Array.from(document.querySelectorAll(".accordion .accordion__item"));
  if (!items.length) return;

  const setActive = (li) => {
    items.forEach(x => x.classList.remove("accordion__item_active"));
    li.classList.add("accordion__item_active");
  };

  // Desktop hover: keep active state synced for better UX
  items.forEach(li => {
    li.addEventListener("mouseenter", () => setActive(li));
    li.addEventListener("focusin", () => setActive(li));
  });

  // Touch support: first tap expands, second tap navigates
  const isTouch = () => window.matchMedia("(hover: none)").matches;

  items.forEach(li => {
    const link = li.querySelector(".accordion__link");
    if (!link) return;

    link.addEventListener("click", (e) => {
      if (!isTouch()) return; // desktop: allow normal navigation
      const already = li.classList.contains("accordion__item_active");
      if (!already) {
        e.preventDefault();
        setActive(li);
      }
      // if already active, allow navigation
    });
  });
})();
