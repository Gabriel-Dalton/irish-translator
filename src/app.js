import { useState } from "react";
import { html } from "./util.js";
import { Triskele, KnotBand } from "./icons.js";
import { TranslateView } from "./views/translate.js";
import { DictionaryView } from "./views/dictionary.js";
import { StoriesView } from "./views/stories.js";
import { GameView } from "./views/game.js";

const TABS = [
  { id: "translate", numeral: "I", ga: "Aistrigh", en: "Translate" },
  { id: "dictionary", numeral: "II", ga: "Foclóir", en: "Dictionary" },
  { id: "stories", numeral: "III", ga: "Scéalta", en: "Stories" },
  { id: "game", numeral: "IV", ga: "Cluiche", en: "Game" },
];

export function App() {
  const [tab, setTab] = useState("translate");

  return html`
    <div className="layout">
      <aside className="rail">
        <div className="rail-brand">
          <${Triskele} />
          <h1 className="brand">
            Foghlaim<br />
            Gaeilge
          </h1>
          <p className="brand-sub">
            A reader, translator <span className="ampersand">&</span> companion to the Irish tongue.
          </p>
        </div>

        <nav className="rail-nav" role="tablist" aria-label="Sections">
          ${TABS.map(
            (t) => html`
              <button
                key=${t.id}
                role="tab"
                aria-selected=${tab === t.id}
                className=${`rail-link ${tab === t.id ? "active" : ""}`}
                onClick=${() => setTab(t.id)}
              >
                <span className="numeral">${t.numeral}</span>
                <span className="rail-label">
                  <span className="ga">${t.ga}</span>
                  <span className="en">${t.en}</span>
                </span>
              </button>
            `
          )}
        </nav>

        <${KnotBand} />

        <p className="rail-foot">
          Foilsithe le <strong>grá</strong> ón nGaeltacht
        </p>
      </aside>

      <main className="content" key=${tab}>
        ${tab === "translate" && html`<${TranslateView} />`}
        ${tab === "dictionary" && html`<${DictionaryView} />`}
        ${tab === "stories" && html`<${StoriesView} />`}
        ${tab === "game" && html`<${GameView} />`}

        <footer className="colophon">
          <span>
            Aistriúchán le <a href="https://mymemory.translated.net" target="_blank" rel="noopener">MyMemory</a>; foclóir cúltaca le
            <a href="https://en.wiktionary.org" target="_blank" rel="noopener"> Wiktionary</a>.
          </span>
          <span>An. Domh. ⁘ MMXXVI</span>
        </footer>
      </main>
    </div>
  `;
}
