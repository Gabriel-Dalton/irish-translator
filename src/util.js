import { createElement } from "react";
import htm from "htm";

export const html = htm.bind(createElement);

/* ----------------------------------------------------------------------------
   Speech: Web Speech API helpers (recognition + synthesis).
   Same idea as the previous vanilla helper, but exported as ES module.
   ---------------------------------------------------------------------------- */

const SR =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export const supportsRecognition = !!SR;
export const supportsSynthesis =
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  typeof SpeechSynthesisUtterance !== "undefined";

const langTag = {
  ga: "ga-IE",
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
};

export const toBcp47 = (code) => langTag[code] || code;

export function recognize(lang, { onResult, onError, onEnd } = {}) {
  if (!supportsRecognition) {
    onError && onError(new Error("not-supported"));
    return null;
  }
  const rec = new SR();
  rec.lang = toBcp47(lang);
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.onresult = (e) => {
    const transcript = e.results[0]?.[0]?.transcript || "";
    onResult && onResult(transcript);
  };
  rec.onerror = (e) => onError && onError(e);
  rec.onend = () => onEnd && onEnd();
  try {
    rec.start();
  } catch (err) {
    onError && onError(err);
    return null;
  }
  return rec;
}

let voices = [];
function loadVoices() {
  voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
}
if (supportsSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pickVoice(lang) {
  const tag = toBcp47(lang).toLowerCase();
  const prefix = tag.split("-")[0];
  return (
    voices.find((v) => v.lang.toLowerCase() === tag) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ||
    null
  );
}

export function speak(text, lang) {
  if (!supportsSynthesis || !text) return false;
  window.speechSynthesis.cancel();
  return enqueue(text, lang);
}

export function enqueue(text, lang) {
  if (!supportsSynthesis || !text) return false;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = toBcp47(lang);
  const v = pickVoice(lang);
  if (v) u.voice = v;
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
  return true;
}

export function cancelSpeech() {
  if (supportsSynthesis) window.speechSynthesis.cancel();
}

/* ----------------------------------------------------------------------------
   Dictionary helpers — shared between the Dictionary and Stories views.
   ---------------------------------------------------------------------------- */

let seedPromise = null;

export function loadSeed() {
  if (!seedPromise) {
    seedPromise = fetch("data/dictionary.json")
      .then((r) => {
        if (!r.ok) throw new Error(`dictionary.json HTTP ${r.status}`);
        return r.json();
      })
      .catch((err) => {
        console.error(err);
        return {};
      });
  }
  return seedPromise;
}

export function lookupSeed(seed, query) {
  const norm = (query || "").trim().toLowerCase();
  if (!norm) return null;
  if (seed[norm]) return seed[norm];
  const stripped = norm.replace(/^(an|na)\s+/, "").replace(/^t-?/, "");
  if (seed[stripped]) return seed[stripped];
  return null;
}

export async function lookupWiktionary(word) {
  const title = encodeURIComponent(word.trim());
  const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${title}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Wiktionary HTTP ${res.status}`);
  }
  const data = await res.json();
  const langSections = data.ga || Object.values(data)[0];
  if (!langSections || !langSections.length) return null;
  return langSections;
}

export function stripHtml(s) {
  if (typeof s !== "string") return "";
  const div = document.createElement("div");
  div.innerHTML = s;
  return div.textContent || div.innerText || "";
}

/* ----------------------------------------------------------------------------
   Translation API
   ---------------------------------------------------------------------------- */

export async function translateText(text, src, tgt) {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `${src}|${tgt}`);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);
  const data = await res.json();
  const translation = data?.responseData?.translatedText;
  if (!translation) throw new Error("No translation in response");
  return translation;
}
