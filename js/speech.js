// Web Speech API helpers — recognition (mic) and synthesis (speaker).
// Each function returns null/false on unsupported browsers so callers can gate UI.

const Speech = (() => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const supportsRecognition = !!SR;
  const supportsSynthesis = "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";

  // Map of our short language codes to BCP-47 tags used by Web Speech.
  const langTag = {
    ga: "ga-IE",
    en: "en-US",
    fr: "fr-FR",
    es: "es-ES",
    de: "de-DE",
  };

  function toBcp47(code) {
    return langTag[code] || code;
  }

  function recognize(lang, { onResult, onError, onEnd } = {}) {
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

  // Cache voices once available — they load asynchronously in some browsers.
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

  function speak(text, lang) {
    if (!supportsSynthesis || !text) return false;
    window.speechSynthesis.cancel();
    return enqueue(text, lang);
  }

  function enqueue(text, lang) {
    if (!supportsSynthesis || !text) return false;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = toBcp47(lang);
    const voice = pickVoice(lang);
    if (voice) u.voice = voice;
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
    return true;
  }

  function cancelSpeech() {
    if (supportsSynthesis) window.speechSynthesis.cancel();
  }

  return {
    supportsRecognition,
    supportsSynthesis,
    recognize,
    speak,
    enqueue,
    cancelSpeech,
  };
})();
