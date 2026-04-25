import { useEffect, useRef, useState } from "react";
import {
  cancelSpeech,
  enqueue,
  html,
  loadSeed,
  lookupSeed,
  supportsSynthesis,
} from "../util.js";
import { IconSpeaker, IconStop } from "../icons.js";

function tokenize(paragraph) {
  return paragraph.split(/(\s+|[.,!?;:"'()\[\]—-])/).filter((t) => t.length > 0);
}

function isWord(tok) {
  return /[A-Za-zÁÉÍÓÚáéíóúÀàÈèÌìÒòÙù]/.test(tok);
}

export function StoriesView() {
  const [stories, setStories] = useState([]);
  const [seed, setSeed] = useState({});
  const [active, setActive] = useState(null);
  const [error, setError] = useState("");
  const [gloss, setGloss] = useState(null); // { rect, text, headword, pos, defs }
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("data/stories.json").then((r) => {
        if (!r.ok) throw new Error(`stories.json HTTP ${r.status}`);
        return r.json();
      }),
      loadSeed(),
    ])
      .then(([s, sd]) => {
        if (cancelled) return;
        setStories(s);
        setSeed(sd);
        setActive(s[0]?.id || null);
      })
      .catch((err) => setError(err.message));
    return () => {
      cancelled = true;
      cancelSpeech();
    };
  }, []);

  // Hide gloss on outside click / scroll
  useEffect(() => {
    const onScroll = () => setGloss(null);
    const onClick = (e) => {
      if (!e.target.closest(".story-word") && !e.target.closest(".gloss")) {
        setGloss(null);
      }
    };
    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const story = stories.find((s) => s.id === active);

  function showGloss(target, token) {
    const hit = lookupSeed(seed, token);
    const rect = target.getBoundingClientRect();
    setGloss({
      x: rect.left,
      y: rect.bottom + 6,
      flip: rect.bottom + 140 > window.innerHeight,
      flippedY: rect.top - 6,
      headword: hit?.word || token,
      pos: hit?.pos || "",
      defs: hit ? hit.definitions : [],
      example: hit?.example,
    });
  }

  function readAloud() {
    if (!story) return;
    cancelSpeech();
    for (const para of story.paragraphs) enqueue(para, "ga");
  }

  function stopReading() {
    cancelSpeech();
  }

  if (error) {
    return html`<p className="status error">Could not load stories: ${error}</p>`;
  }

  return html`
    <header className="folio-head">
      <span className="folio-eyebrow">Caibidil III · Stories</span>
      <h2 className="folio-title">
        Léigh ar do <em>shuaimhneas.</em>
      </h2>
      <p className="folio-deck">
        Tap any Irish word to see its English gloss in the margin. Or have the whole tale read
        aloud — pacing native to the page.
      </p>
    </header>

    <div className="stories-bar">
      <div className="field">
        <span className="field-label">Story</span>
        <select
          className="select"
          value=${active || ""}
          onChange=${(e) => setActive(e.target.value)}
          aria-label="Choose story"
        >
          ${stories.map(
            (s) => html`<option key=${s.id} value=${s.id}>${s.title}</option>`
          )}
        </select>
      </div>
      <div className="actions">
        <button
          className="btn btn-rust"
          type="button"
          onClick=${readAloud}
          disabled=${!supportsSynthesis || !story}
        >
          <${IconSpeaker} /> Read aloud
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          onClick=${stopReading}
          disabled=${!supportsSynthesis}
        >
          <${IconStop} /> Stop
        </button>
      </div>
    </div>

    ${story &&
    html`
      <article className="story" ref=${containerRef}>
        <h3 className="story-title">${story.title}</h3>
        <p className="story-title-en">${story.title_en}</p>
        ${story.paragraphs.map((para, pi) => {
          const tokens = tokenize(para);
          const firstWordIdx = tokens.findIndex(isWord);
          return html`
            <p key=${pi}>
              ${tokens.map((tok, ti) => {
                if (!isWord(tok)) return tok;
                const onEnter = (ev) => showGloss(ev.currentTarget, tok);
                const onLeave = () => setGloss(null);
                const onClick = (ev) => {
                  ev.stopPropagation();
                  showGloss(ev.currentTarget, tok);
                };
                if (pi === 0 && ti === firstWordIdx && tok.length > 1) {
                  const first = tok.slice(0, 1);
                  const rest = tok.slice(1);
                  return html`<span key=${`${pi}-${ti}`} className="story-word-wrap"
                    ><span className="dropcap" aria-hidden="true">${first}</span><span
                      className="story-word"
                      onClick=${onClick}
                      onMouseEnter=${onEnter}
                      onMouseLeave=${onLeave}
                    >${rest}</span></span>`;
                }
                return html`<span
                  key=${`${pi}-${ti}`}
                  className="story-word"
                  onClick=${onClick}
                  onMouseEnter=${onEnter}
                  onMouseLeave=${onLeave}
                >${tok}</span>`;
              })}
            </p>
          `;
        })}
      </article>
    `}

    ${gloss &&
    html`
      <div
        className=${`gloss ${gloss.flip ? "below" : ""}`}
        style=${gloss.flip
          ? { left: `${gloss.x}px`, top: `${gloss.flippedY - 110}px` }
          : { left: `${gloss.x}px`, top: `${gloss.y}px` }}
      >
        <div className="gloss-headword">${gloss.headword}</div>
        ${gloss.pos && html`<div className="gloss-pos">${gloss.pos}</div>`}
        ${gloss.defs && gloss.defs.length > 0
          ? html`<div className="gloss-defs">${gloss.defs.join("; ")}</div>`
          : html`<div className="gloss-empty">No gloss available</div>`}
      </div>
    `}
  `;
}
