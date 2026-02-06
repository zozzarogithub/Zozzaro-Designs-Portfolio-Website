/*
  faq.js
  ---------------------------------------------------------------------------
  Recreates the Pagedone "Tailwind FAQ Section with border layout" accordion UX
  using plain JavaScript (no Tailwind runtime, no dependencies).

  Behavior:
  - data-accordion="default-accordion" => only one item open at a time
  - Click toggles an item; open item animates via max-height
  - aria-expanded kept in sync for accessibility
  - The first item is marked .active in the HTML and will open on load

  HOW TO EDIT:
  - Update the FAQ questions/answers in the HTML blocks inserted per page.
  - If you want multiple items open, set data-accordion="always-open-accordion"
    and this script will allow multiple active items.
*/

(function(){
  const groups = Array.from(document.querySelectorAll('.accordion-group[data-accordion]'));
  if (!groups.length) return;

  const setPanelHeight = (accordion, open) => {
    const panel = accordion.querySelector('.accordion-content');
    if (!panel) return;
    if (open) {
      // Set explicit px height for smooth animation, then allow it to grow on resize.
      panel.style.maxHeight = panel.scrollHeight + 'px';
    } else {
      panel.style.maxHeight = '0px';
    }
  };

  const syncButton = (accordion, open) => {
    const btn = accordion.querySelector('.accordion-toggle');
    if (!btn) return;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  const closeAccordion = (accordion) => {
    accordion.classList.remove('active');
    syncButton(accordion, false);
    setPanelHeight(accordion, false);
  };

  const openAccordion = (accordion) => {
    accordion.classList.add('active');
    syncButton(accordion, true);
    setPanelHeight(accordion, true);
  };

  const initGroup = (group) => {
    const mode = (group.getAttribute('data-accordion') || 'default-accordion').trim();
    const allowMultiple = (mode === 'always-open-accordion');

    const accordions = Array.from(group.querySelectorAll('.accordion'));
    if (!accordions.length) return;

    // Initialize heights based on any .active items in markup.
    accordions.forEach(a => {
      const open = a.classList.contains('active');
      syncButton(a, open);
      setPanelHeight(a, open);
    });

    // Click handling (event delegation)
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('.accordion-toggle');
      if (!btn) return;

      const accordion = btn.closest('.accordion');
      if (!accordion) return;

      const isOpen = accordion.classList.contains('active');

      if (isOpen) {
        closeAccordion(accordion);
        return;
      }

      if (!allowMultiple) {
        accordions.forEach(a => { if (a !== accordion) closeAccordion(a); });
      }
      openAccordion(accordion);
    });

    // Keep heights correct on resize/orientation change
    const onResize = () => {
      accordions.forEach(a => {
        if (a.classList.contains('active')) setPanelHeight(a, true);
      });
    };
    window.addEventListener('resize', onResize, { passive: true });
  };

  groups.forEach(initGroup);
})();
