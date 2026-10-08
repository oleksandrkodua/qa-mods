#!/bin/bash
# Experiment for the timemachine-qa design: does `claude --resume` accept a session transcript that was cut
# with `head` at a line boundary and had its session id swapped with `sed`?
#
# Touches ONLY the tm-test project folder, and only CREATES one new .jsonl file (the original is read, never changed).
# Run:   bash "$HOME/Desktop/MODS/experiments/cut-resume.sh"
set -euo pipefail

PROJ="${TM_PROJ:-$HOME/.claude/projects/-Users-noaod-Desktop-tm-test}"

if [ ! -d "$PROJ" ]; then
  echo "No such folder: $PROJ (open ~/Desktop/tm-test in Claude and send two prompts first)" >&2
  exit 1
fi

# 1) pick the newest session with at least two real prompts and compute the line just before the 2nd prompt
PICK=$(python3 - "$PROJ" <<'PY'
import glob, json, os, sys

proj = sys.argv[1]

def text_of(row):
    c = (row.get("message") or {}).get("content")
    if isinstance(c, str):
        return c
    if isinstance(c, list):
        if any(isinstance(b, dict) and b.get("type") == "tool_result" for b in c):
            return ""
        return " ".join(b.get("text", "") for b in c if isinstance(b, dict) and b.get("type") == "text")
    return ""

import re

# VS Code adds <ide_opened_file>/<ide_selection> notes (in the same text block or a block of their own)
# and the engine adds <system-reminder> blocks: they are not what the person typed
NOISE = re.compile(r"<(ide_[a-z_]+|system-reminder)>.*?</\1>", re.S)

def typed(row):
    return NOISE.sub("", text_of(row)).strip()

def is_prompt(row):
    if row.get("type") != "user" or row.get("isSidechain") or row.get("isMeta"):
        return False
    t = typed(row)
    # slash-command echoes are not prompts
    return bool(t) and not t.startswith(("<command-name>", "<local-command"))

for path in sorted(glob.glob(proj + "/*.jsonl"), key=os.path.getmtime, reverse=True):
    rows = []
    with open(path, encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            try:
                rows.append((i, json.loads(line)))
            except ValueError:
                rows.append((i, {}))
    prompts = [i for i, r in rows if is_prompt(r)]
    if len(prompts) < 2:
        users = [i for i, r in rows if r.get("type") == "user"]
        sys.stderr.write("skip %s: %d rows, %d user rows, %d prompts\n" % (os.path.basename(path), len(rows), len(users), len(prompts)))
        continue
    # cut after the last real conversation row (user/assistant) of the first turn: bookkeeping rows that
    # sit right before the 2nd prompt (queue-operation carries that prompt's text) must not stay in the copy
    cut = max(i for i, r in rows if i < prompts[1] and r.get("type") in ("user", "assistant"))
    sys.stderr.write("source: %s  (%d lines, %d prompts)\n" % (os.path.basename(path), len(rows), len(prompts)))
    for i, r in rows:
        t = (typed(r) if r.get("type") == "user" else text_of(r)).strip().replace("\n", " ")[:60]
        mark = "  <-- cut after this line" if i == cut else ""
        sys.stderr.write("%4d  %-10s %s%s\n" % (i, r.get("type", "?"), t, mark))
    print("%d\t%s" % (cut, path))
    break
else:
    sys.stderr.write("No session with two prompts in %s: send two prompts in a tm-test chat first.\n" % proj)
    sys.exit(2)
PY
)

CUT=${PICK%%$'\t'*}
SRC=${PICK#*$'\t'}
OLD=$(basename "$SRC" .jsonl)
NEW=$(uuidgen | tr 'A-Z' 'a-z')
DST="$PROJ/$NEW.jsonl"

# 2) the same two shell steps the mod would run: cut at a line boundary, swap the session id
head -n "$CUT" "$SRC" | sed "s/$OLD/$NEW/g" > "$DST"

echo
echo "created : $DST"
echo "lines   : $(wc -l < "$DST") of $(wc -l < "$SRC")"
echo "old id left inside the copy (must be 0): $(grep -c "$OLD" "$DST" || true)"
echo "last row type: $(tail -n 1 "$DST" | python3 -c 'import json,sys; print(json.loads(sys.stdin.read()).get("type"))')"
echo
echo "NEXT: in a Terminal run"
echo "  cd ~/Desktop/tm-test && claude --resume $NEW"
echo "In the resumed session ask: what were my messages in this conversation? (one line)"
echo "Expected if the cut worked: only the FIRST prompt is known, not the second one."
echo
echo "CLEANUP when done:  rm \"$DST\""
