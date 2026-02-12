#!/usr/bin/env bash
set -euo pipefail

# Release script for mcp-klever-vm
# Bumps version locally (GPG-signed), pushes tag to trigger CI release workflow.
#
# Usage: ./scripts/release.sh <patch|minor|major>

BUMP_TYPE="${1:-}"

if [[ -z "$BUMP_TYPE" ]] || [[ ! "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]]; then
  echo "Usage: ./scripts/release.sh <patch|minor|major>"
  exit 1
fi

# Must be on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "Error: must be on 'main' branch (currently on '$CURRENT_BRANCH')"
  exit 1
fi

# Working tree must be clean
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree is not clean. Commit or stash changes first."
  exit 1
fi

# Ensure local main is up-to-date with remote
git fetch origin main
LOCAL_SHA=$(git rev-parse HEAD)
REMOTE_SHA=$(git rev-parse origin/main)
if [[ "$LOCAL_SHA" != "$REMOTE_SHA" ]]; then
  echo "Error: local main ($LOCAL_SHA) differs from origin/main ($REMOTE_SHA)."
  echo "Run 'git pull origin main' first."
  exit 1
fi

echo "==> Running validation (typecheck + lint + test)..."
pnpm validate

echo "==> Bumping version ($BUMP_TYPE)..."
npm version "$BUMP_TYPE" -m "release: v%s"

NEW_VERSION=$(node -p 'require("./package.json").version')
echo "==> Version bumped to v$NEW_VERSION"

echo "==> Pushing commit and tag to origin..."
git push origin main --follow-tags

echo ""
echo "Done! Tag v$NEW_VERSION pushed."
echo "The release workflow will create a GitHub Release and publish to npm."
echo ""
echo "To sync develop, merge main back into develop:"
echo "  git checkout develop && git pull && git merge main && git push"
