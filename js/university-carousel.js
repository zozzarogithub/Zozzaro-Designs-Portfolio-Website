
/* University Projects Carousel
   Ported from the CodePen logic, but scoped to this carousel so it doesn't
   hijack clicks elsewhere on the site. */

(function () {
  const slider = document.querySelector('.projects-carousel .slider');
  if (!slider) return;

  function shiftNext() {
    const items = slider.querySelectorAll('.item');
    if (items.length) slider.append(items[0]);
  }

  function shiftPrev() {
    const items = slider.querySelectorAll('.item');
    if (items.length) slider.prepend(items[items.length - 1]);
  }

  document.addEventListener('click', function (e) {
    const nextBtn = e.target.closest('.projects-carousel .next');
    const prevBtn = e.target.closest('.projects-carousel .prev');
    if (nextBtn) shiftNext();
    if (prevBtn) shiftPrev();
  }, false);
})();
