// qa-mods fork: the title gets room, and a hover card carries the full title and the status.
// run: compile register.tsx to register.mjs (see README.md), then `node qa-fork.mjs`
import assert from 'node:assert/strict'
import { boot, S, st } from './engine.mjs'

const E = await boot('./register.mjs')
const TITLE = 'Тест: прогресс-бар, скрепка и next steps'
await E.call({ id: 'a', title: TITLE, stages: [S('Проверка', st('Первый', 'active'), 'Второй')] })

const render = cols => E.raw('ui.render', { component: 'AbovePrompt', surface: 'desktop', props: { bodyColumns: cols, hasSurvey: false } })
const collect = tree => {
  const out = { cards: [], texts: [] }
  const walk = n => {
    if (Array.isArray(n)) return n.forEach(walk)
    if (!n || typeof n !== 'object') return
    if (n.type === 'Box' && n.props?.hover && n.props?.display === 'none') out.cards.push(n)
    if (n.type === 'Text') out.texts.push(...[].concat(n.children ?? []).filter(c => typeof c === 'string'))
    ;(n.children ?? []).forEach(walk)
  }
  walk(tree)
  return out
}

// a title that fits has no hover card (nothing to reveal, and cards of several bars used to pile up over the band)
const { cards, texts } = collect(await render(120))
assert.equal(cards.length, 0, 'no hover card for a title that fits')
assert.ok(texts.filter(t => t === TITLE).length >= 1, 'the title is drawn in the row')
console.log('ok   qa_fork_no_hover_card_for_a_short_title')

// the track leaves the title room: at 120 columns the title takes about 330 px (it was ~100) and the track the rest
const w = (await E.svgs()).find(x => x.alt.startsWith(TITLE + ':')).width
assert.ok(w > 300 && w < 700, `track width ${w}`)
console.log('ok   qa_fork_title_room_track_width', w)

// a title that does not fit gets a ▾ button that opens it in full (wrapped); a short title gets none
const buttons = tree => {
  const out = []
  const walk = n => {
    if (Array.isArray(n)) return n.forEach(walk)
    if (!n || typeof n !== 'object') return
    if (n.type === 'Button') out.push(n.props)
    ;(n.children ?? []).forEach(walk)
  }
  walk(tree)
  return out
}
const LONG = 'Дуже довгий заголовок задачі, щоб перевірити, що він вміщується і повний текст видно при наведенні, а ще його можна розгорнути'
await E.call({ id: 'long', title: LONG, stages: [S('Вибір', st('Один', 'active'), 'Два')] })
const more = buttons(await render(120)).filter(b => b.label === '▾')
assert.equal(more.length, 2, 'every bar has the expand button (it used to be only a cut title)')
const longCards = collect(await render(120)).cards
assert.equal(longCards.length, 1, 'only the cut title gets a hover card')
const inLong = collect(longCards[0]).texts
assert.ok(inLong.length === 1 && LONG.startsWith(inLong[0].replace(/…$/, '')), 'the card carries the stored title and nothing else')
console.log('ok   qa_fork_long_title_has_expand_button')

// a Box width is in columns: the title cell must fit the 120-column band (it was set in px once and took the whole row)
const widths = tree => {
  const out = []
  const walk = n => {
    if (Array.isArray(n)) return n.forEach(walk)
    if (!n || typeof n !== 'object') return
    if (n.type === 'Box' && typeof n.props?.width === 'number') out.push(n.props.width)
    ;(n.children ?? []).forEach(walk)
  }
  walk(tree)
  return out
}
const ws = widths(await render(120))
assert.ok(ws.length > 0 && ws.every(x => x <= 120 * 0.45), `Box widths in columns: ${ws}`)
console.log('ok   qa_fork_title_box_width_is_in_columns', ws.join(','))

// qa.14: a finished bar stays a full row for 60 s, then folds into one line "✓ N готово ▾" on top of the bars
{
  const render2 = (X, cols = 120) => X.raw('ui.render', { component: 'AbovePrompt', surface: 'desktop', props: { bodyColumns: cols, hasSurvey: false } })
  const mk = (X, id, title) => X.call({ id, title, stages: [S('Этап', st('Шаг', 'active'), 'Ещё')] })

  const F = await boot('./register.mjs')
  await mk(F, 'a', 'Сборка')
  await mk(F, 'b', 'Тесты')
  await mk(F, 'c', 'Миграция')
  await F.call({ id: 'a', state: 'done' })
  await F.call({ id: 'b', state: 'done' })

  F.tick(59_000)
  const t0 = collect(await render2(F)).texts
  assert.ok(t0.includes('Сборка') && t0.includes('Тесты') && !t0.some(x => /готово/.test(x)), 'at 59 s the finished bars are still full rows')

  F.tick(2_000)
  const t1 = collect(await render2(F)).texts
  assert.ok(t1.includes('2 готово'), `at 61 s a fold line with the count: ${t1}`)
  assert.ok(!t1.includes('Сборка') && !t1.includes('Тесты'), 'the finished bars are not drawn while folded')
  assert.ok(t1.includes('Миграция'), 'the open bar stays')
  const toggle = buttons(await render2(F)).find(b => b.label === '▾')
  assert.ok(toggle, 'a ▾ button opens the folded bars')
  await toggle.onPress()
  const t2 = collect(await render2(F)).texts
  assert.ok(t2.includes('Сборка') && t2.includes('Тесты'), 'opened: the finished bars are drawn again')
  assert.ok(buttons(await render2(F)).some(b => b.label === '▴'), 'and the button turns into ▴')
  console.log('ok   qa_fork_finished_bars_hold_60s_then_fold')

  await mk(F, 'd', 'Свежий')
  await F.call({ id: 'd', state: 'done' })
  const t3 = collect(await render2(F)).texts
  assert.ok(t3.includes('Свежий') && t3.includes('2 готово'), 'a bar finished just now is a row; the fold counts only the old ones')
  console.log('ok   qa_fork_fresh_done_bar_is_not_folded')
}

// qa.11: the ▾ opens the steps of its bar with their detail line; a finished bar stays past the limit
await E.call({ id: 'det', title: 'Detail', stages: [S('One', { title: 'Step A', status: 'active', detail: 'detail-line-A' }, 'Step B')] })
const before = collect(await render(120)).texts.join(' ')
assert.ok(!before.includes('detail-line-A'), 'the detail is hidden until the bar is opened')
const open = buttons(await render(120)).filter(b => b.label === '▾')
await open[open.length - 1].onPress()
const after = collect(await render(120)).texts.join(' ')
assert.ok(after.includes('Step A') && after.includes('detail-line-A') && after.includes('етап 1 з 1'), 'opened: the steps, the detail and the footer are drawn')
console.log('ok   qa_fork_expand_shows_steps_and_detail')
