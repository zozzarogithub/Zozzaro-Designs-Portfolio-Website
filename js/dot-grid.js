/* ==========================================================
   DOT GRID REACTIVE BACKGROUND (Vanilla JS)
   Ported from ReactBits DotGrid component (canvas + GSAP tweens).
   Settings match the "Customize" values provided by Mr. Zozzaro.
   ========================================================== */

(function () {
  const DEFAULTS = {
    dotSize: 6,
    gap: 12,
    baseColor: "#200e56",
    activeColor: "#ff0fff",
    proximity: 120,
    speedTrigger: 100,
    shockRadius: 250,
    shockStrength: 5,
    maxSpeed: 5000,
    resistance: 750,
    returnDuration: 1.5
  };

  function throttle(func, limit) {
    let lastCall = 0;
    return function (...args) {
      const now = performance.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        func.apply(this, args);
      }
    };
  }

  function hexToRgb(hex) {
    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return { r: 0, g: 0, b: 0 };
    return {
      r: parseInt(m[1], 16),
      g: parseInt(m[2], 16),
      b: parseInt(m[3], 16)
    };
  }

  class DotGridBackground {
    constructor(rootEl, opts = {}) {
      this.opts = { ...DEFAULTS, ...opts };
      this.rootEl = rootEl;
      this.wrapEl = rootEl.querySelector(".dot-grid__wrap");
      this.canvas = rootEl.querySelector(".dot-grid__canvas");
      this.ctx = this.canvas.getContext("2d");

      this.dots = [];
      this.rafId = null;

      this.pointer = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        speed: 0,
        lastTime: 0,
        lastX: 0,
        lastY: 0
      };

      this.baseRgb = hexToRgb(this.opts.baseColor);
      this.activeRgb = hexToRgb(this.opts.activeColor);

      // Prebuild circle path for performance
      this.circlePath = (window.Path2D)
        ? (() => {
            const p = new Path2D();
            p.arc(0, 0, this.opts.dotSize / 2, 0, Math.PI * 2);
            return p;
          })()
        : null;

      this._onMove = this._onMove.bind(this);
      this._onClick = this._onClick.bind(this);
      this._draw = this._draw.bind(this);
      this._buildGrid = this._buildGrid.bind(this);
    }

    init() {
      if (!this.circlePath) return; // very old browsers only

      this._buildGrid();

      // Observe resize for correct grid density
      if ("ResizeObserver" in window) {
        this.ro = new ResizeObserver(this._buildGrid);
        this.ro.observe(this.wrapEl);
      } else {
        window.addEventListener("resize", this._buildGrid);
      }

      // React to cursor and clicks (canvas has pointer-events: none)
      this.throttledMove = throttle(this._onMove, 50);
      window.addEventListener("mousemove", this.throttledMove, { passive: true });
      window.addEventListener("click", this._onClick);

      // Touch support (mobile): treat touch as pointer
      window.addEventListener("touchmove", this._onMove, { passive: true });
      window.addEventListener("touchstart", this._onClick, { passive: true });

      this._draw();
    }

    destroy() {
      cancelAnimationFrame(this.rafId);
      if (this.ro) this.ro.disconnect();
      window.removeEventListener("resize", this._buildGrid);
      window.removeEventListener("mousemove", this.throttledMove);
      window.removeEventListener("click", this._onClick);
      window.removeEventListener("touchmove", this._onMove);
      window.removeEventListener("touchstart", this._onClick);
    }

    _buildGrid() {
      const wrap = this.wrapEl;
      const canvas = this.canvas;
      if (!wrap || !canvas) return;

      const { width, height } = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Reset transform so scale doesn't stack
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);

      const { dotSize, gap } = this.opts;

      const cols = Math.floor((width + gap) / (dotSize + gap));
      const rows = Math.floor((height + gap) / (dotSize + gap));
      const cell = dotSize + gap;

      const gridW = cell * cols - gap;
      const gridH = cell * rows - gap;

      const extraX = width - gridW;
      const extraY = height - gridH;

      const startX = extraX / 2 + dotSize / 2;
      const startY = extraY / 2 + dotSize / 2;

      const dots = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cx = startX + x * cell;
          const cy = startY + y * cell;
          dots.push({ cx, cy, xOffset: 0, yOffset: 0, _animating: false });
        }
      }
      this.dots = dots;
    }

    _draw() {
      const canvas = this.canvas;
      if (!canvas) return;

      // Clear using CSS pixel coordinates (ctx already scaled)
      const { width, height } = this.wrapEl.getBoundingClientRect();
      this.ctx.clearRect(0, 0, width, height);

      const { x: px, y: py } = this.pointer;
      const { proximity, baseColor } = this.opts;
      const proxSq = proximity * proximity;

      for (const dot of this.dots) {
        const ox = dot.cx + dot.xOffset;
        const oy = dot.cy + dot.yOffset;

        const dx = dot.cx - px;
        const dy = dot.cy - py;
        const dsq = dx * dx + dy * dy;

        let fill = baseColor;

        if (dsq <= proxSq) {
          const dist = Math.sqrt(dsq);
          const t = 1 - dist / proximity;

          const r = Math.round(this.baseRgb.r + (this.activeRgb.r - this.baseRgb.r) * t);
          const g = Math.round(this.baseRgb.g + (this.activeRgb.g - this.baseRgb.g) * t);
          const b = Math.round(this.baseRgb.b + (this.activeRgb.b - this.baseRgb.b) * t);

          fill = `rgb(${r},${g},${b})`;
        }

        this.ctx.save();
        this.ctx.translate(ox, oy);
        this.ctx.fillStyle = fill;
        this.ctx.fill(this.circlePath);
        this.ctx.restore();
      }

      this.rafId = requestAnimationFrame(this._draw);
    }

    _evtPoint(e) {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top, clientX, clientY };
    }

    _onMove(e) {
      const now = performance.now();
      const pr = this.pointer;

      const pt = this._evtPoint(e);
      const dt = pr.lastTime ? now - pr.lastTime : 16;

      const dx = pt.clientX - pr.lastX;
      const dy = pt.clientY - pr.lastY;

      let vx = (dx / dt) * 1000;
      let vy = (dy / dt) * 1000;

      let speed = Math.hypot(vx, vy);
      if (speed > this.opts.maxSpeed) {
        const scale = this.opts.maxSpeed / speed;
        vx *= scale;
        vy *= scale;
        speed = this.opts.maxSpeed;
      }

      pr.lastTime = now;
      pr.lastX = pt.clientX;
      pr.lastY = pt.clientY;
      pr.vx = vx;
      pr.vy = vy;
      pr.speed = speed;

      pr.x = pt.x;
      pr.y = pt.y;

      // Apply motion "kick" to nearby dots when moving fast
      if (!window.gsap) return;

      const { proximity, speedTrigger, resistance, returnDuration } = this.opts;

      for (const dot of this.dots) {
        const dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);

        if (speed > speedTrigger && dist < proximity && !dot._animating) {
          dot._animating = true;
          window.gsap.killTweensOf(dot);

          // Push direction: away from pointer + a small contribution from velocity
          const pushX = (dot.cx - pr.x) + vx * 0.005;
          const pushY = (dot.cy - pr.y) + vy * 0.005;

          // A simple "inertia-like" motion (no Club GSAP plugin needed)
          const dur = Math.min(0.8, Math.max(0.18, (Math.hypot(pushX, pushY) / resistance)));

          window.gsap.to(dot, {
            xOffset: pushX,
            yOffset: pushY,
            duration: dur,
            ease: "power2.out",
            onComplete: () => {
              window.gsap.to(dot, {
                xOffset: 0,
                yOffset: 0,
                duration: returnDuration,
                ease: "elastic.out(1,0.75)",
                onComplete: () => (dot._animating = false)
              });
            }
          });
        }
      }
    }

    _onClick(e) {
      if (!window.gsap) return;

      const pt = this._evtPoint(e);
      const { shockRadius, shockStrength, resistance, returnDuration } = this.opts;

      for (const dot of this.dots) {
        const dist = Math.hypot(dot.cx - pt.x, dot.cy - pt.y);
        if (dist < shockRadius && !dot._animating) {
          dot._animating = true;
          window.gsap.killTweensOf(dot);

          const falloff = Math.max(0, 1 - dist / shockRadius);
          const pushX = (dot.cx - pt.x) * shockStrength * falloff;
          const pushY = (dot.cy - pt.y) * shockStrength * falloff;

          const dur = Math.min(0.9, Math.max(0.2, (Math.hypot(pushX, pushY) / resistance)));

          window.gsap.to(dot, {
            xOffset: pushX,
            yOffset: pushY,
            duration: dur,
            ease: "power2.out",
            onComplete: () => {
              window.gsap.to(dot, {
                xOffset: 0,
                yOffset: 0,
                duration: returnDuration,
                ease: "elastic.out(1,0.75)",
                onComplete: () => (dot._animating = false)
              });
            }
          });
        }
      }
    }
  }

  function boot() {
    const bg = document.querySelector(".dot-grid-bg");
    if (!bg) return;
    // Prevent duplicate init if a page re-runs scripts
    if (bg._dotGridInstance) return;

    const inst = new DotGridBackground(bg, DEFAULTS);
    bg._dotGridInstance = inst;
    inst.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
