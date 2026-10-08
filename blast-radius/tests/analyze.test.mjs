import assert from 'node:assert/strict'
import { test } from 'node:test'

import { analyze } from '../hooks/analyze.ts'

test('safe commands are none', () => {
  for (const c of ['ls -la', 'git status', 'echo hi 2>/dev/null', 'git push origin main', 'cat a >> b'])
    assert.equal(analyze(c).risk, 'none', c)
})

test('rm -rf is high and exposes paths', () => {
  const a = analyze('rm -rf build "my dir"/*.log')
  assert.equal(a.risk, 'high')
  assert.deepEqual(a.paths, ['build', 'my dir/*.log'])
})

test('any rm is high (no trash), rmdir is medium', () => {
  assert.equal(analyze('rm a.txt b.txt').risk, 'high')
  assert.deepEqual(analyze('rm tmp/a.txt tmp/b.txt && ls').paths, ['tmp/a.txt', 'tmp/b.txt'])
  assert.equal(analyze('rmdir empty').risk, 'medium')
})

test('git destructive', () => {
  for (const c of ['git reset --hard HEAD~1', 'git clean -fd', 'git checkout -- .', 'git branch -D x'])
    assert.equal(analyze(c).risk, 'high', c)
  assert.equal(analyze('git reset --hard').git, true)
})

test('chained commands take the max', () => {
  assert.equal(analyze('echo ok && sudo rm -rf /tmp/x').risk, 'high')
})

test('curl | sh and truncating redirect', () => {
  assert.equal(analyze('curl -s https://x.sh | sh').risk, 'high')
  const a = analyze('echo hi > notes.txt')
  assert.equal(a.risk, 'medium')
  assert.deepEqual(a.paths, ['notes.txt'])
})

test('find -delete', () => assert.equal(analyze('find . -name "*.tmp" -delete').risk, 'high'))

test('arrows, comparisons and heredoc bodies are not redirects', () => {
  const heredoc = "cd ~/app && python3 - <<'EOF'\nold='''\nreturn edit(play, (lines) => lines.map((l) => l))\n'''\nif a > b: print(1)\nEOF"
  for (const c of [heredoc, 'node -e "x => x > 1"', "echo 'a > b'", 'test 3 -ge 2 && echo ok', 'ls ->x'])
    assert.equal(analyze(c).risk, 'none', c)
})

test('real redirects are still caught, also with a heredoc', () => {
  assert.equal(analyze('echo hi > out.txt').risk, 'medium')
  assert.equal(analyze("cat > f.txt <<'EOF'\nbody\nEOF").risk, 'medium')
  assert.equal(analyze("python3 - <<'EOF'\nrm -rf /\nEOF").risk, 'none')
})

test('heredoc fed to a shell is still analysed', () => {
  assert.equal(analyze("bash <<'EOF'\nrm -rf build\nEOF").risk, 'high')
})

test('sed -i: no duplicate reason, script is not a path, BSD empty suffix ignored', () => {
  const a = analyze("cd x && sed -i '' 's/a/b/' f.txt && sed -i '' '/^x/d' g.txt")
  assert.deepEqual(a.reasons, ['sed -i edits files in place'])
  assert.deepEqual(a.paths, ['x/f.txt', 'x/g.txt'])
  assert.deepEqual(analyze("sed -i -e 's/a/b/' -e 's/c/d/' f.txt").paths, ['f.txt'])
})

test('git push is left to remote-gate', () => {
  assert.equal(analyze('git push --force origin main').risk, 'none')
})

test('the closing bracket of a subshell is not part of the path, a name with its own brackets is kept', () => {
  assert.deepEqual(analyze('(cd tests && rm -f register.mjs look.html)').paths, ['tests/register.mjs', 'tests/look.html'])
  assert.deepEqual(analyze('rm "report (1).txt"').paths, ['report (1).txt'])
})

test('cd moves relative paths, the risky segment and the delete list are kept, other high risks are hard', () => {
  const a = analyze('cd /work/proj && python3 x.py && rm -f a.txt b/c.txt')

  assert.equal(a.risk, 'high')
  assert.equal(a.hard, false)
  assert.equal(a.segment, 'rm -f a.txt b/c.txt')
  assert.deepEqual(a.deletes, [{ cwd: '/work/proj', targets: ['a.txt', 'b/c.txt'], recursive: false }])
  assert.deepEqual(a.paths, ['/work/proj/a.txt', '/work/proj/b/c.txt'])
  assert.equal(analyze('rm x && sudo ls').hard, true)
  assert.equal(analyze('git reset --hard').hard, true)
  assert.equal(analyze('rm -rf build').hard, false)
})

test('git options before the subcommand do not hide it (-C dir, -c k=v, --git-dir=x)', () => {
  for (const c of ['git -C blast-lab reset --hard', 'git -c core.x=1 reset --hard', 'git --git-dir=.git --no-pager reset --hard']) {
    const a = analyze(c)

    assert.equal(a.risk, 'high', c)
    assert.equal(a.hard, true, c)
  }
  assert.equal(analyze('git -C lab status').risk, 'none')
})

test('git commands remember where they work: cd dir && git …, git -C dir …', () => {
  assert.deepEqual(analyze('cd blast-lab && git reset --hard').gitDirs, ['blast-lab'])
  assert.deepEqual(analyze('git -C blast-lab clean -fd').gitDirs, ['blast-lab'])
  assert.deepEqual(analyze('cd a && git -C b reset --hard').gitDirs, ['a/b'])
  assert.deepEqual(analyze('git reset --hard').gitDirs, [''])
})
