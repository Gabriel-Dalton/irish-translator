import { useEffect, useRef, useState } from "react";
import { html } from "../util.js";
import {
  recognize,
  speak,
  supportsRecognition,
  supportsSynthesis,
  translateText,
} from "../util.js";
import { IconMic, IconSpeaker, IconSwap } from "../icons.js";

const LANGS = [
  { code: "ga", label: "Gaeilge", english: "Irish" },
  { code: "en", label: "English", english: "English" },
  { code: "fr", label: "Français", english: "French" },
  { code: "es", label: "Español", english: "Spanish" },
  { code: "de", label: "Deutsch", english: "German" },
];

const labelOf = (code) => LANGS.find((l) => l.code === code)?.label || code;

export function TranslateView() {
  const [src, setSrc] = useState("en");
  const [tgt, setTgt] = useState("ga");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  async function doTranslate() {
    const trimmed = text.trim();
    if (!trimmed) {
      setStatus("Type a phrase to translate.");
      setError(true);
      return;
    }
    if (src === tgt) {
      setResult(trimmed);
      setStatus("Source and target languages are the same.");
      setError(false);
      return;
    }
    setBusy(true);
    setError(false);
    setStatus("Translating…");
    try {
      const out = await translateText(trimmed, src, tgt);
      setResult(out);
      setStatus("");
    } catch (err) {
      setStatus(`Translation failed: ${err.message}`);
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  function swap() {
    setSrc(tgt);
    setTgt(src);
    setText(result);
    setResult(text);
  }

  function startMic() {
    if (!supportsRecognition || listening) return;
    setStatus("Listening…");
    setError(false);
    setListening(true);
    recRef.current = recognize(src, {
      onResult: (transcript) => {
        setText(transcript);
        setStatus("");
      },
      onError: (e) => {
        setStatus(`Mic error: ${e.error || e.message || "unknown"}`);
        setError(true);
      },
      onEnd: () => setListening(false),
    });
  }

  function speakResult() {
    if (!result) return;
    speak(result, tgt);
  }

  // Cmd/Ctrl + Enter shortcut
  function onSrcKey(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") doTranslate();
  }

  // Render result with staggered word-fade-in
  const resultWords = result ? result.split(/(\s+)/) : [];

  return html`
    <header className="folio-head">
      <span className="folio-eyebrow">Caibidil I · Translate</span>
      <h2 className="folio-title">
        Cuir focal i <em>bhfocail eile</em>.
      </h2>
      <p className="folio-deck">
        From a single word to a whole letter — render any phrase across Irish, English, French,
        Spanish, or German.
      </p>
    </header>

    <div className="translate-grid">
      <article className="folio-page">
        <div className="folio-page-head">
          <span className="label">Source</span>
          <select
            className="select lang-tag"
            value=${src}
            onChange=${(e) => setSrc(e.target.value)}
            aria-label="Source language"
          >
            ${LANGS.map((l) => html`<option key=${l.code} value=${l.code}>${l.label}</option>`)}
          </select>
        </div>
        <textarea
          className="folio-textarea"
          placeholder="Type or paste — Cuir téacs anseo…"
          value=${text}
          onChange=${(e) => setText(e.target.value)}
          onKeyDown=${onSrcKey}
          rows="8"
        ></textarea>
        <div className="folio-page-foot">
          <span className="hint">${labelOf(src)} · ⌘ + Enter</span>
          <div className="actions">
            <button
              className="icon-btn"
              type="button"
              onClick=${startMic}
              disabled=${!supportsRecognition || listening}
              aria-label="Speak input"
              title=${supportsRecognition ? "Speak input" : "Mic unsupported in this browser"}
            >
              <${IconMic} />
            </button>
          </div>
        </div>
      </article>

      <article className="folio-page">
        <div className="folio-page-head">
          <span className="label">Target</span>
          <div style=${{ display: "flex", gap: ".5rem", alignItems: "center" }}>
            <button
              type="button"
              className="swap-btn"
              onClick=${swap}
              aria-label="Swap languages"
              title="Swap languages"
            >
              <${IconSwap} />
            </button>
            <select
              className="select lang-tag"
              value=${tgt}
              onChange=${(e) => setTgt(e.target.value)}
              aria-label="Target language"
            >
              ${LANGS.map((l) => html`<option key=${l.code} value=${l.code}>${l.label}</option>`)}
            </select>
          </div>
        </div>
        <div
          className=${`folio-result ${result ? "" : "empty"}`}
          aria-live="polite"
        >
          ${result
            ? resultWords.map(
                (w, i) =>
                  html`<span
                    key=${i}
                    className="word"
                    style=${{ animationDelay: `${i * 28}ms` }}
                  >${w}</span>`
              )
            : "Aistriúchán le feiceáil anseo…"}
        </div>
        <div className="folio-page-foot">
          <span className="hint">${labelOf(tgt)}${!supportsSynthesis ? " · audio unsupported" : ""}</span>
          <div className="actions">
            <button
              className="icon-btn"
              type="button"
              onClick=${speakResult}
              disabled=${!supportsSynthesis || !result}
              aria-label="Read translation aloud"
              title="Read translation aloud"
            >
              <${IconSpeaker} />
            </button>
          </div>
        </div>
      </article>
    </div>

    <div className="translate-actions">
      <span className=${`status ${error ? "error" : ""}`}>
        ${busy && html`<span className="pulse"></span>`}${status}
      </span>
      <button
        type="button"
        className="btn btn-primary"
        onClick=${doTranslate}
        disabled=${busy}
      >
        ${busy ? "Translating" : "Aistrigh — Translate"}
      </button>
    </div>
  `;
}
