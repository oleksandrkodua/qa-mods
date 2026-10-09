# qa-mods

Fourteen Claude Code mods, packaged as one plugin marketplace (`qa-mods`). Made for a manual QA workflow: guard rails around risky commands, evidence for what was tested, and a status band above the prompt.

## Install

Run in your own Terminal (a sandboxed Claude session cannot write `~/.claude`).

```bash
claude plugin marketplace add oleksandrkodua/qa-mods
claude plugin install hud@qa-mods
```

Replace `hud` with any plugin from the table.

To install everything from a local clone, or to set up a fresh machine, see [INSTALL.md](INSTALL.md) and `install-pack.sh`.

## Plugins

| Plugin | What it does |
| --- | --- |
| `sandbox-guard` | Denies writes to protected Claude config paths and hands back a Terminal command |
| `remote-gate` | Asks before `git push` and `wrangler --remote`, showing folder, branch, remote and the commits that will go out |
| `blast-radius` | Shows what a risky Bash command will touch before it runs |
| `retry-analyzer` | Detects repeated identical failing tool calls and tells Claude to change strategy |
| `secret-redactor` | Masks tokens and keys in tool output |
| `evidence-saver` | Saves screenshots from tool results to a folder you pick |
| `replay-theater` | `/replay`: step through the session's file edits one by one |
| `verification-guard` | Checks claims like "tests pass" against tool calls that actually ran |
| `handoff` | Offers `/handoff` as the context fills up; fills the prompt box with a HANDOFF.md prompt |
| `notify` | A toast and a macOS notification when a long command or turn finishes |
| `quick-actions` | Compact and Clear buttons, each asks to confirm first |
| `hud` | Context fill and rate-limit windows above the prompt, a short `кеш 42хв` chip while the prompt cache is warm, five buttons, and `/hud` with the figures as text |
| `next-steps-uk` | Fork of next-steps (MIT, Thariq Shihipar): suggested next prompts are always in Ukrainian. Install instead of `next-steps` |
| `plan-progress` | Fork of plan-progress 0.7.6 (zycck, MIT): live progress bars above the prompt. Install instead of `plan-progress@zycck-mods` |

## Tests

```bash
claude plugin test hud                                              # from the repo root
cd hud && node --test tests/format.test.mjs tests/handoff-prompt.test.mjs
```

A bare `node --test` also picks up `register.test.ts`, which only runs under `claude plugin test`.

## Project notes

- [HANDOFF.md](HANDOFF.md): current state, open checks, what not to revert.
- [CONTEXT.md](CONTEXT.md): background and decisions.

## License

No license file for the original mods yet. The two forks keep their upstream MIT notices: `next-steps-uk/NOTICE.md` and `plan-progress/NOTICE.md` (plus `plan-progress/LICENSE.upstream`).
