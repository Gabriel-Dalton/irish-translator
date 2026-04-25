import { useEffect, useRef, useState } from "react";
import { html, speak, supportsSynthesis } from "../util.js";
import { IconShuffle, IconSpeaker } from "../icons.js";
import { KnotMark } from "../icons.js";

const PAIR_COUNT = 8;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(pairs) {
  const chosen = shuffle(pairs).slice(0, PAIR_COUNT);
  const cards = [];
  chosen.forEach((p, idx) => {
    cards.push({ pairId: idx, lang: "ga", text: p.ga, id: `${idx}-ga` });
    cards.push({ pairId: idx, lang: "en", text: p.en, id: `${idx}-en` });
  });
  return shuffle(cards);
}

export function GameView() {
  const [pairs, setPairs] = useState([]);
  const [deck, setDeck] = useState([]);
  const [flipped, setFlipped] = useState([]); // array of card ids currently revealed
  const [matched, setMatched] = useState([]); // array of card ids matched
  const [tries, setTries] = useState(0);
  const [matches, setMatches] = useState(0);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  const firstPickRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch("data/game-pairs.json")
      .then((r) => {
        if (!r.ok) throw new Error(`game-pairs.json HTTP ${r.status}`);
        return r.json();
      })
      .then((p) => {
        if (cancelled) return;
        setPairs(p);
        setDeck(buildDeck(p));
      })
      .catch((err) => setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  function reset() {
    if (!pairs.length) return;
    setDeck(buildDeck(pairs));
    setFlipped([]);
    setMatched([]);
    setTries(0);
    setMatches(0);
    setLocked(false);
    firstPickRef.current = null;
  }

  function onCardClick(card) {
    if (locked) return;
    if (matched.includes(card.id) || flipped.includes(card.id)) return;
    const nextFlipped = [...flipped, card.id];
    setFlipped(nextFlipped);

    if (!firstPickRef.current) {
      firstPickRef.current = card;
      return;
    }

    const a = firstPickRef.current;
    const b = card;
    firstPickRef.current = null;
    setTries((t) => t + 1);

    if (a.pairId === b.pairId && a.lang !== b.lang) {
      // Match
      setTimeout(() => {
        setMatched((m) => [...m, a.id, b.id]);
        setMatches((n) => n + 1);
        const irish = a.lang === "ga" ? a.text : b.text;
        speak(irish, "ga");
      }, 250);
    } else {
      // Mismatch — flip back
      setLocked(true);
      setTimeout(() => {
        setFlipped((f) => f.filter((id) => id !== a.id && id !== b.id));
        setLocked(false);
      }, 800);
    }
  }

  if (error) {
    return html`<p className="status error">Could not load game pairs: ${error}</p>`;
  }

  const finished = matches === PAIR_COUNT && PAIR_COUNT > 0;

  return html`
    <header className="folio-head">
      <span className="folio-eyebrow">Caibidil IV · Game</span>
      <h2 className="folio-title">
        Aimsigh na <em>péirí</em>.
      </h2>
      <p className="folio-deck">
        Match each Irish word to its English meaning. The card flips, the word is spoken — and
        a small chime of vellum rewards the win.
      </p>
    </header>

    <div className="game-bar">
      <div className="score-tray">
        <div className="score-item">
          <span className="label">Pairs</span>
          <span className="value">${matches}<em> / ${PAIR_COUNT}</em></span>
        </div>
        <div className="score-item">
          <span className="label">Tries</span>
          <span className="value">${tries}</span>
        </div>
      </div>
      <button className="btn btn-primary" type="button" onClick=${reset}>
        <${IconShuffle} /> New round
      </button>
    </div>

    <div className="game-board">
      ${deck.map((card) => {
        const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
        const isMatched = matched.includes(card.id);
        return html`
          <button
            key=${card.id}
            type="button"
            className=${`game-card ${isFlipped ? "flipped" : ""} ${isMatched ? "matched" : ""}`}
            onClick=${() => onCardClick(card)}
            disabled=${isMatched}
            aria-label=${isFlipped ? card.text : "Hidden card"}
          >
            <div className="game-card-inner">
              <div className="game-card-face game-card-back">
                <${KnotMark} />
              </div>
              <div className="game-card-face game-card-front">
                <span className="lang-tag">${card.lang === "ga" ? "Gaeilge" : "English"}</span>
                ${card.text}
              </div>
            </div>
          </button>
        `;
      })}
    </div>

    ${finished &&
    html`<div className="game-finish">
      <${IconSpeaker} />
      <span><span className="ga">Maith thú!</span> ${tries} tries — well done.</span>
    </div>`}
  `;
}
