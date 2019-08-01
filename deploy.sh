#!/usr/bin/env bash
set -euo pipefail
shopt -s inherit_errexit

git checkout master
git pull
CURRENT=$(git rev-parse HEAD)
npm i
npm run build
git checkout gh-pages
cp -R public/* .
git add .
git commit -m "deploy commit $CURRENT"
git push
