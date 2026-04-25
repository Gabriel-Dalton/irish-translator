// Wire up tabs and lazy-init each module the first time its tab opens.

(function () {
  const initialized = new Set();

  function activate(name) {
    document.querySelectorAll(".tab").forEach((t) => {
      const active = t.dataset.tab === name;
      t.classList.toggle("active", active);
      t.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".panel").forEach((p) => {
      const active = p.id === `tab-${name}`;
      p.classList.toggle("active", active);
      p.hidden = !active;
    });

    if (!initialized.has(name)) {
      initialized.add(name);
      switch (name) {
        case "translate":
          Translate.init();
          break;
        case "dictionary":
          Dictionary.init();
          break;
        case "stories":
          Stories.init();
          break;
        case "game":
          Game.init();
          break;
      }
    }
  }

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => activate(tab.dataset.tab));
  });

  // Initialize the default tab on load.
  activate("translate");
})();
