export type ClippyMood = 'calm' | 'worried' | 'panic'

/** The mood follows the context fill: calm below `warn`, worried from it, panic from `at`. */
export const clippyMood = (percent: number, warn: number, at: number): ClippyMood => (percent >= at ? 'panic' : percent >= warn ? 'worried' : 'calm')

/** Terminal has no `Svg` element: a one-line face stands in for the picture. */
export const clippyFace = (m: ClippyMood): string => (m === 'panic' ? '(°□°)' : m === 'worried' ? '(•_•)' : '(•‿•)')

/** The speech-bubble line; empty while calm. Plain text, no emoji. */
export const clippyLine = (m: ClippyMood, percent: number): string =>
  m === 'panic' ? `Місце закінчується (${percent}%). Збери handoff, поки не пізно.` : m === 'worried' ? 'Контекст уже заповнюється. Подумай про handoff.' : ''

const BODY = '<path d="M45 200 L45 20 Q45 -5 70 -5 Q95 -5 95 20 L95 175 Q95 195 75 195 Q55 195 55 175 L55 40 Q55 28 70 28 Q85 28 85 40 L85 160" fill="none" stroke="#9aa3ad" stroke-width="10" stroke-linecap="round"/>'

const FACE: Record<ClippyMood, string> = {
  calm:
    '<circle cx="58" cy="40" r="10" fill="#fff" stroke="#111" stroke-width="3"/><circle cx="82" cy="40" r="10" fill="#fff" stroke="#111" stroke-width="3"/>' +
    '<circle cx="60" cy="41" r="4" fill="#111"/><circle cx="84" cy="41" r="4" fill="#111"/>' +
    '<path d="M60 64 Q70 72 80 64" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>',
  worried:
    '<circle cx="58" cy="40" r="11" fill="#fff" stroke="#111" stroke-width="3"/><circle cx="82" cy="40" r="11" fill="#fff" stroke="#111" stroke-width="3"/>' +
    '<circle cx="55" cy="42" r="4" fill="#111"/><circle cx="79" cy="42" r="4" fill="#111"/>' +
    '<path d="M50 24 L64 29 M88 24 L76 29" stroke="#111" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M60 68 Q70 62 80 68" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>',
  panic:
    '<circle cx="58" cy="40" r="12" fill="#fff" stroke="#111" stroke-width="3"/><circle cx="82" cy="40" r="12" fill="#fff" stroke="#111" stroke-width="3"/>' +
    '<circle cx="58" cy="40" r="3" fill="#111"/><circle cx="82" cy="40" r="3" fill="#111"/>' +
    '<ellipse cx="70" cy="68" rx="7" ry="9" fill="#7f1d1d" stroke="#111" stroke-width="3"/>' +
    '<path d="M100 20 Q106 30 100 36 Q94 30 100 20" fill="#378ADD"/>',
}

/** A small Clippy as an SVG document for the desktop `Svg` element. */
export const clippySvg = (m: ClippyMood): string => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -20 200 250">${BODY}${FACE[m]}</svg>`
