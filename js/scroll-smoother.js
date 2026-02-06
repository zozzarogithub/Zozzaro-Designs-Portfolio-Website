/*
  ScrollSmoother bootstrap (site-wide)
  -----------------------------------
  Matches the CodePen pattern:
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
    ScrollSmoother.create({ smooth: 3, effects: true })

  Notes:
  - We keep the global header outside smoother wrappers to preserve its sticky behavior.
  - We measure header height and set CSS var --site-header-h so content is never hidden underneath it.
  - We add a subtle fade-in animation to hero titles/banners.

  External scripts are loaded in HTML (deferred) in this order:
    1) gsap.min.js
    2) ScrollSmoother.min.js
    3) ScrollTrigger.min.js
*/

(function(){
  // Respect reduced-motion: keep native scrolling and skip animations.
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Fail safe: if GSAP isn't available, do nothing.
  if (!window.gsap || !window.ScrollSmoother || !window.ScrollTrigger) return;

  // Match the CodePen setup.
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  gsap.config({ trialWarn: false });

  // Header height -> CSS variable, so smoother content starts below it.
  const header = document.querySelector('header');
  const setHeaderVar = () => {
    const h = header ? header.offsetHeight : 0;
    document.documentElement.style.setProperty('--site-header-h', h ? `${h}px` : '0px');
  };
  setHeaderVar();
  window.addEventListener('resize', setHeaderVar);

  // Create smoother
  // NOTE: ScrollSmoother expects a wrapper/content pair.
  // The GSAP docs default to IDs: #smooth-wrapper + #smooth-content.
  // We pass them explicitly to avoid "needs a valid content element" if anything changes.
  const smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 3,
    effects: true
  });

  /* ------------------------------------------------------------------
     Parallax / overlap layout integration
     ------------------------------------------------------------------
     The GreenSock demo (NWXmPdJ) achieves its look via:
       - text blocks positioned over large images
       - elements moving at different speeds (data-speed / effects)
       - lots of “negative space” (no boxed cards)

     Your site previously used .panel as a rounded “card”. The CSS now makes
     panels transparent by default, and we selectively preserve “card” styling
     for advanced interactive sections via `.keep-panel`.

     We also dynamically convert simple content panels into GSAP “scenes” that
     mimic the demo layout, WITHOUT touching your global header/footer.
  */

  const isAdvancedPanel = (panel) => {
    // If any of these are present, we DO NOT restructure the panel.
    // These map to your “do not change behavior/layout” list.
    const advancedSelectors = [
      '.marquee', '.marquee-wrapper',
      '.accordion', '.image-accordion',
      '.client-grid',
      '.parallax', '.horizontal-parallax', '.parallax-gallery',
      '.bottom-photo-gallery',
      '.gallery', '.gallery-grid',
      '.carousel', '.slider', '.swiper',
      '.projects-row',
      'form', '.contact-form',
      '.modal',
      // University projects subpages include custom parallax galleries
      '.parallax-wrapper', '.panels',
    ];
    return advancedSelectors.some(sel => panel.querySelector(sel));
  };

  const enhancePanelsToScenes = () => {
    const panels = Array.from(document.querySelectorAll('main .panel'));
    let sceneIndex = 0;

    panels.forEach((panel) => {
      if (isAdvancedPanel(panel)){
        panel.classList.add('keep-panel');
        return;
      }

      const img = panel.querySelector('.media img, img');
      const heading = panel.querySelector('h1, h2, h3');
      if (!img || !heading) return;

      // Avoid double-processing.
      if (panel.classList.contains('gsap-scene')) return;

      // Gather nodes we want in the overlap header.
      const overlapNodes = [];
      // Move the first heading and up to 2 following paragraphs.
      overlapNodes.push(heading);
      let next = heading.nextElementSibling;
      let pCount = 0;
      while (next && pCount < 2){
        if (next.tagName && next.tagName.toLowerCase() === 'p'){
          overlapNodes.push(next);
          pCount++;
        }
        next = next.nextElementSibling;
      }

      // --------------------------------------------------------------
      // Create a "photocopy" scene structure that matches NWXmPdJ.
      // --------------------------------------------------------------
      // We keep your content, but wrap it using the same class names
      // and the same left/right alternating grid composition.
      //
      // Demo structure:
      //   section.wrapper
      //     article
      //       header.overlapping|reverse-overlapping
      //       .video-bg.overlapping-video-bg|reverse-overlapping-video-bg

      // Mark this panel as a scene and also as a demo "wrapper".
      panel.classList.add('wrapper');

      const article = document.createElement('article');

      const headerEl = document.createElement('header');
      const isReverse = (sceneIndex % 2) === 1;
      headerEl.className = isReverse ? 'reverse-overlapping' : 'overlapping';
      headerEl.setAttribute('data-speed', '1.25');

      overlapNodes.forEach(n => headerEl.appendChild(n));

      const videoBg = document.createElement('div');
      videoBg.className = 'video-bg ' + (isReverse ? 'reverse-overlapping-video-bg' : 'overlapping-video-bg');

      const imageParent = document.createElement('div');
      imageParent.className = 'image-parent';
      const imageChild = document.createElement('div');
      imageChild.className = 'image-child';

      // Preserve the existing image element (src, alt, etc.)
      img.setAttribute('data-speed', 'auto');
      imageChild.appendChild(img);
      imageParent.appendChild(imageChild);
      videoBg.appendChild(imageParent);

      // Add the same decorative SVG from the demo (purely visual).
      // This does NOT affect your images and has pointer-events: none.
      const svgWrap = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgWrap.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgWrap.setAttribute('viewBox', '0 0 104.761 104.76');
      svgWrap.innerHTML = `
        <g data-name="Group 2">
          <path data-name="Rectangle 7" fill="#fff" d="M17.38 20.88h63v62h-63z"/>
          <path data-name="Path 1" d="M52.38-.002a52.38 52.38 0 1 0 52.38 52.38A52.38 52.38 0 0 0 52.38-.002ZM38.11 26.819a6.284 6.284 0 0 1 3.148.8l33.577 19.432a6.1 6.1 0 0 1 0 10.577l-33.577 19.47a6.054 6.054 0 0 1-9.024-5.372v-38.78a6.079 6.079 0 0 1 5.876-6.128Z" fill="#6bb0e4"/>
        </g>`;
      videoBg.appendChild(svgWrap);

      // Anything left in the panel becomes below-content, but we keep it
      // OUTSIDE the grid (like a normal flow section) so the scene itself
      // stays true to the demo.
      const below = document.createElement('div');
      below.className = 'scene-below';
      // Move remaining children (if any)
      while (panel.firstChild){
        // By now, overlapNodes + img have been moved out of panel already.
        below.appendChild(panel.firstChild);
      }

      article.appendChild(headerEl);
      article.appendChild(videoBg);
      // Only append below if it has meaningful content.
      panel.appendChild(article);
      if (below.textContent && below.textContent.trim().length > 0) panel.appendChild(below);
      panel.classList.add('gsap-scene');
      sceneIndex++;
    });
  };

  enhancePanelsToScenes();

  // Parallax “effects” for safe imagery.
  try{
    smoother.effects('.hero img, .panel.gsap-scene img', { speed: 'auto' });
  }catch(e){}

  // Reveal / overlap animations (demo-like: subtle and scroll-tied)
  gsap.utils.toArray('.panel.gsap-scene').forEach((scene) => {
    const header = scene.querySelector('.overlapping, .reverse-overlapping');
    const imgChild = scene.querySelector('.image-child');

    if (header){
      gsap.fromTo(header, { autoAlpha: 0, y: 22 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: { trigger: scene, start: 'top 75%' }
      });
    }

    if (imgChild){
      gsap.fromTo(imgChild, { scale: 1.08, y: 25 }, {
        scale: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: scene,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  });

  // (Parallax effects moved above to only target safe imagery.)

  // Hero fade-in (banner + title)
  const heroes = document.querySelectorAll('.hero');
  heroes.forEach((hero) => {
    const title = hero.querySelector('.hero-title');
    const banner = hero.querySelector('.hero-banner');

    if (title){
      gsap.fromTo(title, { autoAlpha: 0, y: 18 }, {
        autoAlpha: 1,
        y: 0,
        duration: 3,
        ease: 'power2.out',
        scrollTrigger: { trigger: hero, start: 'top 80%' }
      });
    }
    if (banner){
      gsap.fromTo(banner, { autoAlpha: 0, y: 12 }, {
        autoAlpha: 1,
        y: 0,
        duration: 3,
        ease: 'power2.out',
        scrollTrigger: { trigger: hero, start: 'top 80%' }
      });
    }
  });

})();
