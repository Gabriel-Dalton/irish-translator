// Dictionary tab: try local seed JSON first, fall back to Wiktionary REST API.
// Wiktionary endpoint: /api/rest_v1/page/definition/{title} returns HTML-flavored definitions per language.

const Dictionary = (() => {
  let seedPromise = null;

  function loadSeed() {
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

  function lookupSeed(seed, query) {
    const norm = query.trim().toLowerCase();
    if (seed[norm]) return seed[norm];
    // Lenient match — strip leading article if present.
    const stripped = norm.replace(/^(an|na)\s+/, "").replace(/^t-?/, "");
    if (seed[stripped]) return seed[stripped];
    return null;
  }

  // Wiktionary returns { ga: [{ partOfSpeech, definitions: [{ definition }] }, ...], en: [...] ... }
  async function lookupWiktionary(word) {
    const title = encodeURIComponent(word.trim());
    const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${title}`;
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Wiktionary HTTP ${res.status}`);
    }
    const data = await res.json();
    // Prefer Irish entries; fall back to whatever language sections exist.
    const langSections = data.ga || Object.values(data)[0];
    if (!langSections || !langSections.length) return null;
    return langSections;
  }

  function stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  function renderSeedEntry(entry) {
    const el = document.createElement("article");
    el.className = "dict-entry";
    el.innerHTML = `
      <button class="speaker" type="button" title="Pronounce">🔊</button>
      <h3>${entry.word}</h3>
      <span class="pos">${entry.pos || ""}</span>
      <ol>${entry.definitions.map((d) => `<li>${d}</li>`).join("")}</ol>
      ${
        entry.example
          ? `<p class="example">${entry.example.ga} — ${entry.example.en}</p>`
          : ""
      }
      <div class="source">From bundled dictionary.</div>
    `;
    el.querySelector(".speaker").addEventListener("click", () => {
      Speech.speak(entry.word, "ga");
    });
    return el;
  }

  function renderWiktionaryEntry(word, sections) {
    const el = document.createElement("article");
    el.className = "dict-entry";
    const blocks = sections
      .map((s) => {
        const defs = (s.definitions || [])
          .slice(0, 4)
          .map((d) => `<li>${stripHtml(d.definition || "")}</li>`)
          .join("");
        return `<div><span class="pos">${s.partOfSpeech || ""}</span><ol>${defs}</ol></div>`;
      })
      .join("");
    el.innerHTML = `
      <button class="speaker" type="button" title="Pronounce">🔊</button>
      <h3>${word}</h3>
      ${blocks}
      <div class="source">Source: Wiktionary.</div>
    `;
    el.querySelector(".speaker").addEventListener("click", () => {
      Speech.speak(word, "ga");
    });
    return el;
  }

  function renderEmpty(word, message) {
    const el = document.createElement("article");
    el.className = "dict-entry";
    el.innerHTML = `<h3>${word}</h3><p>${message}</p>`;
    return el;
  }

  async function lookup(rawQuery) {
    const query = (rawQuery || "").trim();
    const out = document.getElementById("dict-result");
    out.innerHTML = "";
    if (!query) return;

    const status = document.createElement("p");
    status.className = "status";
    status.textContent = "Looking up…";
    out.appendChild(status);

    const seed = await loadSeed();
    const seedHit = lookupSeed(seed, query);
    if (seedHit) {
      out.innerHTML = "";
      out.appendChild(renderSeedEntry(seedHit));
      return;
    }

    try {
      const sections = await lookupWiktionary(query);
      out.innerHTML = "";
      if (sections && sections.length) {
        out.appendChild(renderWiktionaryEntry(query, sections));
      } else {
        out.appendChild(renderEmpty(query, "No results — try another spelling or root form."));
      }
    } catch (err) {
      out.innerHTML = "";
      out.appendChild(renderEmpty(query, `Lookup failed: ${err.message}`));
    }
  }

  function init() {
    document.getElementById("dict-form").addEventListener("submit", (e) => {
      e.preventDefault();
      lookup(document.getElementById("dict-input").value);
    });
    // Pre-warm seed.
    loadSeed();
  }

  return { init, lookup, loadSeed, lookupSeed };
})();
