// Liquid Glass 3-way theme switcher (adapted from https://codepen.io/fooontic/pen/KwpRaGr)
// - Injects required SVG filters once
// - Persists theme via localStorage
// - Updates the thumb animation state (data-active + c-previous)

(function () {
  "use strict";

  const STORAGE_KEY = "zozzaro_theme";
  const THEMES = ["light", "dark", "dim"];

  const setTheme = (theme) => {
    const t = THEMES.includes(theme) ? theme : "dark";
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch (_) {}
  };

  const getSavedTheme = () => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (THEMES.includes(v)) return v;
    } catch (_) {}
    return null;
  };

  const injectFilters = async () => {
    // Only inject once.
    if (document.getElementById("zozzaro-switcher-filters")) return;
    const path = "assets/switcher-filters.svg";
    try {
      const res = await fetch(path, { cache: "force-cache" });
      if (!res.ok) return;
      const svgText = await res.text();
      const wrap = document.createElement("div");
      wrap.id = "zozzaro-switcher-filters";
      wrap.style.position = "absolute";
      wrap.style.width = "0";
      wrap.style.height = "0";
      wrap.style.overflow = "hidden";
      wrap.setAttribute("aria-hidden", "true");
      wrap.innerHTML = svgText;
      document.body.appendChild(wrap);
    } catch (_) {
      // silent: switcher still works without the liquid-glass filter, just less fancy.
    }
  };

  const initOneSwitcher = (root) => {
    const fieldset = root.querySelector("fieldset");
    const radios = Array.from(root.querySelectorAll('input[name="theme"]'));
    if (!fieldset || radios.length !== 3) return;

    const applyFromRadio = (radio, isInitial = false) => {
      const opt = String(radio.getAttribute("c-option") || "");
      const prev = String(fieldset.getAttribute("data-active") || opt);

      if (!isInitial) fieldset.setAttribute("c-previous", prev);
      fieldset.setAttribute("data-active", opt);
      setTheme(radio.value);
    };

    // Set initial
    const saved = getSavedTheme();
    const initial = radios.find((r) => r.value === saved) || radios.find((r) => r.checked) || radios[1];
    radios.forEach((r) => (r.checked = r === initial));
    applyFromRadio(initial, true);

    radios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (!radio.checked) return;
        applyFromRadio(radio, false);
      });
    });
  };

  document.addEventListener("DOMContentLoaded", async () => {
    await injectFilters();

    // If theme is not set yet, set from storage (or default)
    if (!document.documentElement.getAttribute("data-theme")) {
      setTheme(getSavedTheme() || "dark");
    }

    document.querySelectorAll(".c-theme").forEach(initOneSwitcher);
  });
})();
