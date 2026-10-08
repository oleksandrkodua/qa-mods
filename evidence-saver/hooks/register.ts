import type { Register } from 'claude-code'

import { findImages } from './images'

const MAX_B64 = 8_000_000
const KEY = 'evidence-dir'
const NO = "Don't save screenshots"
const LATER = 'Ask me next time'

/**
 * Evidence Saver: persists screenshots from tool results immediately, into a folder the
 * user chooses. No default location: the first screenshot asks, the answer is remembered
 * (`$.store`), `/evidence-dir` shows or changes it.
 * Base64 goes to a temp text file via $.fs.write (no argv limit), python3 decodes it.
 */
/** Absolute folder path from user input (`~/` expanded with home), or null. */
const resolvePath = (home: string, raw: string): string | null => {
  const p = raw.trim().replace(/^["']|["']$/g, '')

  if (p.startsWith('~/')) return `${home}${p.slice(1)}`

  return p.startsWith('/') ? p.replace(/\/+$/, '') : null
}

export const register: Register = on => {
  let counter = 0
  let declined = false

  on('session.start', async ($, e, next) => {
    // a name already taken must not break the mod
    await $.command
      .register({
        name: 'evidence-dir',
        description: 'Show, set (/evidence-dir /absolute/path) or reset (/evidence-dir reset) where screenshots are saved',
      })
      .catch(() => undefined)

    return next(e)
  })

  on('command.run', { command: 'evidence-dir' }, async ($, e) => {
    const arg = String(e.args ?? '').trim()

    if (arg === 'reset') {
      await $.store.delete(KEY)
      declined = false

      return { text: 'Evidence Saver: folder cleared. It will ask again at the next screenshot.' }
    }

    if (arg) {
      const dir = resolvePath(String((await $.env.get('HOME')) ?? ''), arg)

      if (!dir) return { text: 'Evidence Saver: give an absolute path (starting with / or ~/).' }

      await $.store.set(KEY, dir)
      declined = false

      return { text: `Evidence Saver: screenshots will be saved to ${dir}` }
    }

    const dir = String((await $.store.get(KEY)) ?? '')

    return { text: dir ? `Evidence Saver folder: ${dir}` : 'Evidence Saver: no folder set yet. Set one with /evidence-dir /absolute/path.' }
  })

  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    const saved: string[] = []

    try {
      const images = findImages(ran)

      if (images.length && !declined) {
        let dir = String((await $.store.get(KEY)) ?? '')

        if (!dir) {
          const answer = await $.ui
            .ask(
              'Evidence Saver: a screenshot was just returned. Which folder should screenshots be saved to? Type the absolute folder path under "Other", or pick an option.',
              [NO, LATER],
            )
            .catch(() => LATER)

          if (answer === NO) declined = true
          else if (answer !== LATER) {
            const picked = resolvePath(String((await $.env.get('HOME')) ?? ''), answer)

            if (picked) {
              dir = picked
              await $.store.set(KEY, picked)
            } else {
              $.ui.log('Evidence Saver: that was not an absolute path (start with / or ~/); not saved.')
            }
          }
        }

        if (dir) {
          const iso = new Date(await $.clock.now()).toISOString()

          for (const img of images) {
            if (img.b64.length > MAX_B64) {
              $.ui.log(`Evidence Saver: image too large (${img.b64.length} b64 chars), not saved`)
              continue
            }

            const base = `${dir}/${iso.slice(0, 10)}/${iso.slice(11, 19).replaceAll(':', '')}-${String(++counter).padStart(3, '0')}-${String(e.tool).replace(/\W+/g, '_')}`
            const file = `${base}.${img.ext}`

            await $.fs.write(`${base}.b64`, img.b64)
            await $.process.run([
              'python3',
              '-c',
              'import sys,base64,os;open(sys.argv[2],"wb").write(base64.b64decode(open(sys.argv[1]).read()));os.remove(sys.argv[1])',
              `${base}.b64`,
              file,
            ])

            saved.push(file)
            $.ui.log(`Evidence Saver: saved ${file}`)
          }
        }
      }
    } catch {
      // saving evidence must never break the tool call
    }

    // Logs are not drawn in VS Code; `context` reaches the model, which relays it.
    return saved.length && ran.deny === undefined && ran.isError !== true
      ? { ...ran, context: [...(ran.context ?? []), `evidence-saver: screenshot saved to ${saved.join(', ')}. Tell the user the path.`] }
      : ran
  })
}
