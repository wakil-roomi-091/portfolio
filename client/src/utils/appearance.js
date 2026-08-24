// Accent-color presets for the site's signature look. Each preset drives four
// CSS variables:
//   --accent-start / --accent-end  → the gradient endpoints used by the
//     .gradient-bg / .gradient-text / .gradient-soft utilities (index.css).
//   --accent-rgb / --accent-end-rgb → space-separated RGB channels that back
//     the Tailwind `accent` / `accent-end` colors (tailwind.config.js), so
//     every flat accent surface — links, kickers, focus rings, selection,
//     icon tiles, button glows — follows the chosen preset too.
//
// Selecting a preset therefore recolours the ENTIRE site live (no reload) and
// gives each theme a genuinely different vibe, not just a different button.
//
// `solid` is the flat accent used for text/links/icons; it is picked for good
// contrast and can differ from the (often lighter) gradient `start`.
// Keys are stored on the Settings document.
export const ACCENT_PRESETS = {
  "indigo-cyan": { start: "#4f46e5", end: "#06b6d4", solid: "#4f46e5", label: "Indigo" },
  "violet-pink": { start: "#8b5cf6", end: "#f472b6", solid: "#7c3aed", label: "Violet" },
  "cyan-emerald": { start: "#06b6d4", end: "#34d399", solid: "#0891b2", label: "Emerald" },
  "indigo-teal": { start: "#6366f1", end: "#14b8a6", solid: "#4f46e5", label: "Teal" },
  "amber-rose": { start: "#f59e0b", end: "#ef4444", solid: "#ea580c", label: "Sunset" },
  "blue-indigo": { start: "#3b82f6", end: "#6366f1", solid: "#2563eb", label: "Ocean" },
  "rose-fuchsia": { start: "#f43f5e", end: "#d946ef", solid: "#e11d48", label: "Rose" },
  "emerald-lime": { start: "#10b981", end: "#84cc16", solid: "#059669", label: "Forest" },
  "fuchsia-purple": { start: "#d946ef", end: "#8b5cf6", solid: "#a21caf", label: "Grape" },
  "red-orange": { start: "#ef4444", end: "#f97316", solid: "#dc2626", label: "Crimson" },
  "slate-zinc": { start: "#64748b", end: "#71717a", solid: "#475569", label: "Slate" },
};

export const DEFAULT_ACCENT = "indigo-cyan";

// Where applyAccent caches the resolved CSS vars so index.html's pre-paint
// script can re-apply them before React mounts (avoids an indigo flash).
const VARS_CACHE_KEY = "roomi-accent-vars";

// "#4f46e5" → "79 70 229" (space-separated, for the rgb(R G B / A) syntax).
function hexToChannels(hex) {
  const h = String(hex).replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const int = parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `${r} ${g} ${b}`;
}

// Apply an accent preset by writing its colors to the root CSS variables.
//  - persist: true  → also cache the resolved vars in localStorage so the
//    pre-paint script can restore them on the next load. Use this for the
//    committed accent (boot from saved settings, or after Save), NOT for a
//    transient hover/preview.
export function applyAccent(key, { persist = false } = {}) {
  const preset = ACCENT_PRESETS[key] || ACCENT_PRESETS[DEFAULT_ACCENT];
  const solid = preset.solid || preset.start;
  const vars = {
    "--accent-start": preset.start,
    "--accent-end": preset.end,
    "--accent-rgb": hexToChannels(solid),
    "--accent-end-rgb": hexToChannels(preset.end),
  };
  const root = document.documentElement;
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }
  if (persist) {
    try {
      localStorage.setItem(VARS_CACHE_KEY, JSON.stringify(vars));
    } catch {
      /* ignore */
    }
  }
}
