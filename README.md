# Foghlaim Gaeilge

An Irish language study page with four sections: a translator, a dictionary, short reading passages, and a word matching game. Static files only, no build step.

## How it works

`index.html` declares an import map that pulls React 18 and `htm` from esm.sh, then loads `src/main.js` as a module. `htm` builds the element tree from tagged template strings, so there is nothing to compile. Each tab in `src/views/` is one component.

Content lives in three JSON files:

- `data/dictionary.json` seeds dictionary lookups
- `data/stories.json` holds the reading passages, each with an English title
- `data/game-pairs.json` holds the Irish and English pairs the matching game deals from

Two outside services fill the gaps. Translation calls the MyMemory API and covers Irish, English, French, Spanish and German. A dictionary word missing from the seed file falls back to the Wiktionary definition endpoint. Hearing a phrase read aloud and dictating one both use the browser Web Speech API, and those controls stay hidden where the browser has no support.

## Run it

The JSON files are read with `fetch`, so opening `index.html` straight from disk fails. Serve the folder over HTTP:

    python -m http.server 8000

Then visit http://localhost:8000.
