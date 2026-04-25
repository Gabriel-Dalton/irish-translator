import { useEffect, useState } from "react";
import { html, loadSeed, lookupSeed, lookupWiktionary, speak, stripHtml, supportsSynthesis } from "../util.js";
import { IconSearch, IconSpeaker } from "../icons.js";

const SUGGESTIONS = ["madra", "uisce", "leabhar", "fuinneog", "oíche", "slán"];

const ROMAN = [
  "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x",
  "xi", "xii", "xiii", "xiv", "xv", "xvi", "xvii", "xviii", "xix", "xx",
];

export function DictionaryView() {
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadSeed();
  }, []);

  async function lookup(raw) {
    const q = (raw || "").trim();
    if (!q) return;
    setBusy(true);
    setStatus("Looking up…");
    setEntries([]);
    const seed = await loadSeed();
    const seedHit = lookupSeed(seed, q);
    if (seedHit) {
      const next = [
        {
          word: seedHit.word,
          pos: seedHit.pos,
          defs: seedHit.definitions || [],
          example: seedHit.example,
          source: "Bundled lexicon",
        },
        ...entries,
      ];
      setEntries(next);
      setStatus("");
      setBusy(false);
      return;
    }
    try {
      const sections = await lookupWiktionary(q);
      if (sections && sections.length) {
        const merged = {
          word: q,
          pos: sections[0].partOfSpeech || "",
          defs: sections
            .flatMap((s) =>
              (s.definitions || [])
                .slice(0, 4)
                .map((d) => stripHtml(d.definition || ""))
            )
            .filter(Boolean),
          example: null,
          source: "Wiktionary",
        };
        setEntries([merged, ...entries]);
        setStatus("");
      } else {
        setEntries([
          {
            word: q,
            pos: "",
            defs: [],
            example: null,
            source: "No results — try the dictionary form.",
          },
          ...entries,
        ]);
        setStatus("");
      }
    } catch (err) {
      setStatus(`Lookup failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    lookup(query);
  }

  function onChip(word) {
    setQuery(word);
    lookup(word);
  }

  return html`
    <header className="folio-head">
      <span className="folio-eyebrow">Caibidil II · Dictionary</span>
      <h2 className="folio-title">
        Beanna<em>cht</em> ó <em>fhoclóir.</em>
      </h2>
      <p className="folio-deck">
        Look up a word in the bundled Irish lexicon — or fall through to Wiktionary for the
        long tail.
      </p>
    </header>

    <form className="dict-search" onSubmit=${onSubmit}>
      <input
        className="input"
        type="search"
        placeholder="madra, leabhar, oíche…"
        autoComplete="off"
        value=${query}
        onChange=${(e) => setQuery(e.target.value)}
        aria-label="Look up a word"
      />
      <button type="submit" className="btn btn-primary" disabled=${busy}>
        <${IconSearch} /> ${busy ? "Looking up" : "Lookup"}
      </button>
    </form>

    <div className="dict-suggestions">
      <span className="label">Try</span>
      ${SUGGESTIONS.map(
        (w) => html`<button key=${w} type="button" className="chip" onClick=${() => onChip(w)}>${w}</button>`
      )}
    </div>

    ${status &&
    html`<p className="status">${status}</p>`}

    <section className="dict-list" aria-live="polite">
      ${entries.length === 0 && !status &&
      html`<p className="status">
        <em>Begin a lookup to grow your foclóir.</em>
      </p>`}
      ${entries.map(
        (e, idx) => html`
          <article className="dict-entry" key=${idx + e.word}>
            <span className="dict-entry-num">${ROMAN[idx] || idx + 1}</span>
            <div className="dict-entry-body">
              <header className="dict-entry-head">
                <div>
                  <h3 className="dict-word">${e.word}</h3>
                  ${e.pos && html`<div className="dict-pos">${e.pos}</div>`}
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick=${() => speak(e.word, "ga")}
                  disabled=${!supportsSynthesis}
                  title="Pronounce"
                  aria-label=${`Pronounce ${e.word}`}
                >
                  <${IconSpeaker} />
                </button>
              </header>
              ${e.defs.length > 0
                ? html`<ol className="dict-defs">
                    ${e.defs.map((d, i) => html`<li key=${i}>${d}</li>`)}
                  </ol>`
                : html`<p className="dict-pos" style=${{ color: "var(--ink-mute)" }}>
                    No definition available.
                  </p>`}
              ${e.example &&
              html`<aside className="dict-example">
                <span className="ga">${e.example.ga}</span>
                <span className="en">${e.example.en}</span>
              </aside>`}
              <span className="dict-source">${e.source}</span>
            </div>
          </article>
        `
      )}
    </section>
  `;
}
