import { html } from "./util.js";

/* SVG icon set. React expects camelCase for SVG attribute names. */

export const Triskele = (props) => html`
  <svg
    className=${`triskele ${props?.className || ""}`}
    viewBox="0 0 100 100"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="50" cy="50" r="46" strokeOpacity=".25" strokeWidth="1" />
    <circle cx="50" cy="50" r="3" fill="currentColor" stroke="none" />
    <path d="M50 50 C 50 28, 72 18, 78 36 C 82 52, 64 60, 56 52" />
    <path d="M50 50 C 32 60, 22 80, 38 86 C 54 90, 60 70, 52 62" />
    <path d="M50 50 C 68 56, 86 50, 84 32 C 80 16, 60 18, 56 32" transform="rotate(120 50 50)" />
  </svg>
`;

export const KnotBand = () => html`
  <svg
    className="rail-knot"
    viewBox="0 0 320 36"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M4 18
         C 22 4, 38 32, 56 18
         C 74 4, 90 32, 108 18
         C 126 4, 142 32, 160 18
         C 178 4, 194 32, 212 18
         C 230 4, 246 32, 264 18
         C 282 4, 298 32, 316 18"
    />
    <path
      d="M4 18
         C 22 32, 38 4, 56 18
         C 74 32, 90 4, 108 18
         C 126 32, 142 4, 160 18
         C 178 32, 194 4, 212 18
         C 230 32, 246 4, 264 18
         C 282 32, 298 4, 316 18"
      strokeOpacity=".45"
    />
    <circle cx="160" cy="18" r="2.5" fill="currentColor" stroke="none" />
  </svg>
`;

export const KnotMark = () => html`
  <svg
    className="knot"
    viewBox="0 0 64 64"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M32 8 C 14 8, 14 32, 32 32 C 50 32, 50 56, 32 56" />
    <path d="M32 8 C 50 8, 50 32, 32 32 C 14 32, 14 56, 32 56" strokeOpacity=".55" />
    <path d="M8 32 C 8 14, 32 14, 32 32 C 32 50, 56 50, 56 32" strokeOpacity=".7" />
    <circle cx="32" cy="32" r="2" fill="currentColor" stroke="none" />
  </svg>
`;

export const IconMic = () => html`
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3" />
  </svg>
`;

export const IconSpeaker = () => html`
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9h3l5-4v14l-5-4H4z" />
    <path d="M16 8a5 5 0 0 1 0 8" />
    <path d="M19 5a9 9 0 0 1 0 14" strokeOpacity=".6" />
  </svg>
`;

export const IconStop = () => html`
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="6" width="12" height="12" rx="1.5" />
  </svg>
`;

export const IconSwap = () => html`
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 7h12l-3-3" />
    <path d="M17 17H5l3 3" />
  </svg>
`;

export const IconShuffle = () => html`
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7h4l3 4" />
    <path d="M3 17h4l10-10h4" />
    <path d="M14 17l3 0" />
    <path d="M17 14l3 3-3 3" />
    <path d="M17 4l3 3-3 3" />
  </svg>
`;

export const IconSearch = () => html`
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="6" />
    <path d="M16 16l4 4" />
  </svg>
`;
