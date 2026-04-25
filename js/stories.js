// Stories tab: render paragraphs with each Irish word clickable; click → tooltip with English gloss
// pulled from the seeded dictionary. "Read aloud" pipes the whole story through TTS.

const Stories = (() => {
  let stories = [];
  let current = null;

  async function loadStories() {
    const res = await fetch("data/stories.json");
    if (!res.ok) throw new Error(`stories.json HTTP ${res.status}`);
    return res.json();
  }

  function tokenize(paragraph) {
    // Split keeping word/non-word tokens — we wrap word tokens and pass non-words through.
    return paragraph.split(/(\s+|[.,!?;:"'()\[\]—-])/).filter((t) => t.length > 0);
  }

  function isWord(token) {
    return /[A-Za-zÁÉÍÓÚáéíóúÀàÈèÌìÒòÙù]/.test(token);
  }

  async function renderStory(story) {
    current = story;
    const seed = await Dictionary.loadSeed();
    const body = document.getElementById("story-body");
    body.innerHTML = "";

    const h2 = document.createElement("h2");
    h2.textContent = `${story.title} — ${story.title_en}`;
    body.appendChild(h2);

    for (const para of story.paragraphs) {
      const p = document.createElement("p");
      for (const tok of tokenize(para)) {
        if (isWord(tok)) {
          const span = document.createElement("span");
          span.className = "story-word";
          span.textContent = tok;
          const hit = Dictionary.lookupSeed(seed, tok);
          if (hit) {
            span.dataset.gloss = `${hit.word}: ${hit.definitions.join("; ")}`;
          } else {
            span.dataset.gloss = `${tok}: (no gloss)`;
          }
          p.appendChild(span);
        } else {
          p.appendChild(document.createTextNode(tok));
        }
      }
      body.appendChild(p);
    }
  }

  function showTooltip(target, text) {
    const tip = document.getElementById("story-tooltip");
    tip.textContent = text;
    tip.hidden = false;
    const rect = target.getBoundingClientRect();
    let top = rect.bottom + 6;
    let left = rect.left;
    // Keep within viewport.
    const tipRect = tip.getBoundingClientRect();
    if (left + tipRect.width > window.innerWidth - 8) {
      left = window.innerWidth - tipRect.width - 8;
    }
    if (top + tipRect.height > window.innerHeight - 8) {
      top = rect.top - tipRect.height - 6;
    }
    tip.style.top = `${top}px`;
    tip.style.left = `${left}px`;
  }

  function hideTooltip() {
    document.getElementById("story-tooltip").hidden = true;
  }

  async function init() {
    try {
      stories = await loadStories();
    } catch (err) {
      document.getElementById("story-body").textContent = `Could not load stories: ${err.message}`;
      return;
    }

    const select = document.getElementById("story-select");
    select.innerHTML = stories.map((s) => `<option value="${s.id}">${s.title}</option>`).join("");
    select.addEventListener("change", () => {
      const story = stories.find((s) => s.id === select.value);
      if (story) renderStory(story);
    });

    if (stories.length) renderStory(stories[0]);

    // Tooltip handlers — delegate at body level.
    const body = document.getElementById("story-body");
    body.addEventListener("click", (e) => {
      const word = e.target.closest(".story-word");
      if (!word) {
        hideTooltip();
        return;
      }
      showTooltip(word, word.dataset.gloss);
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".story-word") && !e.target.closest("#story-tooltip")) {
        hideTooltip();
      }
    });
    window.addEventListener("scroll", hideTooltip, true);

    const readBtn = document.getElementById("story-read");
    const stopBtn = document.getElementById("story-stop");
    if (!Speech.supportsSynthesis) {
      readBtn.disabled = true;
      stopBtn.disabled = true;
      readBtn.title = "TTS not supported in this browser";
    } else {
      readBtn.addEventListener("click", () => {
        if (!current) return;
        // Speak each paragraph as a separate utterance for natural pacing.
        Speech.cancelSpeech();
        for (const para of current.paragraphs) {
          Speech.enqueue(para, "ga");
        }
      });
      stopBtn.addEventListener("click", () => Speech.cancelSpeech());
    }
  }

  return { init };
})();
