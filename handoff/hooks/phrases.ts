import type { ClippyMood } from './clippy'

/** Random remarks, by mood. Short plain Ukrainian, QA flavoured, no emoji, nobody targeted. Edit freely. */
export const PHRASES: Record<ClippyMood, string[]> = {
  calm: [
    'Баг не вовк, у прод не втече.',
    'Скриншот-доказ уже збережено?',
    'Severity оцінюй за ТЗ, а не за гучністю бага.',
    'Випий води. Тест-кейси почекають.',
    'Автоматизація це результат ручного QA, а не його заміна.',
    'Граничні значення перевірив? Мінус один, нуль, максимум.',
    'Це баг чи фіча? Відкрий ТЗ.',
    '«На моїй машині працює» не є кроками відтворення.',
    'Один сценарій, одна перевірка. Не складай все в один тест.',
    'Я лише скріпка, але глянь на цей крок ще раз.',
    'Емулятор viewport не замінює справжній пристрій.',
  ],
  worried: [
    'Контекст уже заповнюється. Може, час на handoff?',
    'Тримайся: ще є місце, але вже не безмежно.',
    'Закоміть зроблене, поки є запас контексту.',
  ],
  panic: [
    'Місце майже скінчилось. Handoff, швидко!',
    'Збери HANDOFF.md, поки не пізно.',
    'Ще трохи і доведеться починати з нуля. Handoff!',
  ],
}

/** A phrase for the mood, never the same as the last one (when the pool has more than one). */
export function pickPhrase(mood: ClippyMood, last: string, rnd: () => number): string {
  const pool = PHRASES[mood].filter(p => p !== last)
  const from = pool.length > 0 ? pool : PHRASES[mood]

  return from[Math.min(from.length - 1, Math.floor(rnd() * from.length))]
}

/** Milliseconds until the next remark: the base interval times a random 0.5..1.5. */
export const nextDelay = (everySeconds: number, rnd: () => number): number => Math.round(everySeconds * 1000 * (0.5 + rnd()))
