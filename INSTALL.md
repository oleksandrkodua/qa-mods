# Installing the QA mods (CLI, Claude desktop app, VS Code)

Fourteen Claude Code mods, packaged as a **personal local marketplace** named `qa-mods`. It is just this folder on your machine, registered with `claude plugin marketplace add`; it is not published anywhere. To share it, put the folder in a git repo and add it by `<owner>/<repo>` or URL (see "Sharing the marketplace" below).

**Fresh machine? Start at "From scratch: everything in order" right below.** The rest of the file is reference: what each mod does, how it behaves on each surface, mistakes we made.

The CLI, the desktop app and the VS Code extension share `~/.claude`, so you install **once**.

## From scratch: everything in order

Updated 06.10.2026 from the real state of this machine (`~/.claude/plugins/installed_plugins.json`). Run every command in your **own Terminal**: a sandboxed Claude session cannot write `~/.claude`.

**0. Prerequisites**

| Needed | For | Check |
| --- | --- | --- |
| macOS | `notify` system notification (`osascript`); other mods are not OS-specific | `uname` → `Darwin` |
| `claude` CLI | every `claude plugin ...` command | `claude --version` (mods are on by default from 2.1.287) |
| `python3` | `evidence-saver` (decodes the image) and the flag snippet below | `python3 --version` |
| `git` | marketplaces from GitHub, `remote-gate` | `git --version` |
| `node` / `npx` | `playwright` MCP, `session-time-machine` installer | `npx --version` |

**1. Feature flag** (only for builds older than 2.1.287; harmless on newer ones): the snippet in section 1 below.

**2. Marketplaces and the whole pack, one command**

```bash
bash "$HOME/Desktop/MODS/install-pack.sh" --all --dry-run   # look at what it will run
bash "$HOME/Desktop/MODS/install-pack.sh" --all             # run it
```

Without `--all` the script installs only the 14 `qa-mods` plugins (and updates them on a re-run). With `--all` it first adds the other marketplaces and installs the third-party plugins from the table below. The same commands by hand:

```bash
# marketplaces (4)
claude plugin marketplace add "$HOME/Desktop/MODS"      # qa-mods (this folder; a local path)
claude plugin marketplace add anthropics/claude-plugins-official      # superpowers, playwright, code-review, claude-code-setup, telegram
claude plugin marketplace add anthropics/claude-plugins-community     # claude-community (next-steps is NOT installed, our fork replaces it)
claude plugin marketplace add genkovich/sdd                           # sdd (git: https://github.com/genkovich/sdd.git)

# qa-mods (14, plan-progress is our fork)
# if the original plan-progress is installed, remove it first: our fork has the same plugin name
claude plugin uninstall plan-progress@zycck-mods 2>/dev/null
for m in sandbox-guard remote-gate blast-radius retry-analyzer secret-redactor evidence-saver replay-theater verification-guard handoff notify quick-actions hud next-steps-uk plan-progress; do
  claude plugin install "$m@qa-mods"
done

# official and third-party plugins
claude plugin install superpowers@claude-plugins-official
claude plugin install playwright@claude-plugins-official
claude plugin install code-review@claude-plugins-official
claude plugin install claude-code-setup@claude-plugins-official
claude plugin install telegram@claude-plugins-official
claude plugin install sdd@sdd
```

If the folder name with spaces or Cyrillic gives trouble, copy `mods/` to a plain path (`~/claude-mods`) and add that.

**3. Allow the progress tool once** (otherwise `plan-progress` asks every session). Add `mcp__plan-progress__plan_progress` to `permissions.allow` in `~/.claude/settings.json`:

```bash
python3 - <<'E'
import json,os
p=os.path.expanduser("~/.claude/settings.json")
d=json.load(open(p)) if os.path.exists(p) else {}
a=d.setdefault("permissions",{}).setdefault("allow",[])
r="mcp__plan-progress__plan_progress"
if r not in a: a.append(r)
json.dump(d,open(p,"w"),indent=2,ensure_ascii=False)
print("ok", a)
E
```

**4. claude.ai plugins (account level, not CLI).** These are enabled in your claude.ai account (Settings → Connectors / Plugins) and appear in every session, including this machine's. `claude plugin install` does not manage them. Enabled on 06.10.2026: `tinyfish`, `datarobot-agent-skills`, `desktop-commander`, `pdf-viewer`, `adobe-for-creativity`, `design`, `cowork-plugin-management`. Several of their MCP servers need a separate sign-in in the connector settings: Adobe for creativity, Asana, Atlassian, Figma, Intercom, Linear, Notion, Slack (all five `design` ones), TinyFish. Until then their tools are not available. `desktop-commander` was enabled in the account but its tools did not show up in the 06.10.2026 session; cause not checked.

**5. Third-party extras, not in the script**

- `session-time-machine` (`/timemachine`): `npx claude-code-templates@latest --mod productivity/session-time-machine`, then `/reload-plugins`. Read its code first; details in "Time Machine" below. It is **not** in `installed_plugins.json` on 06.10.2026 (the test copy was cleaned up).
- `claude-community` marketplace is added only so the community `next-steps` could be found; do not install it next to `next-steps-uk`.

**6. Start a NEW session** on every surface (CLI, VS Code, desktop) and check:

```bash
claude plugin list
```

then the checks in "4. Verify" and "Live check of 06.10.2026" below.

### Inventory (what is installed, 06.10.2026)

| Plugin | Marketplace | Version | What it does | Options |
| --- | --- | --- | --- | --- |
| sandbox-guard | qa-mods | 0.1.5 | denies writes to config paths the sandbox cannot write; tells Claude to hand you a Terminal command | none |
| remote-gate | qa-mods | 0.1.1 | asks before `git push` and `wrangler --remote`; shows folder, branch, remote, outgoing commits | none |
| blast-radius | qa-mods | 0.5.4 | says what a risky Bash command touches; a deletion is judged by git (a dialog for uncommitted or untracked files, home, >20 files; other hard risks always; a dialog that cannot be shown cancels the command); short Ukrainian dialog `Виконати / Скасувати / Other`; `/blast` | none |
| retry-analyzer | qa-mods | 0.1.1 | notes a call that keeps failing the same way | none |
| secret-redactor | qa-mods | 0.1.5 | masks keys, tokens and password assignments in tool results | none |
| evidence-saver | qa-mods | 0.3.0 | saves screenshots from tool results to a folder you choose; `/evidence-dir` | none (`/evidence-dir`) |
| replay-theater | qa-mods | 0.1.3 | `/replay`: steps through the session's file edits as diffs | none |
| verification-guard | qa-mods | 0.1.1 | warns when "tests pass" / "done" has no matching tool call; `/evidence` | none |
| handoff | qa-mods | 0.6.2 | context fill always shown above the prompt (dim; amber from 50%; red from 80%) with a button (desktop) or hint (terminal) for `/handoff`; **prototype: a mini Clippy beside the band** (calm / worried / panic by context) with random remarks; VS Code: hint after the answer from 80% | `remarkEverySeconds` (120; 0 = off), `warnPercent` (50), `handoffAtPercent` (80) |
| notify | qa-mods | 0.2.1 | toast + macOS notification when a foreground Bash command ran 30 s+ or a turn ran 2 min+. **Background-task end is NOT announced since 0.2.1** | `longCommandSeconds` (30), `longTurnSeconds` (120), `systemNotification` (on) |
| quick-actions | qa-mods | 0.3.0 | VS Code only: a typed `/compact` or `/clear` asks to confirm first (the Compact and Clear buttons are in the hud band) | none |
| hud | qa-mods | 0.6.7 | one band above the prompt: context fill, 5-hour and 7-day limits (the `⏱` / `%` button switches percent and time left; a window whose reset time has passed shows `скинуто`), chip `кеш 59:48` (m:ss, ticks every second, only while the countdown runs), buttons Handoff / Compact / Clear / Прогрес; no `$` in the band (`/hud` prints cost and cache) | `cacheTtlMinutes` (60), `warnPercent` (80), `redPercent` (85) |
| next-steps-uk | qa-mods | 1.0.0-uk.9 | fork of next-steps: three next prompts in Ukrainian | `minAnswerChars` (80), `suggestSkills` (on) |
| plan-progress | qa-mods (fork of zycck-mods 0.7.6) | 0.7.6-qa.15 | progress bars above the prompt; `plan_progress` tool; `/progress*` commands; **wider title, the full title on hover, Ukrainian interface** | see its README |
| superpowers | claude-plugins-official | 6.4.1 | process skills (brainstorming, TDD, debugging, plans, worktrees) | none |
| playwright | claude-plugins-official | d4226d062928 | browser MCP (`mcp__playwright__*`) | none |
| code-review | claude-plugins-official | d4226d062928 | `/code-review` | none |
| claude-code-setup | claude-plugins-official | 1.0.0 | recommends automations for a project | none |
| telegram | claude-plugins-official | 0.0.7 | Telegram channel MCP; skills `telegram:access`, `telegram:configure`. **Failed to connect on 06.10.2026** ("Skipping connection", retried after 15 min); needs its own configuration | bot token via `telegram:configure` |
| sdd | sdd | 2.3.0 | spec-driven development skills and agents (`/sdd:*`) | see `sdd:config` |

Marketplaces on this machine: `claude-plugins-official` (anthropics/claude-plugins-official), `claude-community` (anthropics/claude-plugins-community), `sdd` (genkovich/sdd), `qa-mods` (directory: this folder), `zycck-mods` (zycck/claude-mods, the upstream of our `plan-progress` fork; no longer needed for installing, keep it only to read upstream changes).

### Live check of 06.10.2026 (this machine, desktop app, one session)

| Plugin | Result |
| --- | --- |
| secret-redactor | ✅ fake `sk-ant-…`, `password=…` and an AWS key id came back as `[REDACTED…]`; the hook also told Claude to say so |
| blast-radius | ✅ `mv` gave `⚠ Blast Radius [MEDIUM]` with "mv can overwrite existing files / Will touch: …" appended to the output, marked as added by the mod |
| sandbox-guard | ✅ `Write` into `~/.claude/skills/…` refused with `sandbox-guard: BLOCKED …` |
| retry-analyzer | ✅ fired on the 4th identical failure ("the same error has now appeared 4 times"). ⚠ it did **not** fire on the 3rd identical failure although the description says "3+ identical failures"; the 4th-with-same-error rule is what triggered. Not investigated |
| notify | ✅ a macOS notification was delivered for a background task (that is the behaviour removed in 0.2.1: its text was `✔ Background task finished: bg0nyo0mu toolu_… /private/tmp/claude-501/-Use…`, unreadable ids and a path). Screenshot not saved to `evidence/` |
| plan-progress | ✅ bar created and closed with `done` |
| playwright, pdf-viewer | ✅ example.com opened; 41 PDFs listed in the working folder |
| handoff 0.2.1 | ✅ band with grey `Контекст 0%` and the button seen live (after the update; colours at 50% / 80% still to see) |
| hud | ✅ seen in the same band: `5 год 90%` in red (its own 85% threshold), `7 дн 21%`, `сесія $0.00`, `cache —` |
| replay-theater, verification-guard `/evidence`, remote-gate, evidence-saver, quick-actions, next-steps-uk | not run in this check (quick-actions buttons `Compact` `Clear` are visible in the footer); run them by hand (see "4. Verify" and the table "When each mod runs") |

## What is a mod?

A mod is a **Claude Code plugin whose logic is a set of function hooks**. The hook is the mechanism; the mod is the package around it, plus commands and UI.

- **Package.** A folder with `.claude-plugin/plugin.json` (name, version), `hooks/hooks.json` and `hooks/register.ts`. Installed with `claude plugin install`, shareable like any plugin.
- **Hooks.** TypeScript functions `($, e, next)` that subscribe to engine events (`tool.call`, `turn.step`, `prompt.submit`, `command.run`, ...). They sit in a chain: a hook can pass the event on, rewrite it, answer for itself, or block it with `{ deny }`.
- **Beyond hooks.** Slash commands (`/replay`, `/evidence`), dialogs (`$.ui.ask`), persistent storage across sessions (`$.store`), and rewriting the streamed answer of Claude (`turn.step`).

**How it differs from regular hooks in `settings.json`**

| | Classic hooks | Mods |
| --- | --- | --- |
| What it is | a shell command that Claude Code runs | a TypeScript function inside the engine itself |
| Influence | exit code and text | can rewrite input, result and the streamed answer |
| UI and commands | no | yes |
| Packaging | a line in `settings.json` | a versioned plugin |

Both kinds run side by side without conflict.

**Where it runs.** Claude Code only (terminal, desktop app, VS Code extension). The API is early access and may change between releases. Per claude.dev, mods are **on by default from Claude Code 2.1.287**; older builds need the flag `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` (see step 1).

**Design rule that follows from this.** Controls over Claude's behaviour (confirm a risky command, flag unverified claims, stop retry loops) fit hooks very well. Anything that needs a dedicated panel does not work in VS Code: use commands and dialogs instead.

## The pack: one command (CLI, desktop app, VS Code)

The marketplace `qa-mods` is the pack: 13 plugins, installed or updated together with one script. Plugins go to user scope, so the same pack is active in the CLI, the desktop app (Code tab) and the VS Code extension; start a NEW session in each of them afterwards.

```bash
bash "$HOME/Desktop/MODS/install-pack.sh"              # install or update everything
bash "$HOME/Desktop/MODS/install-pack.sh" --dry-run    # only print the commands
```

| Mod | What it does | Where it shows |
| --- | --- | --- |
| sandbox-guard | refuses writes to protected config paths before they run | all (a refusal text) |
| remote-gate | asks before `git push` and `wrangler --remote`: folder, branch, remote, outgoing commits (understands `git -C dir`, `cd dir &&`); fail closed | dialog: all |
| blast-radius | says what a risky command touches: label in the lane, details at the end of the output; HIGH asks. `git push` is left to remote-gate | label: desktop/CLI; dialog: all |
| retry-analyzer | notes a call that keeps failing the same way | model note: all |
| secret-redactor | masks secrets in tool output before the model reads it | all |
| evidence-saver | saves screenshots from tool results into a folder you choose | all |
| replay-theater | `/replay`: steps through the edits of a session | text: all; pane: desktop/CLI |
| verification-guard | warns when "tests pass" / "done" has no matching tool call; `/evidence` | warning after the answer: all |
| handoff | from 80% of the context: button (desktop), hint line (CLI), hint after the answer (VS Code); `/handoff` puts the HANDOFF.md/CONTEXT.md prompt in the box | all |
| notify | a toast, and on macOS a system notification, when a Bash command ran 30 s or longer (a build, tests, an install) or a turn ran 2 minutes or longer; failures say so | toast: desktop/CLI (VS Code: not confirmed); system notification: all on macOS |
| quick-actions | **Compact** and **Clear** buttons in the footer; each asks Confirm / Cancel first, Cancel changes nothing. In VS Code (no footer) the typed `/compact` and `/clear` ask first | buttons: desktop/CLI; typed commands in VS Code |
| hud | limits, session cost and cache countdown above the prompt; `/hud` as text | band: desktop/CLI; `/hud`: all |
| next-steps-uk | three next prompts in Ukrainian | band: desktop/CLI |

### Labels you will see (the mods print some text in Ukrainian or Russian)

The instructions in this file are English; the text the mods draw on screen is not, on purpose (the author reads it in those languages). What it means:

| On screen | Mod | Meaning |
| --- | --- | --- |
| `Контекст 49% · 5г 31% · 7д 28% · $10.36 · кеш 59:30` | hud (0.5.0) | one line: context fill (amber from 50, red from 80), the 5-hour and 7-day windows (percent used; from 80% also `до скидання 1г 12х`), session cost, prompt-cache time left; then the buttons `Зібрати handoff`, `Compact`, `Clear`, `Прогрес`. Before 0.5.0 the labels were `5 год 34% · 2г 52х`, `7 дн 14%`, `сесія $`, `cache` (units: `г` hours, `х` minutes, `д` days) |
| `⏱ Контекст 83%: … введи /handoff …` (Ukrainian) | handoff | the same offer as a hint line (CLI, and after the answer in VS Code) |
| `Remote Gate: git push … Виконати? [Виконати / Скасувати]` | remote-gate | confirmation before a push: **Виконати** = run, **Скасувати** = cancel |
| `✔ Command finished in 45s: npm run build` / `✘ Command failed after 1m 20s` / `✔ Claude finished after 2m 05s` | notify | the toast and system notification (English) |
| `next:` list in Ukrainian | next-steps-uk | the three suggested next prompts |

- **The `session-time-machine ⏱ 4 points · /timemachine` text at the bottom of the footer** is not ours: it is the status line of the third-party Time Machine plugin (it sets it after every turn: how many points it has recorded and the command to use). To hide it, disable that plugin: `claude plugin disable session-time-machine@skills-dir` (enable again with `claude plugin enable session-time-machine@skills-dir`); `/timemachine` then no longer exists either.
- **Not in the pack (third-party code, install yourself after reading it):** `plan-progress`, `session-time-machine`. The community `next-steps` is replaced by our fork; the script uninstalls the original if it is there.
- **Update:** run the script again. It refreshes the marketplace and updates every plugin; the first run of each plugin after an update needs a NEW session.
- **notify, background commands: switched off in 0.2.1 (06.10.2026).** 0.2.0 announced the end of a `run_in_background` command (a `task-notification` prompt) as `✔ Background task finished: <task id> <tool id> <output path>`. Live check showed the text is unreadable (ids and a `/private/tmp/...` path) and the user asked to turn it off, so the `prompt.submit` hook was removed and its test now asserts silence. Foreground commands of 30 s or more and turns of 2 minutes or more are still announced. To bring it back, restore that hook from 0.2.0 in `notify/hooks/register.ts`. To test the foreground path use a command that is not a bare `sleep`, e.g. `python3 -c "import time; time.sleep(40)"` (a bare `sleep` is moved to the background by Claude).
- **notify limits:** a command that waited for an approval dialog counts the wait as running time; whether the toast itself is drawn in VS Code is not confirmed (the macOS system notification does not depend on it). Not yet seen live: the toast and the system notification themselves.
- **quick-actions limits:** the buttons are a footer element, and the footer is drawn on the desktop app and the terminal only. Confirmed live in the desktop app (06.10.2026): the buttons sit in the footer to the right of `Auto`, between the status text of other mods and `Progress` (grey chips `Compact` `Clear`). The confirm / cancel pop-up itself was not seen yet. The buttons call the same `/compact` and `/clear` the person would type.
- **Why 13 plugins and not one.** A plugin has exactly one hooks module, and inside it the same event (`session.start`, `tool.call`, `ui.render`…) may be registered once without a matcher; `$` cannot be passed into helper functions. Merging the mods into one plugin therefore means rewriting each event by hand. We tried it (the validator refused it), so the pack is a marketplace plus an installer.
- **Options:** `notify`: `longCommandSeconds` (30), `longTurnSeconds` (120), `systemNotification` (on). `quick-actions`: no options since 0.2.0 (the typed command is asked about in VS Code only).
- **Handoff 0.2.0/0.2.1 (06.10.2026, requested by the user):** the `Контекст N%` line and the button are always in the band (dim below 50%, amber from `warnPercent` 50, red from `handoffAtPercent` 80). Before 0.2.0 they appeared only from 80%. Plugin tests updated. Seen live in a new desktop session (screenshot `evidence/handoff-0.2.1-context-always-visible-0pct-new-session-2026-10-06.png`): grey `Контекст 0%`, the `Зібрати handoff` button and the `hud` line in one band. 0% is expected until the first reply (the engine reports context only after one). Amber (50%) and red (80%) not yet seen live.
- **Handoff 0.3.0 prototype: mini Clippy (06-07.10.2026).** Own drawing in `handoff/hooks/clippy.ts`, not the third-party `sidekick`. Beside the band above the prompt: desktop draws an `Svg` (46×58), the terminal a one-line face (`(•‿•)`, `(•_•)`, `(°□°)`), VS Code draws no band. Mood: calm below `warnPercent` (50), worried from it (line "Контекст уже заповнюється…"), panic from `handoffAtPercent` (80, line "Місце закінчується…"). (The `showClippy` option was removed in 0.5.0: the Clippy is always drawn; `remarkEverySeconds: 0` only silences the phrases.) Tests: 6 pass, validate passes; **not yet seen live**: whether the desktop draws the `Svg` inside `AbovePrompt` and at what height. Why it sits there: the engine gives mods no slot between the chat list and the transcript; a `Pane` is placed by the surface (right panel on desktop, per the Time machine screenshot), `AbovePrompt` is the only band that stays beside the prompt.
- **Handoff 0.4.0: random remarks of the Clippy (07.10.2026, requested by the user).** About every `remarkEverySeconds` (default 120, random x0.5..1.5, so 1 to 3 minutes) the Clippy says one short phrase for 9 seconds in the band, then goes quiet; the phrase comes from the pool of the current mood (calm: QA reminders such as screenshot evidence, severity by the spec, boundary values; worried and panic: handoff hints) and never repeats the previous one. A context line from the worried/panic mood is shown while no random remark is active. The pools are in `handoff/hooks/phrases.ts`: edit them freely (3+ phrases per mood, up to 80 characters; `node --test handoff/tests/phrases.test.mjs` checks it). Desktop and terminal only (no band in VS Code). `remarkEverySeconds: 0` turns the remarks off. It needs no model call, so it costs no usage. The mod now keeps one piece of state (`handoff.remark`), declared in `handoff/types/index.d.ts`: the validator refused it first, and refused the types file again while it had a lone `export {}` (it needs an `export type …` line before `declare module`, like `hud`). Tests: 7 pass; not yet seen live.
- **Handoff 0.4.1: the remarks did not appear live (07.10.2026).** Live check of 0.4.0 in a new desktop session: no remark in several minutes although the tests passed. Not confirmed cause; two suspects: the timer was started in `session.start` and only when that event carried `surface` `desktop` or `terminal` (the event may not reach a mod in a resumed session, or may carry another surface value). 0.4.1 starts the timer from the first `session.measure` instead (it fires after every reply, and `hud` relies on it) and skips only VS Code. The plugin test never exercised the live event order, so it passed anyway. **Not yet re-checked live.** To check quickly: `/plugin configure handoff@qa-mods`, `remarkEverySeconds` = 20, a new session, send one message; a phrase should show within about 10 to 30 seconds.
- **Handoff 0.4.1 confirmed live (07.10.2026).** In a fresh session with 0.4.1 and `remarkEverySeconds` 20 the Clippy said a phrase (the user saw it; screenshots `evidence/handoff-0.4.1-clippy-remark-live-*-2026-10-07.png`: "Емулятор viewport не замінює справжній пристрій.", "Баг не вовк, у прод не втече."). The earlier "no remarks" came from tests run in sessions opened before the update and before the option was set: a mod is loaded when the session starts, so a running chat keeps the old version and old options. Diagnostics tried for 0.4.2 (writes to the plugin store) were not needed and were removed; the version stays 0.4.1.
- **Handoff option:** `handoffAtPercent` (default 80; now the VS Code hint and the red point depend on it). To test, set it low: in a session run `/plugin configure handoff@qa-mods` and enter `5`; with it the button (desktop), the hint line (CLI) or the hint after the answer (VS Code) appears at the first answer. **To go back:** run `/plugin configure handoff@qa-mods` again and enter `80` (or clear the field if the dialog offers the default), then start a new session. Left at a low value the hint shows on every answer.
  - Status (06.10.2026): the live check of the button and the hints was done by the user. The result was not sent back, so what the desktop and VS Code showed is **not recorded here**; the plugin tests (desktop button, CLI hint, VS Code hint on the final answer, once per 5 points) pass.
- **Remote Gate:** nothing to configure.
- **Settings that survive the move:** the screenshot folder of evidence-saver (`/evidence-dir`) belongs to that plugin and is kept.
- **From the third-party report that Remote Gate and Handoff came from** (another session, 06.10.2026): their Evidence Saver was not taken (ours exists and asks for the folder), and the context/limits band was not taken (it is in `hud`). Their remote-gate was fixed before taking it: it described the session's own repository even for `git -C public push`, and reacted to `echo "git push"`.

## 1. Enable the feature flag (required on builds before 2.1.287)

Check your build first: `claude --version` (CLI) and the extension version in VS Code. claude.dev states that **from 2.1.287 mods are on by default** and no flag is needed; on older builds the plugins install but nothing loads without the flag. On the machine this guide was written on, the CLI is 2.1.281 and the VS Code extension 2.1.286 (both older, flag required). The desktop app's version was not checked. On a newer build the flag is harmless, so setting it is always safe.

```bash
python3 - <<'E'
import json,os
p=os.path.expanduser("~/.claude/settings.json")
d=json.load(open(p)) if os.path.exists(p) else {}
d.setdefault("env",{})["CLAUDE_CODE_ENABLE_FUNCTION_HOOKS"]="1"
json.dump(d,open(p,"w"),indent=2,ensure_ascii=False)
print("ok", d["env"])
E
```

## Update Claude Code to 2.1.287 or newer (CLI, VS Code, desktop)

Mods are on by default from 2.1.287; older builds need the flag from step 1. Each surface updates separately, so check all three. Run the commands in your own Terminal.

**Check the version first**

| Surface | How to see the version |
|---|---|
| CLI | `claude --version` |
| VS Code | Extensions (`Cmd+Shift+X`) → Claude Code → the version next to the name |
| Desktop app | Menu *Claude* → *About Claude* |

The VS Code extension and the desktop app do not share a version with the CLI. Compare each one on its own.

**Update**

- **CLI.** `claude update`. If that is not available, use your install method:
  ```bash
  brew upgrade claude-code            # Homebrew
  npm i -g @anthropic-ai/claude-code@latest   # npm
  ```
- **VS Code.** Extensions → Claude Code → *Update* (the extension usually updates itself). Then `Cmd+Shift+P` → *Developer: Reload Window*.
- **Desktop app.** Menu *Claude* → *Check for Updates*, or quit and reopen the app: it updates on restart.

**After updating**

1. Start a NEW session on every surface (a running session keeps the old build).
2. Check the version again. It must read 2.1.287 or higher.
3. Run `claude plugin list` and confirm all mods show as enabled, then type `/` in the chat and confirm `/replay`, `/evidence`, `/evidence-dir` appear.
4. Keep `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` in the settings file until every surface is on 2.1.287+. It is harmless afterwards.

Not confirmed by us: that 2.1.287 is already published for your channel (the number comes from claude.dev), and the exact menu names in your desktop build. If the update says "up to date" below 2.1.287, keep the flag and treat it as the workaround.

## 2. Install the plugins

Run in your own terminal. (A sandboxed Claude session cannot write to `~/.claude`, so it cannot do this step for you.)

```bash
claude plugin marketplace add "/path/to/mods"   # registers the personal marketplace `qa-mods`
for m in blast-radius replay-theater secret-redactor evidence-saver sandbox-guard verification-guard retry-analyzer; do
  claude plugin install $m@qa-mods
done
```

Quote the path. If your folder name has spaces or non-ASCII characters, copy `mods/` to a plain path first (e.g. `~/claude-mods`).

## 3. Start a NEW session

Mods load at session start. Open a new chat in the desktop Code tab / a new Claude Code conversation in VS Code (or run "Developer: Reload Window"). Old chats do not pick them up. claude.dev also documents an in-session `/reload-plugins` command (and `/plugin marketplace add`, `/plugin install` as slash commands); that was **not tested here**, so if in doubt start a new session.

## 4. Verify (type in the Claude chat box, **not** the VS Code terminal panel)

1. **Blast Radius**: `Create tmp/blast-test/a.txt, then run via Bash: rm -rf tmp/blast-test/*` → a "Plugin" dialog shows `⚠ Blast Radius [HIGH]` with the matched paths and Run it / Cancel.
2. **Replay Theater**: ask Claude to edit any file, then send `/replay` → diff printed in the reply.
3. **Sandbox Guard**: `Create ~/.claude/skills/zz-test.txt` → denied with a message starting `sandbox-guard:`.
4. **Secret Redactor**: `Run via Bash: echo "DB_PASSWORD=hunter2hunter2"` → output shows `[REDACTED]` and Claude says a value was masked.
5. **Verification Guard**: `Say only: all tests pass now. Do not run anything.` → the answer ends with `⚠ verification-guard: UNVERIFIED (0/1)`. Then `/evidence` lists the claim. Counter-check: ask Claude to edit a file, run the tests, then say they pass → no warning.
6. **Retry Analyzer**: `Run via Bash: ls /no/such/dir/zz — run exactly this command 4 times in a row, no other changes` → after the 3rd failure Claude says it will change approach.
7. **Evidence Saver**: ask Claude to take a screenshot with a browser tool → a dialog asks for the folder; type an absolute path under "Other". Check `/evidence-dir`.

## CLI, VS Code and the desktop app

One engine, three front ends. The plugins, the feature flag and the settings live in `~/.claude`, so **one install covers all three**. What differs is how you start a session and what can be drawn.

| | CLI (terminal) | VS Code extension | Claude desktop app (Code tab) |
| --- | --- | --- | --- |
| Install | same commands, once | same install | same install |
| Feature flag | `env` in `~/.claude/settings.json`, or `export CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` for one shell | the `settings.json` entry | the `settings.json` entry |
| Pick up changes | start a new `claude` | new conversation, or "Developer: Reload Window" | new session in the Code tab |
| Try one mod without installing | `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude --plugin-dir /path/to/mods/<name>` | not available (use the install) | not available (use the install) |
| Dialogs, denials, command text | ✅ expected | ✅ (Blast Radius dialog confirmed) | 🧪 expected, not yet seen |
| Panes (Replay Theater) | ✅ expected (terminal surface) | ❌ not drawn, text fallback | 🧪 expected (desktop surface) |
| Toasts / `ui.log` | ❓ | ❓ (not seen) | ❓ |
| Where a mod's note shows | in the transcript | in the chat | in the chat |

Notes:

- **Each front end ships its own build** of the engine (check with `claude --version` for the CLI; the extension and the app bundle theirs). Mods need a build that has function hooks; if `/replay` does not appear after a restart, the build or the flag is the first suspect.
- **Validate/test are CLI-only tools**: `claude plugin validate <mod>` and `claude plugin test <mod>` run from a terminal, and the tests mount panes on `terminal`, `desktop` and `vscode` surfaces, so one test run covers all three drawings (not pixels).
- **Running sessions do not reload plugins on their own.** Start a new one after installing or updating (or try the documented `/reload-plugins`, untested here).

### Sharing the marketplace

`qa-mods` is registered in your `~/.claude/plugins/known_marketplaces.json` as a **directory** source pointing at this folder. If the folder moves or is deleted, installing and updating from it stops (already installed plugins keep running from `~/.claude/plugins/cache`). To let others use it: (1) push the folder to a git repo and have them run `claude plugin marketplace add <owner>/<repo>`; (2) or send the folder and have them add it by their own path as in step 2.

### Personal vs project setup

Verified on 2026-10-02 in a throwaway git repo with an isolated `CLAUDE_CONFIG_DIR`, so no real settings were touched.

| Scope | Written to | Applies to | Committed? |
| --- | --- | --- | --- |
| `user` (what `plugin install` does) | `~/.claude` | you, in every project | no |
| `local` | `<repo>/.claude/settings.local.json` | you, in this repo only | no (make sure it is git-ignored) |
| `project` | `<repo>/.claude/settings.json` | everyone who opens the repo | yes |

`claude plugin install` always installs into the user cache and enables the plugin at **user** scope. Project/local scope is then a matter of *where it is enabled*.

**Personal, everywhere (user).** Steps 1-2 above. Nothing more.

**Personal, one repo only (local).**

```bash
claude plugin install blast-radius@qa-mods                 # lands at user scope
claude plugin disable blast-radius@qa-mods --scope user    # not for every repo
cd /path/to/repo
claude plugin enable  blast-radius@qa-mods --scope local   # writes .claude/settings.local.json
```

Result in `.claude/settings.local.json`: `{ "enabledPlugins": { "blast-radius@qa-mods": true } }`.

**Team, committed to the repo (project).**

```bash
cd /path/to/repo
claude plugin marketplace add <source> --scope project     # declares the marketplace in .claude/settings.json
claude plugin install blast-radius@qa-mods                 # lands at user scope
claude plugin disable blast-radius@qa-mods --scope user    # required: if it stays enabled at user scope, "enable --scope project" refuses ("already enabled") and writes nothing
claude plugin enable  blast-radius@qa-mods --scope project # writes enabledPlugins into .claude/settings.json
```

Then add the feature flag to the same file by hand and commit it:

```json
{
  "env": { "CLAUDE_CODE_ENABLE_FUNCTION_HOOKS": "1" },
  "extraKnownMarketplaces": { "qa-mods": { "source": { "source": "...", "...": "..." } } },
  "enabledPlugins": { "blast-radius@qa-mods": true, "verification-guard@qa-mods": true }
}
```

Pitfalls found while testing:

- **A local-path marketplace is not portable.** `marketplace add ./mods --scope project` stored an **absolute path** (`"source": "directory", "path": "/Users/you/.../mods"`). Committed, it points nowhere on a teammate's machine. For a team, host the mods in a git repo and add it by its GitHub name or git URL instead (`claude plugin marketplace add <owner>/<repo> --scope project`). That form was not run here (needs network).
- **Disabling at user scope has a side effect:** your user settings now say `false` for that plugin, so it works only in repos that enable it.
- **The CLI did not touch `.gitignore`.** Ignore `.claude/settings.local.json` yourself.
- **Not verified:** that `env` in the project `settings.json` activates the feature flag for teammates, and what teammates see on first open (expect a trust/install prompt). Check with one teammate before relying on it.
- **Agents cannot write a project's `.claude/settings.json` from a sandboxed session** in this setup; run these commands in Terminal.

Suggested split: team-wide behaviour (`blast-radius`, `verification-guard`, `retry-analyzer`) in `project`; personal setup (`sandbox-guard` with your paths, `evidence-saver` with your folder, `secret-redactor`) at `user` or `local`.

### Priorities and overlap (user mod + repo mod)

Tested on 2026-10-02 with `claude plugin list --json` in a throwaway repo (isolated config).

**1. Same plugin, different values: the closest scope wins.** `enabledPlugins` is resolved per plugin, **local > project > user**:

| user | project | local | effective |
| --- | --- | --- | --- |
| true | – | – | **on** |
| true | false | – | **off** (project beats user) |
| false | true | – | **on** (the CLI notes: "Disabled in ~/.claude/settings.json but still loads — project … settings enable it, which overrides your user setting") |
| true | true | false | **off** (local beats project) |
| false | false | true | **on** (local beats both) |

So a repo can switch a mod on **or off** for everyone, and you can override the repo for yourself in `settings.local.json`. A managed/organization setting sits above all of these (documented Claude Code behaviour; not tested here), and the built-in `sec-default` mod keeps managed policy out of reach of installed plugins.

**2. Same plugin id = loaded once.** `blast-radius@qa-mods` installed at user scope and enabled in the repo is **one** plugin, not two. Nothing doubles.

**3. Same mod under two marketplace names = two plugins.** The id is `<plugin>@<marketplace>`. If the repo declares the marketplace as `qa-mods-team` while you have `qa-mods`, `list` shows both **enabled**, so the hooks would run twice (two Blast Radius dialogs, two `⚠ verification-guard` lines). Runtime duplication was not observed, only the double registration. Keep one marketplace name per mod and disable the duplicate.

**4. Different mods together: all run, as a chain.** Hooks of every enabled mod sit in one chain in load order; a hook that answers without calling `next` (a `{ deny }`, e.g. `sandbox-guard`) ends the chain for that event, so mods after it never see the call.

**5. Mod-level settings have their own priority.** Some mods have `userConfig` (see the Inventory table: `hud`, `notify`, `handoff`, `quick-actions`, `blast-radius`, `next-steps-uk`; change with `/plugin configure <name>@qa-mods`); the others are controlled by env/store values read by the code. `evidence-saver`: the folder comes from `/evidence-dir` only (the `QA_EVIDENCE_DIR` override was removed in 0.3.0). The feature flag `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` is a plain `env` entry: set it at user scope and (for teammates) in the project `settings.json`; `env` from several settings files is merged (not tested for this flag).

## Built-in and community mods (what else exists)

claude.dev lists the following. `next-steps` and `plan-progress` are installed on this machine (see the subsection below); the other community entries were not installed or tested here.

| Mod | Source | What it does |
| --- | --- | --- |
| Token weather | built in (newer builds) | one-line forecast of how full the context window is, drawn above the prompt |
| Blast radius | built in (newer builds) | holds a risky shell command and shows what it would change, with Proceed / Cancel |
| Replay theater | built in (newer builds) | records the edits Claude makes in a turn and steps through them one diff at a time |
| `/diff`, AGENTS.md, `sec-default` | built in | `/diff` pane, AGENTS.md loading, org policy protection (`sec-default`: Team/Enterprise plans) |
| Next steps | community: `claude plugin install next-steps@claude-community` | suggests up to three next prompts when a turn ends; press 1/2/3 to draft one, 0 to dismiss |

- The `claude-community` marketplace is now configured here (`anthropics/claude-plugins-community`), next to `claude-plugins-official`, `sdd`, `qa-mods` and `zycck-mods`. We could not open its GitHub page from the sandbox; what we know comes from the installed plugin files.
- **Overlap warning.** Newer builds ship their own *Blast radius* and *Replay theater*. Our `blast-radius` and `replay-theater` do the same jobs, so on such a build you could get **two dialogs** or a clashing `/replay`. Check what is enabled (`claude plugin list`, or `/plugin` in a session) and disable one of each pair. Our mods tolerate a refused `/replay`/`/evidence` registration (the name simply stays with the other provider). The overlap itself was not observed: neither local build (2.1.281, 2.1.286) has the built-ins.
- **Share a mod publicly.** The official directory takes plugin submissions at claude.ai/directory/manage.

### Installed here: next-steps and plan-progress

> **Superseded (07.10.2026):** `plan-progress` is now our fork `plan-progress@qa-mods` (see "From scratch" and the Decisions log); the `zycck-mods` install below is the original and must not stay next to it. `next-steps` is replaced by `next-steps-uk` as before.

Both are **third-party** code. Install them once at user scope: the same plugin then loads in the CLI, the desktop app and VS Code. Run in your own Terminal, then start a NEW session on each surface.

```bash
# next-steps (community: anthropics/claude-plugins-community)
claude plugin marketplace add anthropics/claude-plugins-community
claude plugin install next-steps@claude-community

# plan-progress (personal marketplace of an individual author: github.com/zycck)
claude plugin marketplace add zycck/claude-mods
```

Check with `claude plugin list`. The `/plugin ...` forms do the same inside a session.

| | next-steps 1.0.0 | plan-progress 0.3.0 |
| --- | --- | --- |
| What it does | After a turn, suggests up to three next prompts above the input; 1/2/3 puts one into the box as an editable draft, 0 dismisses. It never submits on its own. | Live progress bars above the prompt (stages, steps, agents) with soft sounds for decision / error / done. Adds a `plan_progress` tool and `/progress`, `/progress-demo`, `/progress-sounds`, `/progress-clear`. |
| Author | Thariq Shihipar (per `plugin.json`) | Kirill Serditov, github.com/zycck (per `plugin.json`) |
| Terminal | drawn (author's README) | not checked by us |
| Desktop app | ✅ shown (next-steps-uk, 02.10.2026) | ✅ loaded in a desktop session: the `plan_progress` tool and skill appeared, and the mod refused a tool call until a bar was created; the bar shows only while a plan is open |
| VS Code | ❌ not shown (next-steps-uk uk.1 and uk.2, 02.10.2026). Cause in the engine types: the band above the prompt (`AbovePrompt`) is "Raised on the terminal and desktop surfaces only". uk.3 draws under the last reply instead: ❓ not checked live yet | ⚠ the mod loads (`/progress-demo` replies), the bar was not seen on screenshots. Same cause: the bar is drawn in `AbovePrompt` |
| Workaround in VS Code | run `claude` in VS Code's integrated terminal (Terminal → New Terminal): that is the terminal surface, where the band above the prompt exists. Not checked live by us | same |

**What you saw (fill in after your own check):**

- Desktop, next-steps: ✅ shown (02.10.2026, next-steps-uk 1.0.0-uk.1). Not shown at first, then appeared in the same desktop session, so the author's "Other surfaces show nothing" does not hold for the desktop app
- VS Code, next-steps:
  - uk.1: ❌ not shown (02.10.2026). Two answers well over `minAnswerChars` (88 and ~900 characters), nothing above the prompt after waiting: `evidence/vscode-next-steps-none-02-10.png`. Cause: VS Code does not raise `AbovePrompt` (engine types, see the table).
  - uk.2 (buttons under the last reply block): ❌ still nothing in a new VS Code session: `evidence/vscode-next-steps-uk2-none-02-10.png`. `claude plugin test` on the `vscode` surface draws the buttons, so the mod's code works in the engine; the live difference was not found.
  - uk.3 (block matched by its last letters, not exact text): ❓ not checked live. If nothing shows, not even the dim `next steps…` line, VS Code does not draw a plugin's rewrite of a reply, and the VS Code path should be removed.
- Desktop, plan-progress: the bar is drawn only while a plan is open (`register.tsx:778`: no plans or the bar is collapsed → nothing above the prompt). With no open plan the empty space is expected, not a fault. The dim **Progress** button beside the session mode is always drawn (`:757`); with an open plan it collapses and expands the bar. `/progress-demo` opens a sample plan. Sounds: _not recorded_
- VS Code, plan-progress: ⚠ partly (02.10.2026, 0.3.0). The mod is loaded: `/progress-demo` replies "Sample plan shown above the prompt". The user reported that the demo works there, but neither screenshot shows the bar or the **Progress** button by the session mode (`evidence/vscode-progress-demo-next-steps-02-10.png`). Expected from the engine types: the bar is drawn in `AbovePrompt` and the button in `SessionMode`, both "terminal and desktop only". Only a fork could move them; none made
- Desktop, 06.10.2026 (blast-radius 0.2.0, hud 0.2.1, next-steps-uk 1.0.0-uk.3, plan-progress 0.7.6): ✅ screenshots `evidence/desktop-high-dialog-hud-cache-in-band-2026-10-06.png`, `evidence/desktop-next-uk-menu-progress-done-2026-10-06.webp`.
  - next-steps-uk: the `next:` menu with three Ukrainian suggestions is drawn under the progress bar after a turn.
  - plan-progress: amber with `?` while a bar is `needs_input`, green with the elapsed time once it is `done`; two bars are separated by a hairline; the footer shows only the **Progress** button.
  - hud: one line above the bars, `5 год 51% · 4г 01х  7 дн 7% · 6д 19г  сесія $23.19  cache 59:29`; the countdown ticks between screenshots (59:29 → 59:45). Reading the labels: `год` = hours (the 5-hour window), `дн` = days (the 7-day window), `сесія` = session cost.
  - blast-radius: the transcript line is short (`⚠ Blast Radius [HIGH]: deletes files permanently. · details: /blast`); the HIGH dialog has Run it / Cancel / Other; **Cancel** returns "cancelled by the user" and the command does not run. MEDIUM, `evidence/desktop-blast-medium-short-lines-heredoc-clean-2026-10-06.webp`: `cp` gives `⚠ Blast Radius [MEDIUM]: cp can overwrite existing files. · details: /blast`, a redirect gives `… redirect truncates $S/c.txt. · details: /blast` (the shell variable is shown unexpanded), and the heredoc with `=>` and `>` inside produced no warning line. The `sed -i` line was scrolled out of the frame.
  - Not seen yet: `/blast` and `/hud` output, the dimmed `~NN%` limits at the start of a session, VS Code with hud and blast-radius.

**Behaviour to know about**

- `plan-progress` is **intrusive by design**. In a running session it denies tool calls ("several changes ahead. Create a bar with plan_progress first") and blocks the end of a turn while a bar is still open ("still open. Update each with plan_progress..."). If Claude seems stuck, that is the mod: close the bars (`/progress-clear`) or disable the plugin.
- **`plan-progress` asks for permission at every start.** Its `plan_progress` tool is an MCP tool, and a tool that no rule allows is asked about again each session. Cause found: `permissions.allow` in the user `settings.json` held no `mcp__…` rule. Fix: add `mcp__plan-progress__plan_progress` to `permissions.allow` (the sandbox cannot write that file; the Terminal command was given in chat). Not yet confirmed that the prompt then disappears.
- `next-steps` forks the session with `$.model.fork` after each turn to ask for suggestions. That costs extra model usage and sends the session (and, with `suggestSkills` on, the list of your skills and slash commands) into that fork. Options: `minAnswerChars` (default 80), `suggestSkills` (default true).
- Both overlap in spirit with our Verification Guard (it also acts at the end of a turn). No clash was observed; it was not tested for.

**Ukrainian suggestions: `next-steps-uk` (our fork)**

`next-steps` has no language option: it writes suggestions in the language of the conversation. `next-steps-uk` (folder `next-steps-uk/`, marketplace `qa-mods`) is a copy with one added paragraph in `forkPrompt()` that forces Ukrainian labels and prompts (slash-command names, paths and code stay as they are). Install it INSTEAD of the original, never alongside it:

```bash
claude plugin uninstall next-steps@claude-community
claude plugin marketplace update qa-mods && claude plugin install next-steps-uk@qa-mods
```

To take a newer version of the fork (version in `next-steps-uk/.claude-plugin/plugin.json`, now `1.0.0-uk.3`), then start a NEW session:

```bash
claude plugin marketplace update qa-mods && claude plugin update next-steps-uk@qa-mods
```

| Version | Change |
| --- | --- |
| 1.0.0-uk.1 | Ukrainian labels and prompts (a LANGUAGE paragraph in `forkPrompt()`) |
| 1.0.0-uk.2 | VS Code: suggestions as buttons under the last reply block (`ui.render` on `AssistantMessage`, raised on every surface); a press fills the prompt box, or copies the prompt to the clipboard with a toast where the box refuses |
| 1.0.0-uk.3 | the reply block is found by its last 24 letters and digits, since the drawn markdown can differ from the raw answer |

- Do not edit the original in the plugin cache: the next update overwrites it. A fork survives, but you must merge upstream changes by hand (`NOTICE.md` lists every change).
- `claude plugin validate` passes. `claude plugin test next-steps-uk` runs `tests/vscode.test.tsx`: 3 tests pass (buttons on `vscode`, a block drawn with a link, no buttons under replies on `terminal`). The kit checks the mod's tree, not VS Code's paint.
- Whether the model always obeys the language rule was not checked in a live session.
- In VS Code the fork still asks the model for suggestions after every long answer, whether or not anything is shown. With a tight usage limit, disable it there until uk.3 is confirmed.

**Warning: other people's code**

- A mod runs inside Claude Code with Claude Code's access, and nothing here sandboxes it. A marketplace belonging to one person can change what you installed with the next update.
- Our read of the installed files is a **static skim, not an audit**. `next-steps`: `hooks/register.tsx`, 230 lines, uses `$.model.fork`, `$.prompt.*`, `$.command.list`, `$.ui.*`, no `$.process`, `$.fs` or network calls. `plan-progress`: `hooks/register.tsx`, 905 lines, uses `$.tool.register`, `$.ui.*`, `$.clock.*`, `$.audio.play`, and `$.process.run` only as a PowerShell sound fallback (`-ExecutionPolicy Bypass`, Windows). It also hooks `agent.spawn` and denies/blocks tool calls as described above. Nothing else was checked (bundled `.wav` files, later versions).
- Before installing any third-party mod: read its `plugin.json` and `hooks/*.ts[x]`, look for `$.process`, `$.fs`, `$.env`, and any URL; pin it with `claude plugin list --json`; re-read after every update. Prefer a marketplace under an organisation you trust. Remove with `claude plugin uninstall <name>@<marketplace>`.

### hud (our mod, 0.6.7): context, limits, cache chip, five buttons

- **Desktop / terminal:** one band above the prompt, one row in a normal window: `Контекст N%` (amber from 50%, red from 80%), the 5-hour (`5г`) and 7-day (`7д`) windows (percent used; amber from `warnPercent` 80, bold bright red from `redPercent` 85; a toast once at each threshold), the chip `кеш 59:48`, then the buttons `Handoff`, `Compact`, `Clear`, `Прогрес` and the `⏱` / `%` button (it switches the limits between percent used and time left to reset). **No `$` in the band** since 0.6.4: `/hud` prints the session cost and the cache figures as text.
- **The `кеш` chip (0.6.6, m:ss since 0.6.7).** Time left of the prompt cache, `кеш 59:48` (minutes:seconds, redrawn every second). It is drawn only while the countdown runs: empty before the first reply and gone once it has expired. Each model reply restarts it, so during a turn it stays near 60:00. The cache is an **estimate**: last reply plus `cacheTtlMinutes` (default 60); there is no hour form (`1:00:00`) in the band.
- **Seen live:** 0.6.7 in a wide window: one row, seconds ticking (`кеш 59:50` → `59:54`). 0.6.4 in a narrow window: two rows (`Контекст · 5г · 7д · ⏱`, then the buttons), `Прогрес` stays with the others, no third row. **Not seen:** 0.6.7 in a narrow window (the band is one character longer than in 0.6.4, so it may reach a third row), and the chip disappearing at the end of the countdown (needs an hour without requests).
- **Buttons.** `Handoff` fills the prompt box itself (empty box: replaced; a draft: the prompt is appended after it; where the box cannot be filled it copies the text and toasts), so no `/handoff` bubble stays in the chat. `Compact` and `Clear` ask for confirmation in Ukrainian first.
- **VS Code:** the band is not drawn there. `/hud` prints the figures as text (not verified by us yet).
- **Data:** limits come from `$.session.usage()` (limits only on a subscription, only after the first reply). Daily and monthly cost are not available, only the session total (in `/hud`).
- **Idle chat does not refresh the figures.** The engine reports rate limits only together with an API response, so while nobody writes the limits and the context stay at the last reply (the cache chip does tick). A window whose reset time has passed is drawn dim as `5г скинуто` (and `/hud` says `скинуто (було 91%, …)`) instead of the old percent; the new value arrives with the next reply. Not done on purpose: refreshing in the background while idle (it would cost a request every N minutes).
- **Why the countdown is in the band, not in the footer.** In 0.1.0 it sat in the footer next to the `Progress` button of `plan-progress` and always landed to the right of it. Two mods that hook the same footer slot are stacked in an order the mods cannot choose; a mod's own band is under its own control, so the countdown moved there in 0.2.0.
- **Stacking:** the band wraps whatever other mods draw (`progress`, `next-steps-uk`) instead of replacing it. Confirmed live: the hud row sits above the progress bar and the `next:` chips.
- Options (`/plugin configure hud@qa-mods`): `cacheTtlMinutes`, `warnPercent` (80), `redPercent` (85). Both windows use the same thresholds; `/hud` marks them `⚠` and `‼`.
- Tests: `claude plugin test hud` 11/11, `node --test hud/tests` 10/10.
- Update: `claude plugin marketplace update qa-mods && claude plugin update hud@qa-mods` (or uninstall/install `hud@qa-mods`), then a **new** chat (`/reload-plugins` does not reload function hooks).

### Time Machine (third-party, tested 06.10.2026)

A community mod: `/timemachine` records a session as a timeline and forks from any point into a separate git worktree and a new session. Not ours; we only tested it.

- **Install:** `npx claude-code-templates@latest --mod productivity/session-time-machine`, then `/reload-plugins`. It landed in `~/.claude/skills/session-time-machine` as `session-time-machine@skills-dir`, user scope, so it is the same plugin in the CLI, the desktop app and VS Code. `npx` downloads and runs someone else's code: read it first. Our skim of the installed files (not an audit): no network calls, no URLs; it runs `git worktree add` / `git worktree remove --force` (its own new worktree only), reads the session transcript and writes a cut copy of it as a new session.
- **VS Code, confirmed:** `/timemachine` answers with text only (`Time machine: N points. Press one to arm a fork…`: the panel with the buttons is not drawn). **`/timemachine list`** prints the points as text (`prompt`, each tool call, `turn end`). **`/timemachine fork <n> <instruction>`** works end to end: a new session opens with the conversation cut at point `n` and the files restored in `.claude/worktrees/time-machine-<id>` on branch `time-machine/<id>`; the original session is untouched. Screenshots in `evidence/` (`vscode-timemachine-*`, `timemachine-fork-*`).
- **Desktop app, confirmed 06.10.2026 (✅):** in a fresh Code session in `tm-test` (two prompts: create `c.txt`, add a line) `/timemachine` opens a **right-hand side panel** "Time machine": counters (6 points, 2 prompts, 2 calls), the point list (`prompt`, `Write`/`Edit`, `turn end`) and the buttons `older`, `newer`, `expand`, `reload`, with the hint "Press any point to fork the session from there with a new instruction." The chat also prints the text line "Time machine: 6 points…", and the footer shows `⏱ 6 points · /timemachine`. `expand` shows the full text of each point. Fork itself was not clicked in the desktop app yet. The screenshots came without files, so they are not in `evidence/`.
- **What this means for our own variant:** the picker we sketched (side panel, list of points, fork) already exists in the desktop app. The reasons left to write our own are the 4 MiB limit (long sessions) and VS Code, which has no panel.
- **Side effects to expect:**
  - the fork opens in a new **Terminal.app** window (`claude --resume <id>`), not inside VS Code; on the first run macOS asks "Visual Studio Code wants to control Terminal" (AppleScript). That prompt comes from the mod; answer it knowingly.
  - the new folder is a new project for Claude Code, so it asks "Is this a project you created or one you trust?" once.
  - Claude warns that paths from earlier in the session point at the original checkout.
- **Mistakes we made while testing:**
  - `/timemachine` as the **first** message of a fresh session fails with `cannot read the transcript … ENOENT`: the session's transcript file does not exist until the first real prompt. Send a normal prompt first.
  - Points start only from the moment the mod is loaded; it records nothing about earlier turns.
  - Test it in a throwaway git repo, not in a working project: a fork creates a worktree and a branch.
- **Experiment: cut a transcript with `head` and resume it (06.10.2026, ✅).** `experiments/cut-resume.sh` takes a real session, cuts it after the last `user`/`assistant` row of the first turn with `head -n N`, swaps the session id with `sed`, and writes a new file next to it. `claude --resume <new id>` opened that copy and it knew only the first prompt (`evidence/resume-cut-transcript-knows-only-first-prompt-2026-10-06.webp`). So a fork does not have to read the transcript into the mod, and the 4 MiB limit of `$.fs.read` does not apply to this method.
  - Facts the experiment showed: a real transcript has about a dozen row types (`ai-title`, `bridge-session`, `queue-operation`, `attachment`, `file-history-snapshot`, `file-history-delta`, `atis-latch`, `last-prompt`, `user`, `assistant`); cut after the last `user`/`assistant` row, not at the line before the next prompt, because a `queue-operation` row written before it carries that prompt's text.
  - In VS Code a prompt row holds a `<ide_opened_file>…` note next to the typed text; a filter that treats it as "not a prompt" finds no prompts.
  - The resumed copy warned "Remote Control not started here · another Claude Code … already has Remote Control for this conversation": the copied `bridge-session` rows bind it to the original. A fork should drop those rows.
  - Not yet tested: a cut of a 20–40 MiB session, a session with `/compact`, a resumed session.
- **Limit that matters for us:** the mod reads the whole transcript through `$.fs.read`, whose limit is 4 MiB (the mod's own error text). Our long QA sessions are 20 to 40 MiB, so a fork of those is expected to fail; small sessions fork fine. This is the one reason to write our own variant (code snapshots without reading the transcript). Not built.
- **Terminal surface:** in the forked session the band shows the `hud` line, the `next:` menu and the **Progress** button, and the footer shows `⏱ 7 points · /timemachine`, so all our bands coexist with it.

## Decisions log (06-07.10.2026)

Why things are the way they are. Each line: the decision, the reason, what was not done. **Standing decision (07.10.2026, the owner): the mods in this folder, including forks, are the main version; they replace the originals.**

| Decision | Reason | Not done / open |
| --- | --- | --- |
| `notify`: no announcement of a finished background task (0.2.1) | the text was ids and a `/private/tmp/...` path, unreadable; the user asked to switch it off | foreground commands (30 s+) and long turns (2 min+) still announce |
| `handoff`: the `Контекст N%` line is always visible (0.2.0), colours 50% amber and 80% red (0.2.1) | before it appeared only from 80%, so the user never saw the context | thresholds are options (`warnPercent`, `handoffAtPercent`); colours not yet seen live |
| `hud`: a window whose reset time has passed shows `скинуто` (0.3.1) | in an idle chat the engine sends no new limits, so a reset window kept its old red percent | no background refresh while idle (it would cost a 1-token request every N minutes) |
| Mini Clippy is built into `handoff` (0.3.0), not into a new mod and not via the third-party `sidekick` | it is one indicator of the same thing (context fill); our own drawing, no process, no network, no model call; `sidekick` calls Haiku after every turn, speaks through Windows PowerShell and has Turkish texts | `sidekick` is not installed. If wanted: `claude plugin marketplace add mertkozcan/sidekick-mods` then `claude plugin install sidekick@sidekick-mods`; read `hooks/` first, it is a pane (right side on desktop, none in VS Code) |
| The Clippy sits beside the band above the prompt, not between the chat list and the transcript | the engine has no slot there: a `Pane` is placed by the surface, `AbovePrompt` is the band beside the prompt | desktop `Svg` inside `AbovePrompt` is not yet seen live; the terminal gets a text face, VS Code nothing |
| `plan-progress` is our fork inside `qa-mods` (0.7.6-qa.10), same plugin name | titles were cut after 7-8 letters on the desktop (the title width estimate was 6.4 px a character, Cyrillic needs ~9.2) and the full title was not reachable; the owner decided that our mods and changes are the main version | upstream updates must be merged by hand (`plan-progress/NOTICE.md` lists the two changes); do not install `plan-progress@zycck-mods` next to it; hover card and the title room **not yet seen live**; the terminal drawing is untouched; since qa.2 the interface is Ukrainian (units `с х г`, button `Прогрес`, agents bar), the text addressed to the model stays English |
| *Superseded by the one-line band below.* Footer order is Progress, Compact, Clear (07.10.2026, requested by the owner): `quick-actions` 0.1.1 draws its two buttons after what the other mods put into the footer; `plan-progress` qa.3 and `quick-actions` set `flexShrink={0}` on their rows | before it was Compact, Clear, Progress, and with `Progress 3` the host replaced the last button by `…` (full text only in a tooltip); drawing order depends on which mod wraps the other, so each mod puts its own part in a fixed place instead of relying on load order | **not yet seen live**: if `…` still appears, the footer slot is too narrow for three buttons; the fallback is to move Compact and Clear into the band above the prompt, where there is room |
| Audit of all mods (07.10.2026, the owner asked for errors and fixes): `validate` and all tests pass for 14 mods; two real bugs found in live use and fixed: `sandbox-guard` 0.1.5 blocked `cp ~/.claude/plugins/... ./x` (a protected path that is only the *source* of cp/mv or a cat argument) and let `2> ~/.claude/projects/e.log` pass; it now judges the write target of cp/mv/ln/rm/mkdir/tee/sed -i and of every redirect. `blast-radius` 0.3.3 split a path with spaces into pieces in "Will touch" (the folder is `СLAUDE files `) and kept the closing `)` of a subshell in a file name | both were seen in this session's own commands; tests added (guard 5, analyze 13) | candidates left alone, see the ponytail list in the answer: the Windows-only PowerShell sound fallback and the sounds in the plan-progress fork, `hud` `refreshAtStart` (benefit never confirmed), old cache versions under `~/.claude/plugins/cache` |
| Ponytail cleanup (07.10.2026, the owner: all but replay-theater and notify): removed `next-steps-uk` VS Code branch and the fork it cost there (uk.5), `hud` Haiku ping at start and its option (0.4.0), the PowerShell sound fallback of the `plan-progress` fork (qa.4; the wavs stay, afplay uses them), `blast-radius` MEDIUM toast and `appendToOutput` (0.4.0), `evidence-saver` `QA_EVIDENCE_DIR` (0.3.0), `quick-actions` `confirmTypedCommands` and the two copied buttons (0.2.0), `handoff` `showClippy` (0.5.0). `retry-analyzer` 0.1.1 leaves the free-text `description` out of a call's signature | every removed knob had one real value in use; the `description` change explains why the 3rd identical failure did not trip in the live test: a different description made each retry a different call | kept on purpose: `replay-theater` pane, the duplicated `osascript` call in `notify` (the engine does not let `$` go into a helper); about -190 lines; all 14 mods validate and pass their tests |
| Blast Radius redesign A+B (07.10.2026, the owner disliked the dialog): a plain `rm` is judged by git (read-only: `git ls-files`, `git status -uno`): outside git = `[LOW]` label only, tracked and clean = `[MEDIUM]` label only, **dialog only** for tracked files with uncommitted changes, the home folder (`~`, `$HOME`, `/Users`, `/`), more than 20 files; sudo, dd, git reset --hard, find -delete, chmod -R and the like always ask. The dialog is one short Ukrainian sentence: `Видалення 3 файлів (незакомічених змін: 1). Команда: rm a b c. Виконати?` with the risky segment only, not the head of a long script; `cd x && rm y` now resolves `y` in `x`. **Other** (typed text) no longer runs the command: it is refused and the typed decision goes back to Claude as «зроби саме так» | before: any `rm` was HIGH with a dialog, the whole command (a heredoc script) was shown from its start, a typed Other answer *ran* the command | skipping the dialog (Skip) cancels; if the dialog cannot be shown at all the command still runs (as before); tests: register 8, decide 5, analyze 14; the real git script was tried in a temp repo (dirty, clean, untracked, dir, glob, spaces); **not yet seen live** |
| Blast Radius 0.5.1 (07.10.2026, found live: `rm blast-test.md` of a new file ran with no dialog): files git does not track (and does not ignore; `*.log`, `node_modules`, `.DS_Store`, `/tmp` excluded) count as work that cannot come back, so a dialog asks: `Видалення 1 файлу (1 файл без git-копії, не відновити)`. A dialog that cannot be shown (the `ask` fails) now **cancels** the command; before it ran it. `hooks.json` description no longer says "never blocks" | before, untracked = `[LOW]`: in `~` (a repo where everything is untracked) git protection was effectively off | still open: an annotation is dropped when the command exits non-zero (`ran.isError`); an analysis exception is swallowed silently; tests: register 10, decide 5, analyze 14; the facts script was run in a real temp repo; **not yet seen live** |
| Blast Radius 0.5.2 (07.10.2026, first live run of the lab): git facts are now taken **per target, in the repo the file lives in** (`git -C <dir>`), not in the repo of the shell's cwd; `git -C dir reset --hard`, `git -c k=v …` and `--git-dir=…` before the subcommand no longer hide the risk | in the run, tracked and modified files in a nested repo (`blast-lab` inside `~`, which is itself a repo) came out `поза git`/LOW: the outer repo sees a nested repo as one untracked folder; the first guess (git blocked by the sandbox) was wrong; `git -C` on the file's own folder gives TRACKED/DIRTY right | that run used the old installed copy (HIGH without a dialog = pre-0.5); tests: analyze 15, decide 5, register 10; the facts script was run on a nested repo; **not yet seen live** |
| Blast Radius 0.5.3 (07.10.2026, from the retest report on 0.5.0): the `git: N file(s) … at stake` count is read in the repo where the command works (`cd dir && git …`, `git -C dir …`), not in the session's folder (it said 59 for a repo with 0); `analyze` returns `gitDirs` | the report ran the 0.5.0 copy from `~/.claude/plugins/cache`, so its findings 2a (`git -C`) and the fail-open dialog were already fixed in 0.5.1-0.5.2 | tests: analyze 16, decide 5, register 10; **not yet seen live** |
| Blast Radius 0.5.4 (07.10.2026, retest report on 0.5.3): no `Will touch: nothing found on disk` line when no path can be read (`sudo`, `dd`, `curl \| sh`); the git count is worded `…in the whole repo (the command may touch only some of them)` (`git checkout -- b.txt` reported the repo's 2 changed files, not the one named) | the retest confirmed on 0.5.3: untracked `rm` = HIGH, tracked and clean = MEDIUM, `git clean`, `find -delete`, `dd`, `curl \| sh`, `git checkout --`, `git restore` = HIGH; whether the dialogs appeared is for the owner to say, the tester (an agent) cannot see them | tests: register 10, analyze 16, decide 5; **not yet seen live** |
| next-steps-uk 1.0.0-uk.9 (07.10.2026), **decision A+C** (the owner chose it; considered: A chips in a row, B card, C one primary + "ще N", D inside the Clippy bubble, E chips in Clippy's empty second line): the suggestions are **one row** of bordered chips `Далі [1 …] [2 …] [3 …] ✕` (was 5 rows: `next:`, `dismiss`, three plain buttons); labels are at most 32 characters; when the three labels together are longer than 72 characters the row shows the first chip and `ще N ▾`, which opens the rest underneath (`менше ▴` closes) | with up to 5 progress bars above the prompt every row counts; the band's Clippy already reserves two lines, so option E fell out: the second line beside Clippy is empty only when no bar is open, and hud and next are separate mods (they would have to be merged); the real order is band, then bars, then next, with Clippy at the left of the whole block | tests: next-steps-uk 4 (chips in one row, `ще 2`); **not yet seen live** |
| next-steps-uk 1.0.0-uk.9 (07.10.2026, live screenshot): the chip labels no longer start with their number and `✕` has no hotkey badge: a button with a `hotkey` already draws its own badge, so the number showed twice (`1 Закрити полоси [1]`, `[0] ✕`); keys 1-3 still choose | `0` no longer dismisses, `✕` is a click only | tests: next-steps-uk 4; **not yet seen live** |
| hud 0.5.1 (07.10.2026): the time to a reset moved from the first row to its own dim line under the band | with it inline, a window over 50% pushed `Clear` and `Прогрес` to a second row | superseded by 0.6.0; tests: hud 9 |
| hud 0.6.0 (07.10.2026), **decision C** (the owner chose it; considered: A text swaps in place on the limit, B second line, C one button for both windows): the limits keep their colour and a small `⏱` button beside them swaps both percents for the time to the reset (`5г 1г 56х · 7д 5д 4г`), `%` swaps back; the state is kept until the session restarts; the second line is gone | after a window resets the percent is not known until the next reply, so it reads `5г скинуто`; the button label (`⏱` / `%`) is a symbol only, to keep the four buttons in the first row | tests: hud 9 (press ⏱, press %); **not yet seen live** |
| hud 0.6.1 (07.10.2026, live screenshot of 0.6.0): the `⏱` / `%` button is drawn with the same border as the other four buttons (it was `plain` and dim, so it read as a decoration, not a button) | the first screenshot of 0.6.0 proved the new code was loaded (the glyph was there): a new chat after reinstall does pick it up | tests: hud 9; **not yet seen live** |
| hud 0.6.3 (07.10.2026, live screenshots of 0.6.1): in the time mode an arrow separates the window from the time (`5г → 2г 13х · 7д → 5д 20г`): `5г 2г 13х` read as two hour figures | confirmed live in 0.6.1: the bordered `⏱` / `%` button works, the five buttons and the chip row of next-steps-uk 1.0.0-uk.9 fit in two rows, no duplicate numbers | tests: hud 9 |
| hud 0.6.4–0.6.7 (08–09.10.2026): **0.6.4** `$` and `кеш` leave the band (it wrapped to three rows in a narrow window; `/hud` still shows them); **0.6.5** the `Handoff` button fills the prompt box itself (`$.prompt.read` / `fill`, `append` for a draft; copies text and toasts where the box cannot be filled), so no `/handoff` bubble stays in the chat; **0.6.6** the `кеш` chip returns, only while the countdown runs; **0.6.7** the chip counts down as `кеш 59:48` (m:ss, every second) instead of whole minutes | seen live: 0.6.4 two rows in a narrow window and one row full-screen; 0.6.5 no bubble (`evidence/hud-0.6.5-handoff-button-fills-box-no-bubble-2026-10-08.webp`); 0.6.7 seconds ticking (`кеш 59:50` → `59:54`), one row in a wide window. **Not seen:** 0.6.7 in a narrow window, the chip disappearing at the end of the countdown | tests: `claude plugin test hud` 11/11, `node --test` 10/10 |
| Layout pass (07.10.2026, live screenshot with bars + chips + the time mode): **hud 0.6.3** drops the arrow of 0.6.2 (it cost width and sent `Прогрес` to a second row) and shortens `Зібрати handoff` to `Handoff`; **plan-progress 0.7.6-qa.10** takes 210 px (240 with `▾`) off the track instead of 140/170: the bars sit right of the Clippy gutter, which `bodyColumns` does not count, so `100%` and `✕` fell off the right edge; **next-steps-uk 1.0.0-uk.9** puts one blank line above the chip row so it does not touch the last bar | the stub engine does not lay out, so widths are checked only on screenshots; the five hud buttons fit one row down to a window about as wide as the screenshots (~1600 px panel); a narrower one wraps `Прогрес` again | tests: hud 9, next-steps 4, plan-progress qa-fork + regress; **not yet seen live** |
| plan-progress 0.7.6-qa.10 (07.10.2026, full-screen review of the stack with the Time machine pane open): a title is kept up to 160 characters and cut at a word with `…` (the card and the `▾` view ended `…кнопку р`, mid-word, because upstream cut at 80); a hairline above the first bar separates it from the hud row, as the bars are separated from each other | the stack (hud row, bars, chip row, Clippy centred at the left) held up at full-screen width; Time machine pane lists the points and offers `Fork here` (`Files: no snapshot for this point` for a plan_progress call: conversation only) | tests: plan-progress regress + qa-fork; **not yet seen live** |
| Live recording of the hud buttons (07.10.2026, 19 s, 12 frames read with OpenCV in a temp folder): **confirmed live**: `Compact` and `Clear` ask in Ukrainian (`Підтвердити / Скасувати`, plus the host's `Other` and `Skip`), `Скасувати` and `Skip` give the toast `hud: Стиснення скасовано: нічого не змінено.`, `Підтвердити` really runs `/compact` and `/clear` (`Context cleared`); **found**: the chips of next-steps stayed after `/clear` (fixed in next-steps-uk 1.0.0-uk.9: hidden on `/clear` and on `session.compact`), and pressing `Handoff` left a blank `handoff:` line in the chat and no text in the prompt box (open: the box held a draft/suggestion; to be rechecked with an empty box, and with a typed `/handoff`) | the recorded frames show no toast for `Handoff` (it may have gone before the first frame) | tests: next-steps 4, validate ok; **not yet seen live** |
| handoff 0.6.1 (07.10.2026, live check of a typed `/handoff`: the prompt filled the box and the toast showed; the host prints `handoff:` before it, so the message read `handoff: Handoff: …`): the messages no longer start with `Handoff:`; **a draft the person typed is kept**: with text in the box the prompt is appended after it (`mode: append`), with an empty box it replaces (`fill` replaces by default, which would wipe a draft) | the button press (origin `plugin`) still leaves a blank `handoff:` line in the chat, the host's own echo | tests: handoff 8 + 1 new (modes `append` then `replace`); the stub of `prompt.read` must answer `{ value: … }`, else the hook is skipped and the test passes for the wrong reason; **not yet seen live** |
| plan-progress 0.7.6-qa.10 (07.10.2026, from the final check: 5 bars + hud + chips did not fit, the top or the bottom row was cut off; the Stop hook asked to close bars the user had told to keep): **BUG-1** with 4 or more bars the finished ones fold into one line `✓ N готово ▾` (`▾` opens them, `▴` folds back, `✕` drops all finished); under 4 bars nothing folds; **BUG-2** the Stop reminder now says: finished → `next` or `done`; kept open by the user or waiting on the user → `needs_input` with a note (that ends the reminder), do not close it, the user's instruction comes first; the state keys `expanded` (qa.7) and `doneOpen` were missing from the state contract, `claude plugin validate plan-progress` now passes | folding saves ~55 px (a bar row ~84 px against a ~28 px line); with 4-5 bars all still open the stack can still be taller than the panel: not measured | tests: qa-fork 6 (2 new), regress 1 new, validate ok; **not yet seen live** |
| plan-progress 0.7.6-qa.11 … qa.15 (07.10.2026, edits made in other chats, written down here from NOTICE.md and the code, then one live bug fixed): **qa.11** finished bars stay until `✕` and do not count against the bar limit (8 newest kept); every bar has a `▾` that opens its steps with an optional one-line `detail` and a footer (stage, time, note); the pill keeps the stage name down to 260 px; **qa.12** the bar limit is 20 (a runaway guard only: running bars were pushed out by the 6th, and a later `done`/`next` failed with "no bar"); **qa.13-14** a finished bar is held 60 s (`DONE_HOLD_MS`) and then folds into `✓ N готово ▾` at any count (this replaced the `≥4` rule of qa.10); the footer reads `Крок 1 з 2 · етап 1 з 1 · 0с`; **qa.15** BUG: after the 60 s the screen showed an empty band with a hairline and no `✓ N готово` line: the hairline (full width) sat in the same row as the text and pushed it off the edge; the hairline is now above the row | seen in the owner's two screenshots (done bar with `0с 100% ✕`, then the same stack a minute later: gap between the hud row and `Далі`) | `qa-fork.mjs`: the footer check now expects `етап 1 з 1` (it still looked for the old `Етап 1 з 1`, so the file failed before this edit); tests: qa-fork 7, regress all passed, validate ok; **seen live (07.10.2026, 3 screenshots in `evidence/plan-progress-qa15-*`)**: a done bar (`2с`, 100%, `✕`), the opened `▾` (step + `Завершено за 2с`), and after 60 s the line `✓ 1 готово ▾` with `✕` at the right edge, above the `Далі` chips; the fold line sits tight under the hairline (no gap), left as is |
| handoff 0.6.2 (07.10.2026, live check of 0.6.1, scenario 1: empty box + the `Handoff` button): **seen live**: the prompt lands in the box and a toast appears; **found**: the chat still got the echo bubble `/handoff` and an empty reply line `handoff:` (`evidence/handoff-0.6.1-scenario1-*`); 0.6.2 returns `{}` instead of `{ text: '' }` for a press from the hud (the types say `text` is undefined when a command shows nothing), which should drop the blank `handoff:` line | the echo bubble `/handoff` is drawn by the host for any `$.command.run`; if it stays, the button would have to fill the box itself instead of running the command | scenarios 2 (draft) and 3 (typed `/handoff`) not yet run; test `origin plugin` now expects `undefined`; **not yet seen live** |
| Compact / Clear buttons checked for the same blank-line defect (07.10.2026, the owner asked): not affected | `hud` runs the built-in `/compact` and `/clear` with `$.command.run`; no hook of ours answers for them (`quick-actions` answers only a typed command in VS Code, with a non-empty cancel text), so the printed line (`Context cleared`) is the host's own; the echo bubble `/name` is drawn by the host for every command a plugin runs | if a blank `compact:` line shows up after the buttons, send a screenshot; the remedy would be to fill/run without the command | nothing changed |
| plan-progress 0.7.6-qa.10 (07.10.2026, found live in qa.6: only the glyph and the title were drawn, no track, percent or ✕): the title cell's `Box width` was given in px; it is **columns** (~8 px each), so a 448-px title became 448 columns and pushed the rest out of the row; now `Math.ceil(titleWidth / 8)`; test `qa_fork_title_box_width_is_in_columns`; also in qa.7: the hover card is drawn only for a title that is cut, and carries the title alone (it had the stage and percent too and was drawn for every bar, so with 3-4 bars the cards piled over the band and each other) | tests with a stub engine do not lay anything out, so a unit mix-up passes them; the screenshot caught it | **not yet seen live** |
| One-line band (07.10.2026, the owner): `hud` 0.5.0 draws `Контекст 49% · 5г 31% · 7д 28% · $10.36 · кеш 59:30` and the buttons `Зібрати handoff`, `Compact`, `Clear`, `Прогрес` in one wrapping row above the prompt; `handoff` 0.6.0 keeps only the Clippy, its remarks and `/handoff`; `quick-actions` 0.3.0 keeps only the typed-command confirm for VS Code; the fork `plan-progress` qa.5 has no footer button, so the footer shows no button of ours and the `…` problem is gone | the footer slot was too narrow for three buttons and mods cannot order their pieces of one row, so one mod (hud) owns the row; the buttons call `/handoff` and `/progress` of the other mods, and Compact / Clear ask by themselves inside hud because **the engine refuses `command.run` from a `command.run` hook** (found while building it) | `Прогрес` no longer shows the number of bars; the reset time of a limit shows only from 80%; the Compact / Clear confirm texts exist in two mods (hud, quick-actions); tests: hud 8, handoff 8, quick-actions 3, plan-progress regress all passed; **not yet seen live** (does the row wrap on a narrow window, do the buttons fit) |
| The mods live in `~/Desktop/MODS` (07.10.2026, the owner): the folder is the git repository that is pushed to GitHub from VS Code; the paths in this file and in `install-pack.sh` point there; the old copy in `СLAUDE files /mods` is only a working copy | one folder to version, share and install from | the marketplace `qa-mods` is registered on the folder it was added from: after the move run `claude plugin marketplace remove qa-mods` and then `bash "$HOME/Desktop/MODS/install-pack.sh"` (the script adds the marketplace from its own folder); until then installs still read the old folder |
| Third-party code is read before it is installed | a mod runs with Claude Code's access | `sidekick`: 2092 lines, only API calls grepped, not a full audit |
| `install-pack.sh --all` adds the other marketplaces and the official / third-party plugins; without it only the 13 `qa-mods` | the pack stays small by default | `session-time-machine` (npx) and claude.ai account plugins are manual |

Possible next extensions of `handoff` (not done, the user decides; random remarks were done in 0.4.0): a Clippy line that also reacts to the hud limit (`5 год` over 85%), a `/handoff` that first shows what it will write, a one-key dismiss of the Clippy for the session, mood from the cache countdown ("кеш прострочений").

## Limits and safety

- **Runs with your access.** claude.dev: "A mod is code that runs inside Claude Code on your machine, with the same access Claude Code has." Read a mod before installing it, including these.
- **Guard rails, not a security boundary.** claude.dev says mods cannot serve as a permission system: inspecting command *text* can be bypassed (a script, an encoded command, code that deletes without `rm`). `blast-radius`, `sandbox-guard` and `verification-guard` catch common cases and make Claude visible and accountable; they do not replace permissions or the sandbox.
- **10-second budget per hook dispatch.** Time spent inside `$` calls does not count, so waiting for a dialog (`$.ui.ask`) is fine; slow pure computation inside a hook is not.
- **No DOM, no Node.** A mod runs in its own environment and reaches the outside only through `$`.
- **Optional `types/index.d.ts`** is needed only for mods that keep values in `$.state`.
- **Debugging.** `claude --debug` writes the log. A failing hook is skipped with a dim line in the transcript naming the plugin, the event and the reason.

## References

Sources read while writing this guide (read on 2026-10-02):

1. [claude.dev/mods](https://claude.dev/mods/): the mods catalog (built-in and community mods, the install command for community mods).
2. [claude.dev/blog/getting-started-with-claude-code-mods](https://claude.dev/blog/getting-started-with-claude-code-mods/): install flow (`/plugin marketplace add`, `/plugin install`, `/reload-plugins`), "on by default from 2.1.287", the 10-second hook limit, the "same access as Claude Code" warning, module structure. Documents **terminal and desktop**; VS Code is not mentioned there.
3. [claude.com/blog/claude-code-mods](https://claude.com/blog/claude-code-mods): the announcement: what a mod is, the three hook patterns (observe, rewrite, answer), shipping mods inside plugins.
4. [github.com/anthropics/claude-code/tree/main/mods](https://github.com/anthropics/claude-code/tree/main/mods): the source of the built-in mods (`sec-default`, `diff`, `telemetry`, `agents-md`), the type declarations and the testing kit (`claude plugin test`).

Everything marked ✅ / 🧪 / ❓ in this file comes from our own runs, not from those pages. In particular, VS Code behaviour here was tested by us.

## When each mod runs

All mods fire only on what **Claude** does inside a session (its tool calls, answers and slash commands). Nothing you type yourself in a terminal panel is seen. They load at session start and work the same whether the session was started in the desktop app or in the VS Code extension; the differences are in what can be *shown* (see the last column).

Legend: ✅ confirmed live · 🧪 passes the engine test harness only (not yet seen in a real session) · ❓ unknown.

| Mod | Runs when | Desktop app | VS Code |
| --- | --- | --- | --- |
| `blast-radius` | Claude calls **Bash** with a risky command. **HIGH** → dialog "Run it / Cancel": any `rm`/`unlink`/`shred`, `git reset --hard`, `git clean -f`, `git checkout -- …` / `git restore` (not `--staged`), `git push --force`, `git branch -D`, `find -delete/-exec`, `chmod/chown -R`, `dd`/`mkfs`/`diskutil`/`truncate`, `sudo`, `curl … \| sh`. **MEDIUM** → toast + log only: `mv`, `cp`, `chmod/chown`, `sed -i`/`perl -i`, `>` truncating redirect, `rmdir`, `git stash drop/clear`. Cancel blocks the command. Paths are previewed read-only, nothing is executed | 🧪 dialog; ❓ toast | ✅ dialog and Cancel; ❓ toast |
| `replay-theater` | Every successful **Edit/Write** is recorded (up to 200 steps, this session only; edits made through Bash such as `sed -i` are not). Shown when you run `/replay` (`/replay next`, `/replay prev`, `/replay 2`) | 🧪 diff as text **plus** a pane with Prev/Next (hotkeys `p`/`n`) | 🧪 diff as text; the pane is not drawn |
| `secret-redactor` | **Every** tool result. Masks private keys, `sk-ant-…`/`sk-…`, GitHub/Slack/AWS tokens, JWTs, `Bearer …`, and `password/secret/token/api_key = value`. Claude is told to mention that something was masked. Does not cover your own prompts or files Claude writes | ✅ masking observed in a desktop session; the "tell the user" note not seen | 🧪 |
| `evidence-saver` | A tool result contains a base64 image (png/jpeg/webp/gif). First time it asks for a folder (type an absolute path under "Other"), then remembers it; `/evidence-dir` shows, sets or resets it. Needs `python3`; images over ~8 MB base64 are skipped. Whether your browser tool returns images this way is ❓ | 🧪 | 🧪 |
| `sandbox-guard` | **Edit/Write** on a protected path, or **Bash** that both writes (`>`, `tee`, `cp`, `mv`, `rm`, `mkdir`, `sed -i`, `npm i`, `brew install` …) and mentions one: `~/.claude/settings*`, `projects/`, `skills/`, `plugins/`, `hooks/`, `~/.local/`, `/opt/homebrew`, `~/Library/Application Support/Claude/`. Denied with a message telling Claude to give you a Terminal command. Reading is allowed | 🧪 | 🧪 |
| `verification-guard` | The **final answer** of the main conversation (not intermediate steps, not subagents). Detects claims in en/ru/uk: tests pass, API returns N, verified, done/fixed, no regression. A claim is supported only by a **successful** test/request/browser check **after the last edit** ("done" is judged only if files were edited this turn). Unsupported → `⚠ verification-guard` line appended to the answer. `/evidence` lists claims and proof. Warns only | 🧪 | 🧪 |
| `retry-analyzer` | **Every** tool call. Same call fails 3 times in a row, or the same error appears 4 times → Claude is told to stop, change approach and tell you. Counters reset when you send a prompt or the call succeeds | 🧪 | 🧪 |

What "shown" means per surface: dialogs (`ask`), denials, command text and notes Claude relays work on both. Panes, `$.ui.log` and toasts are not guaranteed outside the desktop/terminal UI, which is why the VS Code-critical mods use dialogs and text.

## Mistakes to avoid

- **Typing the test command into the VS Code Terminal panel.** Mods hook only commands that *Claude* runs through its Bash tool. A command you type yourself is never intercepted.
- **Forgetting the feature flag on a pre-2.1.287 build.** Plugins show as installed, `/replay` is missing, nothing happens.
- **Testing in an old chat.** Always start a new one after install or update.
- **Expecting panes and logs in VS Code.** The extension does not draw `Pane` or `$.ui.log` output. Use dialogs (`$.ui.ask`), tool-call deny/rewrite and command `text` for anything the user must see. Panes are fine on desktop/terminal.
- **Secret Redactor also masks harmless text.** Anything shaped like `password/token/key = value` in a tool result is replaced, including docs and code that Claude *reads*. The file on disk is unchanged; only Claude's view is masked. Never copy text out of a redacted `Read` result into an `Edit`, and expect false positives when reading config or documentation.
- **Updating without bumping the version.** Installed plugins are cached copies (`~/.claude/plugins/cache/qa-mods/<name>/<version>`). After editing a mod, raise `version` in its `.claude-plugin/plugin.json`, then:
  ```bash
  claude plugin marketplace update qa-mods
  claude plugin update <name>@qa-mods
  ```
  If it says nothing to update: `claude plugin uninstall <name>@qa-mods` and install again.
- **Delivering a change: `rsync` alone does nothing.** Two copies exist: the source folder (`~/Desktop/MODS`, what `claude plugin list` prints as `Read from:`) and the **installed copy** in `~/.claude/plugins/cache/qa-mods/<name>/<version>`, which `~/.claude/plugins/installed_plugins.json` names as `installPath`. The engine loads the installed copy. `claude plugin update` answers "read from its folder, nothing to update" and leaves it at the old version; `/reload-plugins`, a fork, a new chat and even quitting the app load the same old copy (seen 07.10.2026: blast-radius 0.5.4, hud 0.6.0, next-steps-uk uk.6 and plan-progress qa.6 were in `MODS` while the app ran 0.5.0 / 0.5.0 / uk.5 / qa.5). To deliver a change: (1) bump `version` in the mod's `plugin.json`; (2) edit directly in `~/Desktop/MODS` (since 08.10.2026 it is the only copy; the old `rsync` from `СLAUDE files /mods` is no longer needed); (3) re-install each changed mod: `claude plugin uninstall <name>@qa-mods && claude plugin install <name>@qa-mods`; (4) check that `installed_plugins.json` shows the new `installPath`/`version`; (5) start a **new** chat (a fork keeps the old code). The sandbox cannot write to `~/.claude/plugins`, so step 3 is a Terminal command for the owner. A retest report must name the version it ran.
- **Showing results through logs/toasts.** Not drawn in VS Code. Use `$.ui.ask` (dialog), `{ deny }`, or a `context` note that tells the model to relay it. Dialog text collapses newlines: use labelled sentences, not line breaks.
- **Editing a tool result but keeping `ref`/`text`.** Return `{ result, context }` only, otherwise the engine may reuse the original messages and your edit never reaches the model.
- **Reading tool input from `e.input`.** Tool arguments are on the event itself: `e.command`, `e.file_path`.
- **Passing `$.fs` / `$.session` around as values.** Always call `$.noun.method(...)` directly; the validator rejects anything else.
- **Skipping the checks.** Before shipping a change:
  ```bash
  export CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1
  claude plugin validate <mod>   # reads the source the way the engine will
  claude plugin test <mod>       # runs tests/*.test.ts on the real engine
  ```
- **Trusting "it passes" for UI.** Tests mount the pane on terminal/desktop/vscode surfaces but never check pixels or where the host places the pane.
- **Printing everything into the transcript.** Blast Radius used to log the command, the reasons and every path in one long line, which in the desktop app repeated what the tool row above already shows. A log line is plain text and cannot be folded. Since 0.3.1 the transcript gets only `⚠ Blast Radius [MEDIUM]`, and the details (reasons, "Will touch: …") are appended to the end of that command's own output, i.e. inside the tool row the person opens with its chevron; `/blast` prints the same report as text. The HIGH dialog keeps the full text, because the choice needs it.
  - **What did not work (0.3.0):** hooks on the `ToolResult` / `ToolUse` render components. The plugin tests passed on the terminal, desktop and vscode surfaces, but in the real desktop app the expanded row is drawn by the app itself and the appended block never appeared (screenshot of the expanded row, 06.10.2026). A passing UI test does not prove the host draws that component.
  - **Cost of the output route:** the model reads the appended block too (about 50 tokens per risky command, marked as "not command output"). (The option `appendToOutput` was removed in 0.4.0: the block is always appended.)
  - Confirmed live: the short label (`evidence/blast-radius-0.3.0-short-label-desktop-2026-10-06.webp`). Not yet seen: the block inside the expanded row with 0.3.1.
- **Leaving a progress bar in `needs_input`.** `plan-progress` shows amber with `?` while it waits for you, green only when closed with `done`. Close the bar once the work is finished, otherwise it looks stuck.
- **A test that passes by accident.** The handoff test for `/handoff` stubbed `prompt.fill` with the wrong result shape (`{ value: { isFilled } }` instead of `{ isFilled }`), so the mod silently took the copy-and-print branch, and the assertion still passed because both branches contained the same phrase. It surfaced only when the strings were translated. Assert on text that only the intended branch can produce, and read the "hook was skipped" lines the test runner prints.
- **The strings a mod prints.** The instructions here are English, the on-screen text of the mods is Ukrainian (handoff, remote-gate, hud, next-steps-uk) or English (notify, quick-actions); the table "Labels you will see" lists them.
- **Treating the whole Bash command as shell.** A command often carries other languages or prose: a `python3 - <<'EOF'` body, a `git commit -m "..."` message, a document written through a heredoc. Pattern-matching the raw text gives false alarms: `=>`, `->`, `>=` and `a > b` read as a redirect (Blast Radius 0.1.3), and a doc that merely mentions a protected path plus the word `cp` gets blocked (Sandbox Guard 0.1.2 blocked its own fix). Before matching: cut heredoc bodies and mask quoted strings. Keep the body only when a shell reads it (`bash <<EOF`). Test with real commands copied from a screenshot of the false alarm.
- **Matching on text instead of meaning (secrets).** `token = getToken(user)`, `secret: process.env.X`, `password = user.password` are code, not secrets; masking them breaks reading source files (Secret Redactor 0.1.2). Skip values that look like expressions (parentheses, dotted identifiers, `process.`/`env.` prefixes).
- **Expecting a dialog for every warning.** Blast Radius asks (Run it / Cancel) only for HIGH. MEDIUM is a single line, and in the desktop app that line lands in the chat. If you see no dialog, check the risk level first, then the plugin version (see the next point).
- **Testing in an old session.** A mod is loaded when the session starts. After `claude plugin update`, a running session keeps the old version: the false alarms you fixed keep appearing. Check `installed_plugins.json` for the version, then start a new session.
- **Fixing a mod from inside a session that runs the old, buggy version.** The old guard can block your own edit (it did). Write the fix script to a scratchpad file and run it, or run it in your own Terminal.

## Uninstall

```bash
for m in sandbox-guard remote-gate blast-radius retry-analyzer secret-redactor evidence-saver replay-theater verification-guard handoff notify quick-actions hud next-steps-uk plan-progress; do
  claude plugin uninstall "$m@qa-mods"
done
claude plugin marketplace remove qa-mods
```

## Status (2026-10-02)

Confirmed live (✅): Blast Radius dialog in VS Code, including Cancel, and `rm` treated as HIGH; Secret Redactor masking tool output in a desktop session. The seven mods of that date passed `claude plugin validate` and `claude plugin test`; the pack is now 13 mods (live check of 06.10.2026 is in "From scratch" above). Everything marked 🧪 above still needs one real-session check (see "Verify"). The mods API is early access and may change between releases.
