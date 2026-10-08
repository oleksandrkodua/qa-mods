export const HANDOFF_PROMPT = `Підготуй передачу контексту в новий чат. Нічого не коміть і не деплой.

1. Онови (або створи в корені проєкту) HANDOFF.md і CONTEXT.md:
   - HANDOFF.md: що зроблено в цій сесії, що відкрито і що перевірити наступним кроком, що НЕ відкочувати.
   - CONTEXT.md: рішення і причини, додай записи поруч з наявними, нічого не стирай.
   - Не вигадуй: чого не підтвердив, познач як «не перевірено» і напиши, де шукав.
2. Покажи diff обох файлів.
3. Наприкінці дай короткий промпт для нового чату: «Спершу прочитай HANDOFF.md, потім CONTEXT.md», плюс один рядок, з якого кроку продовжити.`

/** 0 below the threshold, then 1 at it and +1 for every further 5 points (80 → 1, 85 → 2, 90 → 3). */
export const hintLevel = (percent: number, at: number): number => (percent >= at ? 1 + Math.floor((percent - at) / 5) : 0)

export const hintLine = (percent: number): string => `⏱ Контекст ${percent}%: скоро не вистачить місця. Щоб передати роботу в новий чат, введи /handoff: підготую HANDOFF.md і CONTEXT.md.`
