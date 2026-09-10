#!/bin/bash
set -e

SOURCE_BRANCH="main"
DEPLOY_BRANCH="pages"

cleanup() {
  current=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
  if [ "$current" != "$SOURCE_BRANCH" ] && [ -n "$current" ]; then
    echo "==> (cleanup) Torno su $SOURCE_BRANCH dopo un errore"
    find . -name '.DS_Store' -delete 2>/dev/null || true
    git checkout -f "$SOURCE_BRANCH" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "==> Verifico che tu sia su $SOURCE_BRANCH"
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "$SOURCE_BRANCH" ]; then
  echo "Sei su '$current_branch', ti sposto su '$SOURCE_BRANCH'..."
  git checkout "$SOURCE_BRANCH"
fi

echo "==> Verifico che non ci siano modifiche non committate"
if ! git diff-index --quiet HEAD --; then
  echo "Hai modifiche non committate su $SOURCE_BRANCH. Fai commit prima di continuare."
  exit 1
fi

echo "==> Building con Jekyll..."
bundle exec jekyll build

echo "==> Passo al branch $DEPLOY_BRANCH"
find . -name '.DS_Store' -delete 2>/dev/null || true
if git show-ref --verify --quiet "refs/heads/$DEPLOY_BRANCH"; then
  git checkout -f "$DEPLOY_BRANCH"
else
  git checkout --orphan "$DEPLOY_BRANCH"
fi

echo "==> Pulisco il branch $DEPLOY_BRANCH (tranne .git e _site)"
find . -maxdepth 1 ! -name '.git' ! -name '_site' ! -name 'deploy.sh' ! -name '.' -exec rm -rf {} +

echo "==> Copio l'output della build"
cp -r _site/* .
rm -rf _site

echo "==> Commit e push"
git add -A -- . ':!deploy.sh'
git commit -m "deploy: build locale $(date '+%Y-%m-%d %H:%M:%S')" || echo "Nulla di nuovo da pubblicare"
git push origin "$DEPLOY_BRANCH" --force

echo "==> Torno su $SOURCE_BRANCH"
find . -name '.DS_Store' -delete 2>/dev/null || true
git checkout -f "$SOURCE_BRANCH"

echo "✅ Deploy completato!"
