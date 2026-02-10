#!/bin/bash
# Validate MCP server tools, prompts, and resources using the MCP Inspector CLI.
# Usage: pnpm run validate:mcp
#
# Prerequisites: pnpm run build (uses dist/ output)
# Requires: @modelcontextprotocol/inspector (installed via npx on demand)

set -euo pipefail

INSPECTOR="npx @modelcontextprotocol/inspector --cli -e MODE=mcp -e STORAGE_TYPE=memory"
SERVER_CMD="node dist/index.js"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BOLD='\033[1m'
RESET='\033[0m'

RESULTS_FILE=$(mktemp)
STDERR_FILE=$(mktemp)
trap 'rm -f "$RESULTS_FILE" "$STDERR_FILE"' EXIT

# Run an inspector command, capturing stderr. Show stderr only on failure.
run_inspector() {
  local result
  if result=$($INSPECTOR "$@" $SERVER_CMD 2>"$STDERR_FILE"); then
    echo "$result"
  else
    echo -e "${RED}Inspector command failed: $INSPECTOR $*${RESET}" >&2
    cat "$STDERR_FILE" >&2
    return 1
  fi
}

log_pass() { echo "PASS" >> "$RESULTS_FILE"; echo -e "  ${GREEN}✓${RESET} $1"; }
log_fail() { echo "FAIL" >> "$RESULTS_FILE"; echo -e "  ${RED}✗${RESET} $1"; }
log_warn() { echo "WARN" >> "$RESULTS_FILE"; echo -e "  ${YELLOW}!${RESET} $1"; }

# --- Preflight checks ---
if ! command -v python3 >/dev/null 2>&1; then
  echo -e "${RED}Error: python3 is required for JSON parsing. Install Python 3 or use 'brew install python3'.${RESET}"
  exit 1
fi

if [ ! -f "dist/index.js" ]; then
  echo -e "${RED}Error: dist/index.js not found. Run 'pnpm run build' first.${RESET}"
  exit 1
fi

echo -e "${BOLD}MCP Server Validation${RESET}"
echo ""

# --- 1. Tools ---
echo -e "${BOLD}Tools${RESET}"

TOOLS_JSON=$(run_inspector --method tools/list)
TOOL_COUNT=$(echo "$TOOLS_JSON" | python3 -c "import json,sys; print(len(json.load(sys.stdin)['tools']))")

if [ "$TOOL_COUNT" -gt 0 ]; then
  log_pass "tools/list returned $TOOL_COUNT tools"
else
  log_fail "tools/list returned 0 tools"
fi

# Validate each tool
TOOL_ISSUES=$(echo "$TOOLS_JSON" | python3 -c "
import json, sys

data = json.load(sys.stdin)
tools = data['tools']
issues = []

for t in tools:
    name = t['name']
    desc = t.get('description', '')
    ann = t.get('annotations', {})
    props = t.get('inputSchema', {}).get('properties', {})

    if not desc:
        issues.append(('FAIL', f'{name}: missing description'))
    else:
        wc = len(desc.split())
        if wc > 100:
            issues.append(('FAIL', f'{name}: description is {wc} words (max 100)'))

    if not ann:
        issues.append(('FAIL', f'{name}: missing annotations'))
    elif 'readOnlyHint' not in ann:
        issues.append(('WARN', f'{name}: annotations missing readOnlyHint'))

    for pname, pschema in props.items():
        if isinstance(pschema, dict) and pschema.get('type') != 'object' and 'description' not in pschema:
            issues.append(('WARN', f'{name}.{pname}: missing description'))

if issues:
    for level, msg in issues:
        print(f'{level}|{msg}')
else:
    print('PASS|All tools pass validation checks')
")

while IFS='|' read -r level msg; do
  case "$level" in
    PASS) log_pass "$msg" ;;
    FAIL) log_fail "$msg" ;;
    WARN) log_warn "$msg" ;;
  esac
done <<< "$TOOL_ISSUES"

# --- 2. Prompts ---
echo ""
echo -e "${BOLD}Prompts${RESET}"

PROMPTS_JSON=$(run_inspector --method prompts/list)
PROMPT_COUNT=$(echo "$PROMPTS_JSON" | python3 -c "import json,sys; print(len(json.load(sys.stdin)['prompts']))")

if [ "$PROMPT_COUNT" -gt 0 ]; then
  log_pass "prompts/list returned $PROMPT_COUNT prompts"
else
  log_fail "prompts/list returned 0 prompts"
fi

PROMPT_CHECKS=$(echo "$PROMPTS_JSON" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for p in data['prompts']:
    name = p['name']
    desc = p.get('description', '')
    if not desc:
        print(f'FAIL|{name}: missing description')
    else:
        label = desc[:60] + '...' if len(desc) > 60 else desc
        print(f'PASS|{name}: {label}')
")

while IFS='|' read -r level msg; do
  case "$level" in
    PASS) log_pass "$msg" ;;
    FAIL) log_fail "$msg" ;;
  esac
done <<< "$PROMPT_CHECKS"

# --- 3. Resources ---
echo ""
echo -e "${BOLD}Resources${RESET}"

RESOURCES_JSON=$(run_inspector --method resources/list)
RESOURCE_COUNT=$(echo "$RESOURCES_JSON" | python3 -c "import json,sys; print(len(json.load(sys.stdin)['resources']))")

if [ "$RESOURCE_COUNT" -gt 0 ]; then
  log_pass "resources/list returned $RESOURCE_COUNT resources"
else
  log_warn "resources/list returned 0 resources"
fi

TEMPLATES_JSON=$(run_inspector --method resources/templates/list)
TEMPLATE_COUNT=$(echo "$TEMPLATES_JSON" | python3 -c "import json,sys; print(len(json.load(sys.stdin)['resourceTemplates']))")

if [ "$TEMPLATE_COUNT" -gt 0 ]; then
  log_pass "resources/templates/list returned $TEMPLATE_COUNT templates"
else
  log_warn "resources/templates/list returned 0 templates"
fi

# --- 4. Smoke test: call a tool ---
echo ""
echo -e "${BOLD}Smoke Test${RESET}"

STATS_RESULT=$(run_inspector --method tools/call --tool-name get_knowledge_stats | python3 -c "
import json, sys
data = json.load(sys.stdin)
text = json.loads(data['content'][0]['text'])
if text.get('success'):
    print(f'PASS|get_knowledge_stats: {text[\"stats\"][\"total\"]} knowledge entries loaded')
else:
    print('FAIL|get_knowledge_stats returned success=false')
" 2>/dev/null || echo "FAIL|get_knowledge_stats call failed")

while IFS='|' read -r level msg; do
  case "$level" in
    PASS) log_pass "$msg" ;;
    FAIL) log_fail "$msg" ;;
  esac
done <<< "$STATS_RESULT"

# --- Summary ---
echo ""
PASS_COUNT=$(grep -c "^PASS$" "$RESULTS_FILE" || true)
FAIL_COUNT=$(grep -c "^FAIL$" "$RESULTS_FILE" || true)
WARN_COUNT=$(grep -c "^WARN$" "$RESULTS_FILE" || true)

echo -e "${BOLD}Summary: ${GREEN}${PASS_COUNT} passed${RESET}, ${RED}${FAIL_COUNT} failed${RESET}, ${YELLOW}${WARN_COUNT} warnings${RESET}"

if [ "${FAIL_COUNT}" -gt 0 ]; then
  exit 1
fi
