/* @jsxRuntime classic */
/* @jsx h */
import { test, expect } from 'claude-code/testing'

// VS Code draws no band above the prompt, so a fork there would be spent for nothing (the vscode branch was removed in uk.5).
const ANSWER = 'Cloudflare Workers сам викликає обробник scheduled() за cron-виразом із wrangler.toml. '.repeat(3).trimEnd()

const stubs = (on: any, forks: string[], reply = '[{"label":"Запусти тести","prompt":"запусти npm test"}]') => {
  on('session.start', async ($: any, e: any) => ({ cwd: e.cwd }) as never)
  on('turn.complete', async () => ({ text: '' }) as never)
  on('command.list', async () => ({ value: [] }) as never)
  on('ui.log', async () => ({}) as never)
  on('prompt.suggest', async () => ({ isShown: false }) as never)
  on('ui.render', async (t: any, e: any) => { const { Text } = t.ui.resolve(e); return <Text>reply</Text> })
  on('model.fork', async () => (forks.push('fork'), { value: { isAnswered: true, text: reply, usage: {} } }) as never)
}

test('vscode: no fork is spent, nothing could be drawn there', async ($, on) => {
  const forks: string[] = []
  stubs(on, forks)
  await $.session.start({ surface: 'vscode', isInteractive: true, cwd: '/work' } as never)
  await $.turn.complete({ turnId: 't1', answer: ANSWER, durationMs: 1, isAborted: false, reason: 'answer' } as never)
  await new Promise(r => setTimeout(r, 0))
  expect(forks).toHaveLength(0)
})

test('desktop: a long answer asks the fork and the band offers the suggestion', async ($, on) => {
  const forks: string[] = []
  stubs(on, forks)
  await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' } as never)
  await $.turn.complete({ turnId: 't1', answer: ANSWER, durationMs: 1, isAborted: false, reason: 'answer' } as never)
  await new Promise(r => setTimeout(r, 0))
  expect(forks).toHaveLength(1)
  const ui = await $.ui.mount({ plugin: 'next-steps-uk', surface: 'desktop', component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100, scroll: { bodyRows: 10 }, view: {} } } as never)
  expect(await ui.find({ type: 'Button', text: /Запусти тести/ } as never)).toBeDefined()
  await ui.unmount()
})

const three = (a: string, b: string, c: string) => JSON.stringify([{ label: a, prompt: 'p1' }, { label: b, prompt: 'p2' }, { label: c, prompt: 'p3' }])
const offer = async ($: any, on: any, reply: string) => {
  stubs(on, [], reply)
  await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' } as never)
  await $.turn.complete({ turnId: 't1', answer: ANSWER, durationMs: 1, isAborted: false, reason: 'answer' } as never)
  await new Promise(r => setTimeout(r, 0))

  return $.ui.mount({ plugin: 'next-steps-uk', surface: 'desktop', component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100, scroll: { bodyRows: 10 }, view: {} } } as never)
}

test('short labels: all three are chips in one row, no "ще"', async ($, on) => {
  const ui = await offer($, on, three('Видалити файл', 'Запис у settings', 'Підсумок'))
  for (const t of [/Видалити файл/, /Запис у settings/, /Підсумок/]) expect(await ui.find({ type: 'Button', text: t } as never)).toBeDefined()
  expect(await ui.find({ type: 'Button', text: /ще \d/ } as never)).toBeUndefined()
  // the hotkey badge already shows the number: the label must not repeat it
  expect(await ui.find({ type: 'Button', text: /^\s*[1-3]\s/ } as never)).toBeUndefined()
  await ui.unmount()
})

test('long labels: the first chip and "ще 2" keep it to one row', async ($, on) => {
  const long = 'Запустити повний регрес blast-radius'
  const ui = await offer($, on, three(long, 'Перевірити ще одну гілку у sudo', 'Зібрати підсумок усього тесту'))
  expect(await ui.find({ type: 'Button', text: /Запустити повний/ } as never)).toBeDefined()
  expect(await ui.find({ type: 'Button', text: /ще 2/ } as never)).toBeDefined()
  expect(await ui.find({ type: 'Button', text: /Перевірити ще одну/ } as never)).toBeUndefined()
  await ui.unmount()
})
