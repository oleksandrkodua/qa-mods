#!/bin/bash
# Installs or updates the whole QA pack with one command. Run it in your own Terminal.
#
#   bash "$HOME/Desktop/MODS/install-pack.sh"            # install or update everything
#   bash "$HOME/Desktop/MODS/install-pack.sh" --dry-run  # only print what it would do
#   bash "$HOME/Desktop/MODS/install-pack.sh" --all      # also add the other marketplaces and install
#                                                                      # the official / third-party plugins (see INSTALL.md)
#   flags can be combined: --all --dry-run
#
# Plugins are installed at user scope, so the same pack works in the CLI, the desktop app (Code tab)
# and the VS Code extension. Start a NEW session in each of them afterwards.
set -uo pipefail

MARKET="qa-mods"
MODS=(sandbox-guard remote-gate blast-radius retry-analyzer secret-redactor evidence-saver replay-theater verification-guard handoff notify quick-actions hud next-steps-uk plan-progress)
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DRY=0
ALL=0
for a in "$@"; do
  case "$a" in
    --dry-run) DRY=1 ;;
    --all) ALL=1 ;;
  esac
done

# third-party and official plugins, installed only with --all: "plugin@marketplace" and where the marketplace comes from
EXTRA_MARKETS=(anthropics/claude-plugins-official genkovich/sdd)
EXTRA_PLUGINS=(superpowers@claude-plugins-official playwright@claude-plugins-official code-review@claude-plugins-official claude-code-setup@claude-plugins-official telegram@claude-plugins-official sdd@sdd)

run() {
  echo "+ $*"
  if [ "$DRY" -eq 0 ]; then "$@"; fi
}

command -v claude >/dev/null || { echo "claude CLI not found in PATH" >&2; exit 1; }

# 1) the marketplace: add it once (a local folder), otherwise refresh it
if claude plugin marketplace list 2>/dev/null | grep -q "$MARKET"; then
  run claude plugin marketplace update "$MARKET"
else
  run claude plugin marketplace add "$SRC"
fi

# 1b) --all: the other marketplaces (skipped when already registered; the name is the part after the slash)
if [ "$ALL" -eq 1 ]; then
  for src in "${EXTRA_MARKETS[@]}"; do
    name="${src##*/}"
    if ! claude plugin marketplace list 2>/dev/null | grep -qi "$name"; then
      run claude plugin marketplace add "$src" || echo "could not add marketplace $src" >&2
    fi
  done
fi

# 2) the community next-steps is replaced by our Ukrainian fork: two copies would draw two bands
if claude plugin list 2>/dev/null | grep -q "next-steps@claude-community"; then
  run claude plugin uninstall next-steps@claude-community
fi

# 2b) plan-progress is our fork (plan-progress@qa-mods): the original under the same plugin name must go,
#     two copies would register the same tool and draw two bars
if claude plugin list 2>/dev/null | grep -q "plan-progress@zycck-mods"; then
  run claude plugin uninstall plan-progress@zycck-mods
fi

# 3) every mod: install when missing, update when installed
FAILED=()
for m in "${MODS[@]}"; do
  if claude plugin list 2>/dev/null | grep -q "${m}@${MARKET}"; then
    run claude plugin update "${m}@${MARKET}" || FAILED+=("$m")
  else
    run claude plugin install "${m}@${MARKET}" || FAILED+=("$m")
  fi
done

if [ "$ALL" -eq 1 ]; then
  for pl in "${EXTRA_PLUGINS[@]}"; do
    if claude plugin list 2>/dev/null | grep -q "$pl"; then
      run claude plugin update "$pl" || FAILED+=("$pl")
    else
      run claude plugin install "$pl" || FAILED+=("$pl")
    fi
  done
fi

echo
claude plugin list 2>/dev/null | grep -A1 -E "❯ ($(IFS='|'; echo "${MODS[*]}"))@${MARKET}" | grep -E "❯|Version" | paste - -

if [ "${#FAILED[@]}" -gt 0 ]; then
  echo "FAILED: ${FAILED[*]}" >&2
  exit 1
fi

echo
echo "Done. Start a NEW session in the CLI, the desktop app and VS Code."
if [ "$ALL" -eq 0 ]; then
  echo "Third-party plugins were not touched (use --all, see INSTALL.md): superpowers, playwright, code-review, claude-code-setup, telegram, sdd."
fi
echo "Not scripted: session-time-machine (npx), claude.ai account plugins and connector sign-ins (see INSTALL.md)."
