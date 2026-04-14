#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

REPO_URL_HTTPS="https://github.com/AmberEnk/MongoliansDate.git"
REPO_URL_SSH="git@github.com:AmberEnk/MongoliansDate.git"

if ! command -v git >/dev/null 2>&1; then
  echo "git is not installed or not on PATH."
  exit 1
fi

if [ ! -d .git ]; then
  git init -b main
fi

git add -A
if git diff --cached --quiet; then
  echo "No changes to commit."
else
  git commit -m "Initial commit: Uchral local demo"
fi

if git remote get-url origin >/dev/null 2>&1; then
  echo "Remote 'origin' already set."
else
  if [ "${1:-}" = "ssh" ]; then
    git remote add origin "$REPO_URL_SSH"
    echo "Added origin (SSH)."
  else
    git remote add origin "$REPO_URL_HTTPS"
    echo "Added origin (HTTPS)."
  fi
fi

echo "Pushing to GitHub..."
git push -u origin main

echo "Done: https://github.com/AmberEnk/MongoliansDate"
