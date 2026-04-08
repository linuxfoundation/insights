#!/usr/bin/env bash
# PostToolUse hook: suggest /tech-writer when doc-impacting files are edited
#
# Fires after every Edit or Write tool call. If the changed file lives in a
# path that typically requires public documentation, prints a reminder so
# Claude surfaces it at the end of the session.

input=$(cat)

file_path=$(echo "$input" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('file_path', ''))
except Exception:
    pass
" 2>/dev/null)

[ -z "$file_path" ] && exit 0

# Paths whose changes are likely user-facing and need documentation
patterns=(
  "frontend/app/pages/"
  "frontend/app/components/modules/"
  "frontend/server/api/"
)

for pattern in "${patterns[@]}"; do
  if [[ "$file_path" == *"$pattern"* ]]; then
    echo "Doc check: '${file_path}' is in a doc-impacting area."
    echo "If this change adds or modifies user-facing behaviour, run /tech-writer to create or update the docs."
    exit 0
  fi
done

exit 0
