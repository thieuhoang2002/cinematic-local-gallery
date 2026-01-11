#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

// Wire ffmpeg binary bundled by ffmpeg-static so users do not need a system install.
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const VIDEO_DIR = path.join(PROJECT_ROOT, 'public', 'video');
const IMAGE_DIR = path.join(PROJECT_ROOT, 'public', 'image');
const THUMB_DIR = path.join(PROJECT_ROOT, 'public', 'thumbs');
const VALID_EXT = new Set(['.mp4', '.mov', '.m4v', '.avi', '.mkv', '.webm']);

async function fileExists(filePath) {
  try {
    await access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

async function walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      const ext = path.extname(entry.name).toLowerCase();
      return VALID_EXT.has(ext) ? [fullPath] : [];
    })
  );
  return files.flat();
}

function makeThumbPath(filePath) {
  let base = '';
  let rel = '';
  if (filePath.startsWith(VIDEO_DIR)) {
    base = '';
    rel = path.relative(VIDEO_DIR, filePath);
  } else if (filePath.startsWith(IMAGE_DIR)) {
    base = 'image';
    rel = path.relative(IMAGE_DIR, filePath);
  } else {
    rel = path.basename(filePath);
  }
  const parsed = path.parse(rel);
  const safeName = `${parsed.name}.jpg`;
  return base ? path.join(THUMB_DIR, base, parsed.dir, safeName) : path.join(THUMB_DIR, parsed.dir, safeName);
}

async function createThumbnail(videoPath, thumbPath) {
  await ensureDir(path.dirname(thumbPath));
  const timemark = process.env.THUMB_TIMEMARK || '00:00:01';
  const size = process.env.THUMB_SIZE || '640x?';

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('error', (err) => reject(err))
      .on('end', () => resolve())
      .screenshots({
        count: 1,
        timemarks: [timemark],
        filename: path.basename(thumbPath),
        folder: path.dirname(thumbPath),
        size,
      });
  });
}

async function main() {
  const roots = [VIDEO_DIR, IMAGE_DIR].filter((p) => fs.existsSync(p));
  const lists = await Promise.all(roots.map((r) => walk(r)));
  const allVideos = lists.flat();
  if (!allVideos.length) {
    console.log('No videos found in', VIDEO_DIR);
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const videoPath of allVideos) {
    const thumbPath = makeThumbPath(videoPath);
    const exists = await fileExists(thumbPath);
    if (exists) {
      skipped += 1;
      continue;
    }
    try {
      console.log('Generating thumbnail for', path.relative(PROJECT_ROOT, videoPath));
      await createThumbnail(videoPath, thumbPath);
      created += 1;
    } catch (err) {
      console.error('Failed for', videoPath, '\n', err.message);
    }
  }

  console.log(`Done. Created ${created}, skipped ${skipped}. Output: ${THUMB_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
