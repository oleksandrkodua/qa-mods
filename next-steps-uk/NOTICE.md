Fork of `next-steps` from anthropics/claude-plugins-community (MIT, author: Thariq Shihipar).
Changes in `hooks/register.tsx`:
1. `forkPrompt()` has an added LANGUAGE paragraph (Ukrainian labels and prompts).
2. (1.0.0-uk.2) VS Code: the engine raises `AbovePrompt` on the terminal and desktop only, so on `vscode` the suggestions are drawn under the last reply block (`ui.render` on `AssistantMessage`); a press fills the composer, or copies the prompt to the clipboard where the surface refuses the fill.
3. (1.0.0-uk.3) The block under which the offer goes is found by the last 24 letters and digits of the answer, not an exact text match (the drawn markdown can differ from the raw answer). `tests/vscode.test.tsx` covers the vscode path and checks the terminal draws no buttons under replies.
Install this INSTEAD of `next-steps@claude-community`, not alongside it (two copies would draw two suggestion bands).
4. (1.0.0-uk.5) The VS Code branch (`AssistantMessage`, uk.2 and uk.3) is removed: it never showed anything there live, and the fork it caused after every long answer cost usage for nothing. On `vscode` no fork is asked now. `tests/vscode.test.tsx` became `tests/surface.test.tsx`.
