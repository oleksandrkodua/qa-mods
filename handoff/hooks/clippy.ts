export type ClippyMood = 'calm' | 'worried' | 'panic'

/** The mood follows the context fill: calm below `warn`, worried from it, panic from `at`. */
export const clippyMood = (percent: number, warn: number, at: number): ClippyMood => (percent >= at ? 'panic' : percent >= warn ? 'worried' : 'calm')

/** Terminal has no `Svg` element: a one-line face stands in for the picture. */
export const clippyFace = (m: ClippyMood): string => (m === 'panic' ? '(°□°)' : m === 'worried' ? '(•_•)' : '(•‿•)')

/** The speech-bubble line; empty while calm. Plain text, no emoji. */
export const clippyLine = (m: ClippyMood, percent: number): string =>
  m === 'panic' ? `Місце закінчується (${percent}%). Збери handoff, поки не пізно.` : m === 'worried' ? 'Контекст уже заповнюється. Подумай про handoff.' : ''
