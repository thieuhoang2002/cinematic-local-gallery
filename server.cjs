#!/usr/bin/env node
/**
 * Simple backend server to save media data to db.ts
 * Run: node server.cjs
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const DB_PATH = path.join(__dirname, 'data', 'db.ts');

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/save-db') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { photos, videos } = JSON.parse(body);
        
        if (!Array.isArray(photos) || !Array.isArray(videos)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid data format' }));
          return;
        }

        // Create backup first
        const backupPath = DB_PATH.replace('.ts', `.backup-${Date.now()}.ts`);
        fs.copyFileSync(DB_PATH, backupPath);

        // Generate new db.ts content
        const content = `import { MediaItem } from '../types';

export const photos: MediaItem[] = ${JSON.stringify(photos, null, 2)};

export const videos: MediaItem[] = ${JSON.stringify(videos, null, 2)};
`;

        // Write to db.ts
        fs.writeFileSync(DB_PATH, content, 'utf8');

        console.log(`✅ Saved ${photos.length} photos and ${videos.length} videos to db.ts`);
        console.log(`📦 Backup created: ${path.basename(backupPath)}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          photosCount: photos.length, 
          videosCount: videos.length,
          backup: path.basename(backupPath)
        }));
      } catch (error) {
        console.error('❌ Error saving db.ts:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', dbPath: DB_PATH }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Database file: ${DB_PATH}`);
  console.log(`\n💡 To save data: POST to http://localhost:${PORT}/api/save-db`);
  console.log(`\n⚠️  Remember to run this server before using "Save to db.ts" feature!\n`);
});
