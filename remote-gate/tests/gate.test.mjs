import assert from 'node:assert/strict'
import { test } from 'node:test'

import { classify, repoDir } from '../hooks/gate.ts'

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
