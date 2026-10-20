/** The command of the active-memory plugin (`/active-memory:amhandoff`) writes the whole handoff; the mod only puts it in the box. */
export const HANDOFF_PROMPT = `/active-memory:amhandoff`

/** 0 below the threshold, then 1 at it and +1 for every further 5 points (80 → 1, 85 → 2, 90 → 3). */
export const hintLevel = (percent: number, at: number): number => (percent >= at ? 1 + Math.floor((percent - at) / 5) : 0)

export const hintLine = (percent: number): string => `⏱ Контекст ${percent}%: скоро не вистачить місця. Щоб передати роботу в новий чат, введи /handoff: у полі з'явиться /active-memory:amhandoff.`
