import assert from 'node:assert/strict'
import { test } from 'node:test'

import { classify, pushSummary, remoteDbSummary, repoDir } from '../hooks/gate.ts'

const URL = 'https://github.com/o/r.git'
const ctx = (commits = [], extra = {}) => ({ branch: 'main', remotes: [{ name: 'origin', url: URL }, { name: 'backup', url: 'git@x.com:b.git' }], commits, ...extra })

test('pushSummary: says what goes where, and how much it can hurt', () => {
  assert.equal(pushSummary('git push origin main', ctx(['a1 one', 'b2 two'])), `Відправить main з локальної теки в remote origin (${URL}) (нових комітів: 2). Зміни одразу з'являться на сервері.`)
  assert.equal(pushSummary('git push', ctx([])), `Відправить гілку main з локальної теки в remote origin (${URL}) (нових комітів немає, на сервері майже нічого не зміниться).`)
  assert.equal(pushSummary('git push -u origin dev', ctx(null)), `Відправить dev з локальної теки в remote origin (${URL}) (upstream не задано, кількість комітів невідома) і запам'ятає її як основну (-u). Зміни одразу з'являться на сервері.`)
  assert.equal(pushSummary('git push backup', ctx(['a1 x'])), `Відправить гілку main з локальної теки в remote backup (git@x.com:b.git) (нових комітів: 1). Зміни одразу з'являться на сервері.`)
  assert.match(pushSummary('git push git@github.com:x/y.git main', ctx(['a1 x'])), /^Відправить main з локальної теки в remote git@github\.com:x\/y\.git \(/)
})

test('pushSummary: dry run, force, lease, delete, tags, all and mirror each get their own sentence', () => {
  assert.equal(pushSummary('git push --dry-run origin main 2>&1', ctx(['a1 x'])), `Пробний запуск (--dry-run): покаже, що було б відправлено в remote origin (${URL}), але нічого не відправить і нічого не змінить.`)
  assert.match(pushSummary('git push -n', ctx()), /^Пробний запуск/)
  assert.equal(pushSummary('git push -f origin main', ctx()), `ПРИМУСОВО (force) перезапише main у remote origin (${URL}): коміти на сервері, яких немає локально, буде втрачено.`)
  assert.match(pushSummary('git push origin +main:main', ctx()), /^ПРИМУСОВО \(force\) перезапише \+main:main у remote origin/)
  assert.equal(pushSummary('git push --force-with-lease', ctx()), `Примусово оновить гілку main у remote origin (${URL}), але лише якщо на сервері немає чужих нових комітів (--force-with-lease).`)
  assert.equal(pushSummary('git push origin --delete old-branch', ctx()), `ВИДАЛИТЬ old-branch у remote origin (${URL}): гілка зникне на сервері.`)
  assert.equal(pushSummary('git push origin :old-branch', ctx()), `ВИДАЛИТЬ old-branch у remote origin (${URL}): гілка зникне на сервері.`)
  assert.equal(pushSummary('git push --tags', ctx()), `Відправить усі локальні теги в remote origin (${URL}).`)
  assert.match(pushSummary('git push --all', ctx(['a1 x'])), /^Відправить усі локальні гілки в remote origin/)
  assert.match(pushSummary('git push --mirror', ctx()), /^ПЕРЕЗАПИШЕ усі refs у remote origin/)
})

test('pushSummary: git options, wrappers and other commands in the line do not confuse it', () => {
  assert.equal(pushSummary('git -C dir push origin main', ctx(['a1 x'])), `Відправить main з локальної теки в remote origin (${URL}) (нових комітів: 1). Зміни одразу з'являться на сервері.`)
  assert.equal(pushSummary('git stash push -q && git push origin main && rm -f x', ctx(['a1 x'])), `Відправить main з локальної теки в remote origin (${URL}) (нових комітів: 1). Зміни одразу з'являться на сервері.`)
  assert.match(pushSummary('git push -o ci.skip origin main', ctx(['a1 x'])), /^Відправить main з локальної теки в remote origin/)
})

test('remoteDbSummary: a wrangler --remote command works on the live database', () => {
  assert.equal(remoteDbSummary('wrangler d1 execute babtsya --remote --command "select * from ticks"'), 'Виконає запит у БОЙОВІЙ базі babtsya (Cloudflare D1, не локальній): лише читає дані. Зміни одразу бачать усі користувачі.')
  assert.equal(remoteDbSummary("wrangler d1 execute babtsya --remote --command 'DELETE FROM ticks'"), 'Виконає запит у БОЙОВІЙ базі babtsya (Cloudflare D1, не локальній): ЗМІНЮЄ дані. Зміни одразу бачать усі користувачі.')
  assert.match(remoteDbSummary('wrangler d1 execute db --remote --command "DROP TABLE x"'), /ЗМІНЮЄ структуру бази/)
  assert.equal(remoteDbSummary('wrangler deploy --remote'), 'Виконає команду wrangler проти бойового середовища Cloudflare (--remote), а не локального: зміни одразу побачать усі.')
})

test('classify: push, force push and remote wrangler', () => {
  assert.equal(classify('git push origin main'), 'push')
  assert.equal(classify('git -C public push'), 'push')
  assert.equal(classify('cd x && git push -u origin dev'), 'push')
  assert.equal(classify('git push --force origin main'), 'force-push')
  assert.equal(classify('git push -f'), 'force-push')
  assert.equal(classify('git push --force-with-lease'), 'force-push')
  assert.equal(classify('git push origin +main:main'), 'force-push')
  assert.equal(classify('wrangler d1 execute db --remote --command "select 1"'), 'remote-db')
})

test('classify: local commands and mentions are not gated', () => {
  for (const c of ['git status', 'git pull', 'git commit -m "push the button"', 'echo "git push"', 'wrangler d1 execute db --local', "cat <<'EOF'\ngit push origin main\nEOF"])
    assert.equal(classify(c), undefined, c)
})

test('classify: push counts only as the git subcommand, not as a word after another subcommand', () => {
  for (const c of [
    'git stash push',
    'git stash push hooks/analyze.ts -q',
    'git -C dir stash push -m wip',
    'git stash push -q && node --test tests/a.mjs 2>&1 | grep -E "x"; git stash pop -q && git status --short . | cat',
    'git log --grep push',
    'git log --oneline -- push.txt',
    'git config alias.p push',
    'git remote set-url --push origin x',
    'git branch push-fix',
    'git checkout -b push',
    'git submodule foreach git status && echo push',
    'echo push && git status',
    'cd push && git status',
  ])
    assert.equal(classify(c), undefined, c)
})

test('classify: a real push is still found after git options, wrappers and other commands', () => {
  for (const c of [
    'git -C dir push',
    'git -c http.proxy=x push origin main',
    'git --no-pager push',
    'git --git-dir=.git --work-tree=. push',
    'git --git-dir .git push',
    '/usr/bin/git push',
    'sudo git push',
    '(git push origin main)',
    'git stash push -q && git push origin main',
    'git status; git push',
    'git status | cat && git push',
    'git add -A && git commit -qm "x" && git push -u origin dev',
  ])
    assert.equal(classify(c), 'push', c)
})

test('classify: force is judged on the push itself, not on another command in the line', () => {
  assert.equal(classify('git push origin main && rm -f x.txt'), 'push')
  assert.equal(classify('rm -f x.txt && git push'), 'push')
  assert.equal(classify('git stash push -f && git push'), 'push')
  assert.equal(classify('git push -f && git push'), 'force-push')
  assert.equal(classify('git status && git -C dir push --force-with-lease'), 'force-push')
})

test('classify: a heredoc fed to a shell is still a push', () => {
  assert.equal(classify("bash <<'EOF'\ngit push origin main\nEOF"), 'push')
})

test('repoDir: git -C and a leading cd, with ~ expanded', () => {
  assert.equal(repoDir('git -C public push', '/Users/x'), 'public')
  assert.equal(repoDir('git -C "my repo" push origin main', '/Users/x'), 'my repo')
  assert.equal(repoDir('git -C ~/bot/public push', '/Users/x'), '/Users/x/bot/public')
  assert.equal(repoDir('cd ~/bot && git push', '/Users/x'), '/Users/x/bot')
  assert.equal(repoDir('git push origin main', '/Users/x'), undefined)
})
