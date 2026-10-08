import type { Register } from 'claude-code'

import { stats, unifiedDiff } from './diff'

const PANE = 'replay-theater'
const MAX_STEPS = 200

interface Step {
  n: number
  tool: string
  path: string
  diff: string
}

/**
 * Replay Theater: records each successful Edit/Write as a diff step and lets
 * `/replay` page through them with Prev / Next.
 */
export const register: Register = on => {
  const steps: Step[] = []
  let cursor = 0

  on('session.start', async ($, e, next) => {
    // a build that already ships /replay refuses the name: keep going without it
    await $.command
      .register({
        name: 'replay',
        description: 'Step through this session’s file edits, one diff at a time',
      })
      .catch(() => undefined)

    return next(e)
  })

  on('tool.call', { tool: ['Edit', 'Write'] }, async ($, e, next) => {
    const path = String(e.file_path ?? '')
    const before = await $.fs.read(path).then(
      t => (typeof t === 'string' ? t : ''),
      () => '',
    )

    const ran = await next(e)

    if (ran.deny === undefined && ran.isError !== true) {
      const after = await $.fs.read(path).then(
        t => (typeof t === 'string' ? t : ''),
        () => '',
      )

      steps.push({ n: steps.length + 1, tool: e.tool, path, diff: unifiedDiff(before, after) })

      if (steps.length > MAX_STEPS) steps.shift()

      cursor = steps.length - 1
      $.ui.invalidate('ui.render')
    }

    return ran
  })

  on('command.run', { command: 'replay' }, async ($, e) => {
    if (steps.length === 0) return { text: 'Replay Theater: no file edits recorded in this session yet.' }

    // `/replay`, `/replay 2`, `/replay next`, `/replay prev`: text works on every surface.
    const arg = String(e.args ?? '').trim()

    if (arg === 'next') cursor = Math.min(steps.length - 1, cursor + 1)
    else if (arg === 'prev') cursor = Math.max(0, cursor - 1)
    else if (/^\d+$/.test(arg)) cursor = Math.min(steps.length, Math.max(1, Number(arg))) - 1
    else cursor = steps.length - 1

    const s = steps[cursor]!
    const { added, removed } = stats(s.diff)
    const index = steps.map((x, i) => `${i === cursor ? '▶' : ' '} ${i + 1}. ${x.tool} ${x.path}`).join('\n')

    await $.ui.open({ id: PANE, title: 'Replay Theater' }).catch(() => undefined)

    return {
      text: `Replay Theater — step ${cursor + 1}/${steps.length}: ${s.tool} ${s.path} (+${added} −${removed})\n\n${s.diff}\n\n${index}\n\n/replay next · /replay prev · /replay <n>`,
    }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Code } = $.ui.resolve(e)
    const s = steps[cursor]

    if (!s) return <Text dimColor>No edits recorded.</Text>

    const { added, removed } = stats(s.diff)

    const go = (d: number) => () => {
      cursor = Math.min(steps.length - 1, Math.max(0, cursor + d))
      $.ui.invalidate('ui.render')
    }

    return (
      <Box flexDirection="column">
        <Box flexDirection="row">
          <Button label="◀ Prev" hotkey="p" onPress={go(-1)} />
          <Text>{` step ${cursor + 1}/${steps.length} `}</Text>
          <Button label="Next ▶" hotkey="n" onPress={go(1)} />
        </Box>
        <Text bold>{`${s.tool} · ${s.path} (+${added} −${removed})`}</Text>
        <Code source={s.diff} format="diff" path={s.path} />
      </Box>
    )
  })
}
