#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(PROJECT_ROOT, 'data', 'db.ts');

function rewriteThumbnails(content) {
  let changed = 0;
  // /video/...mp4 -> /thumbs/...jpg
  const step1 = content.replace(/("thumbnail"\s*:\s*")\/video\/([^"\n]+?)\.(mp4|mov|m4v|avi|mkv|webm)(")/gi, (_, p1, relPath, _ext, p4) => {
    changed += 1;
    return `${p1}/thumbs/${relPath}.jpg${p4}`;
  });
  // /image/...mp4 -> /thumbs/image/...jpg
  const step2 = step1.replace(/("thumbnail"\s*:\s*")\/image\/([^"\n]+?)\.(mp4|mov|m4v|avi|mkv|webm)(")/gi, (_, p1, relPath, _ext, p4) => {
    changed += 1;
    return `${p1}/thumbs/image/${relPath}.jpg${p4}`;
  });
  return { replaced: step2, changed };
}

function main() {
  const original = fs.readFileSync(DB_PATH, 'utf8');
  const { replaced, changed } = rewriteThumbnails(original);
  if (!changed) {
    console.log('No video thumbnails needed updates.');
    return;
  }
  fs.writeFileSync(DB_PATH, replaced, 'utf8');
  console.log(`Updated ${changed} thumbnail entries in data/db.ts`);
}

main();
