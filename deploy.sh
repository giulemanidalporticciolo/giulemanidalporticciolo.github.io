#!/bin/bash
set -e

SOURCE_DIR="$(pwd)"
DEPLOY_DIR="$(pwd)/../pages-deploy"

echo "==> Verifico che tu sia su main"
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ]; then
  echo "Devi essere su 'main' per fare il deploy. Sei su '$current_branch'."
  exit 1
fi

echo "==> Verifico che non ci siano modifiche non committate"
if ! git diff-index --quiet HEAD --; then
  echo "Hai modifiche non committate su main. Fai commit prima di continuare."
  exit 1
fi

echo "==> Building con Jekyll..."
bundle exec jekyll build

if [ ! -d "$DEPLOY_DIR" ]; then
  echo "Cartella $DEPLOY_DIR non trovata. Vedi le istruzioni di setup iniziale."
  exit 1
fi

echo "==> Aggiorno il clone di pages"
cd "$DEPLOY_DIR"
git checkout pages
git pull origin pages || true

echo "==> Pulisco il contenuto attuale (tranne .git)"
find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} +

echo "==> Copio l'output della build"
cp -r "$SOURCE_DIR/_site/"* .

echo "==> Commit e push"
git add -A
git commit -m "deploy: build locale $(date '+%Y-%m-%d %H:%M:%S')" || echo "Nulla di nuovo da pubblicare"
git push origin pages

echo "✅ Deploy completato! Nessun cambio di branch nella cartella principale."
