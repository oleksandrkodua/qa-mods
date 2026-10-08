import type { Register } from 'claude-code'

const QUESTION: Record<string, string> = {
  compact: 'Стиснути розмову? Її буде замінено підсумком, щоб звільнити контекст; подробиці втрачаються.',
  clear: 'Очистити всю розмову? Почнеться з порожнього контексту, це неможливо скасувати.',
}
const CHOICES = ['Підтвердити', 'Скасувати']

/**
 * Quick actions: VS Code has no band above the prompt, so there the typed `/compact` and `/clear` ask first
 * (confirm / cancel; cancel changes nothing). On the desktop and in the terminal the Compact and Clear buttons are in
 * the hud band and ask themselves: a button cannot go through here, because the engine refuses `command.run` from a
 * `command.run` hook. A run that a plugin started is never asked twice.
 */
export const register: Register = on => {
  let surface = ''

  on('session.start', ($, e, next) => {
    surface = String(e.surface ?? '')

    return next(e)
  })

  on('command.run', { command: ['compact', 'clear'] }, async ($, e, next) => {
    if (e.origin.kind === 'plugin' || surface !== 'vscode') return next(e)

    const answer = await $.ui.ask(QUESTION[e.command] ?? 'Виконати?', CHOICES).catch(() => CHOICES[1])

    return answer === CHOICES[0] ? next(e) : { text: `/${e.command} скасовано: нічого не змінено.` }
  })
}
