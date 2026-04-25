// Translate tab: MyMemory API + Web Speech mic + speaker.
// MyMemory has a free tier (no key) usable for casual learner traffic.

const Translate = (() => {
  const $src = () => document.getElementById("src-text");
  const $tgt = () => document.getElementById("tgt-text");
  const $srcLang = () => document.getElementById("src-lang");
  const $tgtLang = () => document.getElementById("tgt-lang");
  const $status = () => document.getElementById("translate-status");
  const $micNote = () => document.getElementById("mic-note");
  const $speakNote = () => document.getElementById("speak-note");

  async function callMyMemory(text, src, tgt) {
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

  async function doTranslate() {
    const text = $src().value.trim();
    if (!text) {
      $status().textContent = "Type something to translate.";
      return;
    }
    const src = $srcLang().value;
    const tgt = $tgtLang().value;
    if (src === tgt) {
      $tgt().textContent = text;
      $status().textContent = "Source and target languages are the same.";
      return;
    }
    $status().textContent = "Translating…";
    $status().classList.remove("error");
    try {
      const translated = await callMyMemory(text, src, tgt);
      $tgt().textContent = translated;
      $status().textContent = "";
    } catch (err) {
      $status().textContent = `Translation failed: ${err.message}`;
      $status().classList.add("error");
    }
  }

  function init() {
    document.getElementById("translate-btn").addEventListener("click", doTranslate);
    $src().addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") doTranslate();
    });

    document.getElementById("swap-langs").addEventListener("click", () => {
      const a = $srcLang().value;
      $srcLang().value = $tgtLang().value;
      $tgtLang().value = a;
      const srcText = $src().value;
      const tgtText = $tgt().textContent;
      $src().value = tgtText;
      $tgt().textContent = srcText;
    });

    // Mic
    const micBtn = document.getElementById("mic-btn");
    if (!Speech.supportsRecognition) {
      micBtn.disabled = true;
      $micNote().textContent = "Mic input not supported in this browser (try Chrome or Edge).";
    } else {
      micBtn.addEventListener("click", () => {
        const lang = $srcLang().value;
        $status().textContent = "Listening…";
        micBtn.disabled = true;
        Speech.recognize(lang, {
          onResult: (transcript) => {
            $src().value = transcript;
            $status().textContent = "";
          },
          onError: (e) => {
            $status().textContent = `Mic error: ${e.error || e.message || "unknown"}`;
            $status().classList.add("error");
          },
          onEnd: () => {
            micBtn.disabled = false;
            if ($status().textContent === "Listening…") $status().textContent = "";
          },
        });
      });
    }

    // Speaker
    const speakBtn = document.getElementById("speak-btn");
    if (!Speech.supportsSynthesis) {
      speakBtn.disabled = true;
      $speakNote().textContent = "Audio playback not supported in this browser.";
    } else {
      speakBtn.addEventListener("click", () => {
        const text = $tgt().textContent.trim();
        if (!text) return;
        Speech.speak(text, $tgtLang().value);
      });
    }
  }

  return { init };
})();
