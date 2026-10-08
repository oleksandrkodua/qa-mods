import assert from 'node:assert/strict'
import { test } from 'node:test'

import { checkCommand, checkPath } from '../hooks/guard.ts'

const H = '/Users/x'

test('paths', () => {
  assert.equal(checkPath('/Users/x/.claude/settings.json', H), '~/.claude/settings')
  assert.equal(checkPath('/Users/x/.claude/skills/a/SKILL.md', H), '~/.claude/skills/')
  assert.equal(checkPath('/Users/x/Desktop/WINWIN/a.md', H), null)
})

test('commands: only writes are blocked', () => {
  assert.equal(checkCommand('cat ~/.claude/settings.json', H), null)
  assert.equal(checkCommand('echo {} > ~/.claude/settings.json', H), '~/.claude/settings')
  assert.equal(checkCommand('mkdir -p $HOME/.claude/skills/new', H), '~/.claude/skills/')
  assert.equal(checkCommand('brew install jq # /opt/homebrew', H), '/opt/homebrew')
  assert.equal(checkCommand('ls ~/.local/bin', H), null)
})

test('docs and code that merely mention protected paths are not blocked', () => {
  const doc = "python3 - <<'EOF'\nopen('INSTALL.md','w').write('copy to ~/.claude/plugins/ with cp')\nEOF"
  assert.equal(checkCommand(doc, H), null)
  assert.equal(checkCommand('git commit -m "docs: mention ~/.claude/settings rm cp"', H), null)
  assert.equal(checkCommand('grep -r "x => y" ~/.claude/skills', H), null)
  assert.equal(checkCommand('ls ~/.claude/plugins 2>/dev/null', H), null)
  assert.equal(checkCommand('bash <<EOF\nrm ~/.claude/skills/x\nEOF', H), '~/.claude/skills/')
  assert.equal(checkCommand('echo hi > "$HOME/.claude/settings.json"', H), '~/.claude/settings')
})

test('a write and a read of a protected path in different segments is not a write there', () => {
  assert.equal(checkCommand('cp a.png evidence/x.png && ls -la ~/.claude/projects/p', H), null)
  assert.equal(checkCommand('ls ~/.claude/skills; echo hi > /tmp/x', H), null)
  assert.equal(checkCommand('ls x | tee ~/.claude/skills/y', H), '~/.claude/skills/')
  assert.equal(checkCommand('cp a ~/.claude/skills/b', H), '~/.claude/skills/')
})

test('a protected path that is only read (the source of cp or mv) is not blocked', () => {
  assert.equal(checkCommand('cp ~/.claude/plugins/cache/a/b.tsx ./b.tsx', H), null)
  assert.equal(checkCommand('cp -R "$HOME/.claude/plugins/x/." mods/plugin/', H), null)
  assert.equal(checkCommand('mv ~/.claude/skills/old.md /tmp/old.md', H), null)
  assert.equal(checkCommand('cp a b ~/.claude/skills/', H), '~/.claude/skills/')
  assert.equal(checkCommand('cp -t ~/.claude/skills/ a b', H), '~/.claude/skills/')
  assert.equal(checkCommand('rm -rf ~/.claude/plugins/cache/x', H), '~/.claude/plugins/')
  assert.equal(checkCommand("sed -i '' 's/a/b/' ~/.claude/settings.json", H), '~/.claude/settings')
  assert.equal(checkCommand('cat ~/.claude/settings.json > ./copy.json', H), null)
  assert.equal(checkCommand('ls ~/.claude/plugins >> out.txt', H), null)
  assert.equal(checkCommand('python3 x.py 2> ~/.claude/projects/err.log', H), '~/.claude/projects/')
})
