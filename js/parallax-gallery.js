/* Parallax gallery modal interactions
   - Keeps the gallery CSS-only for scrolling/parallax
   - Adds click-to-expand modal with title/description
*/

(function () {
  // Be resilient to markup changes: support either an id or a class.
  const modal = document.getElementById('pg-modal') || document.querySelector('.pg-modal');
  if (!modal) return;

  // Some earlier iterations used different classnames; support both to avoid null errors.
  const backdrop = modal.querySelector('.pg-modal__backdrop, .pg-modal-backdrop');
  const closeBtn = modal.querySelector('.pg-modal__close, .pg-modal-close');
  const imgEl = modal.querySelector('.pg-modal__image, .pg-modal__img, #pg-modal-img');
  const titleEl = modal.querySelector('.pg-modal__title, #pg-modal-caption, .pg-modal__caption-title');
  const descEl = modal.querySelector('.pg-modal__desc, #pg-modal-description, .pg-modal__caption-desc');

  function openModal({ src, alt, title, desc }) {
    if (!imgEl || !closeBtn) {
      console.error('[Parallax Gallery] Modal markup is missing required elements (image/close button).');
      return;
    }

    imgEl.src = src;
    imgEl.alt = alt || '';
    if (titleEl) titleEl.textContent = title || 'Image detail';
    if (descEl) descEl.textContent = desc || 'Add your caption copy here.';

    modal.classList.add('is-open');
    document.body.classList.add('pg-lock-scroll');
    closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('pg-lock-scroll');

    // Clear the image so it stops downloading/animating in the background.
    if (imgEl) imgEl.src = '';
  }

  // Delegate clicks from the gallery
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.parallax-gallery .img-wrapper a, .parallax-gallery .img-wrapper .pg-trigger, .nc-grid-gallery [data-pgmodal], .nc-grid-gallery .item');
    if (!trigger) return;

    // Only intercept navigation when the click target is a link
    if (trigger.tagName === 'A') e.preventDefault();

    const img = trigger.tagName === 'IMG' ? trigger : trigger.querySelector('img');

    // Support tiles that use background-image instead of an <img>
    let src =
      trigger.getAttribute('data-full') ||
      trigger.getAttribute('data-pg-src') ||
      trigger.getAttribute('data-src') ||
      (img ? (img.currentSrc || img.src) : '');

    if (!src) {
      // Try background-image: url("...")
      const bg = getComputedStyle(trigger).backgroundImage;
      const match = bg && bg !== 'none' ? bg.match(/url\(["']?(.+?)["']?\)/) : null;
      if (match) src = match[1];
    }

    if (!src) return;

    openModal({
      src: src,
      alt: (img && img.alt) || trigger.getAttribute('aria-label') || '',

      title: trigger.getAttribute('data-title') || trigger.getAttribute('data-label') || 'Image detail',
      desc: trigger.getAttribute('data-desc') || 'Add your caption copy here.'
    });
  });

  // Close behaviors
  if (backdrop) backdrop.addEventListener('click', closeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
})();
