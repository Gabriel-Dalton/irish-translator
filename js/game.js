// Memory match game: 8 Irish/English pairs → 16 cards.

const Game = (() => {
  let pairs = [];
  let firstPick = null;
  let lock = false;
  let matches = 0;
  let tries = 0;
  const PAIR_COUNT = 8;

  async function loadPairs() {
    const res = await fetch("data/game-pairs.json");
    if (!res.ok) throw new Error(`game-pairs.json HTTP ${res.status}`);
    pairs = await res.json();
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildDeck() {
    const chosen = shuffle(pairs).slice(0, PAIR_COUNT);
    const cards = [];
    chosen.forEach((p, idx) => {
      cards.push({ pairId: idx, lang: "ga", text: p.ga });
      cards.push({ pairId: idx, lang: "en", text: p.en });
    });
    return shuffle(cards);
  }

  function newRound() {
    if (!pairs.length) return;
    matches = 0;
    tries = 0;
    firstPick = null;
    lock = false;
    document.getElementById("game-score").textContent = "0";
    document.getElementById("game-tries").textContent = "0";
    document.getElementById("game-status").textContent = "";

    const board = document.getElementById("game-board");
    board.innerHTML = "";
    const deck = buildDeck();
    deck.forEach((card, idx) => {
      const btn = document.createElement("button");
      btn.className = "card";
      btn.type = "button";
      btn.dataset.pair = card.pairId;
      btn.dataset.lang = card.lang;
      btn.dataset.text = card.text;
      btn.dataset.idx = idx;
      btn.setAttribute("aria-label", "Hidden card");
      btn.addEventListener("click", () => onCardClick(btn));
      board.appendChild(btn);
    });
    document.getElementById("game-total").textContent = String(PAIR_COUNT);
  }

  function reveal(btn) {
    btn.classList.add("flipped");
    btn.textContent = btn.dataset.text;
  }

  function hide(btn) {
    btn.classList.remove("flipped");
    btn.textContent = "";
  }

  function onCardClick(btn) {
    if (lock) return;
    if (btn.classList.contains("matched") || btn.classList.contains("flipped")) return;

    reveal(btn);

    if (!firstPick) {
      firstPick = btn;
      return;
    }

    tries += 1;
    document.getElementById("game-tries").textContent = String(tries);

    const a = firstPick;
    const b = btn;
    firstPick = null;

    if (a.dataset.pair === b.dataset.pair && a.dataset.lang !== b.dataset.lang) {
      a.classList.add("matched");
      b.classList.add("matched");
      a.disabled = true;
      b.disabled = true;
      matches += 1;
      document.getElementById("game-score").textContent = String(matches);
      // Speak the Irish word as a small reward.
      const irish = a.dataset.lang === "ga" ? a.dataset.text : b.dataset.text;
      Speech.speak(irish, "ga");
      if (matches === PAIR_COUNT) {
        document.getElementById("game-status").textContent = `Maith thú! ${tries} tries.`;
      }
    } else {
      lock = true;
      setTimeout(() => {
        hide(a);
        hide(b);
        lock = false;
      }, 750);
    }
  }

  async function init() {
    try {
      await loadPairs();
    } catch (err) {
      document.getElementById("game-status").textContent = `Could not load game pairs: ${err.message}`;
      return;
    }
    document.getElementById("game-new").addEventListener("click", newRound);
    newRound();
  }

  return { init };
})();
