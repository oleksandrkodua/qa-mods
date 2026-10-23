# Prompt for the next session (local Claude Code)

Paste everything below the line into a new Claude Code session, opened in the local clone of `qa-mods`.

---

## Role and goal
You are working in the `oleksandrkodua/qa-mods` repository, which holds mods for Claude Code. The cloud session added animated helper characters to the `handoff` mod but did not wire them in. Your job:
1. bring the local repository and the installed local copy of the mod up to date;
2. wire the characters into the mod;
3. verify the result.
Reply in Russian. Keep the diff minimal and touch only what the task needs.

## What was done (cloud session, commit `f1597bd` in `main`)
- New file `handoff/hooks/characters.ts`, about 1100 lines: an SVG generator with SMIL animation. Nothing imports it yet.
  - Four characters, `WHO = ['clippy','wizard','dog','cat']`: Скріпка, Чарівник, Пес, Кіт.
  - `EMOTIONS`: 31 states. `BEHAVIORS[who]`: 123 behaviours taken from the original Office assistants (clippy.js was used only as a reference).
  - API: `characterSvg(who, state, w=46): string`, `characterAlt(who, state): string`, plus `NAME` and `UK`.
  - Checked in the cloud: all 247 states render, the largest SVG is 22 796 characters (the engine allows 131 072), there are no `<script>` tags or NaN values, and the Chromium render looks correct.
- Not done: `register.tsx` is unchanged, the version is still `0.6.3`, and no tests or notes were added.
- Agreed design decisions:
  - Switcher variant **В′**: a row of four dots under the character, each in its character's colour. The selected dot is larger (`◉`, 13px, opacity 1); the others are `●`, 10px, opacity 0.55. Hovering a dot shows the character's name.
  - Colours: clippy `#7d8792`, wizard `#2f4fb3`, dog `#d9941c`, cat `#2e9a52`.
- Engine constraints:
  - SMIL plays only in `<Svg isInteractive>`.
  - The SVG source is limited to 131 072 characters.
  - The terminal does not animate SVG; it keeps the text faces from `clippy.ts`.

## Step 1. Sync (ask the user before every command that changes the working tree)
```bash
cd <path to the local qa-mods>
git status                # must be clean; otherwise stop and ask
git pull origin main      # must bring in f1597bd
```
Then find out where the local Claude Code actually loads `handoff` from: `--plugin-dir`, `CLAUDE_CODE_PLUGIN_DIRS`, `~/.claude/plugins/...`, or the marketplace. Run `/plugin` or check the settings. Do not guess.
- If it loads straight from the clone, nothing needs copying.
- If it loads from a copy or from the marketplace, update that copy the same way the user normally does: reinstall or copy. Ask before overwriting anything.

## Step 2. Wire the characters in (`handoff/hooks/register.tsx`)
1. Read `register.tsx`, `clippy.ts` and `logic.ts`, and see how the Clippy and its moods (calm/worried/panic, talking) are drawn now.
2. On the desktop surface, swap the current SVG for `<Svg isInteractive source={characterSvg(who, state)} .../>`, with `characterAlt` as the alt text. Map the existing moods onto `EMOTIONS`. Show the rare behaviours from `BEHAVIORS` occasionally while idle, and on events such as `tool.call` with `isError` and `turn.complete`.
3. Add the В′ switcher under the character, using the `Button` components from `$.ui.resolve(e)`.
4. Store the choice in `$.store` so it survives across sessions. If the stored value is not in `WHO`, fall back to `clippy`.
5. Leave the terminal as it is.
6. Bump the version in `handoff/.claude-plugin/plugin.json`: 0.6.3 → 0.7.0.

## Step 3. Verify (mark each check PASS, FAIL or NOT VERIFIED)
1. `claude plugin validate handoff` → no errors
2. `tsc -p handoff` → 0 errors
3. `claude plugin test handoff` → old and new tests pass. New tests should cover the default `clippy`, the stored choice being restored, and an invalid value falling back.
4. Manual desktop check: the character moves, the dots switch characters, and after a restart the choice is kept.
5. Terminal: the band looks the same as before.

## Step 4. Commit
Commit only after every check passes and the user agrees: `git add`, `git commit`, `git push origin main`. Check that nothing secret is staged.
If a local copy outside the repo was updated, say so in the report.

## Final report
Done / Verified / Not verified / Risks.
