import { createRoot } from "react-dom/client";
import { html } from "./util.js";
import { App } from "./app.js";

const root = createRoot(document.getElementById("root"));
root.render(html`<${App} />`);
