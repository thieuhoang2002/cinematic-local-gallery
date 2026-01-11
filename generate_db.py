# -*- coding: utf-8 -*-
import os
import json
from pathlib import Path
from datetime import datetime
import re
import sys

# Fix encoding for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Natural sort function for proper number ordering (1, 2, 3, ... 10, 11 instead of 1, 10, 11, ... 2)
def natural_sort_key(filename):
    """Convert filename to a key that sorts naturally with numbers"""
    def convert(text):
        return int(text) if text.isdigit() else text.lower()
    return [convert(c) for c in re.split(r'(\d+)', str(filename))]

# Function to extract date from filename
def extract_date_from_filename(filename):
    # Try to extract date from filename patterns like '20250511', 'IMG_20250511', etc.
    date_patterns = [
        r'(\d{4})-(\d{2})-(\d{2})',  # YYYY-MM-DD
        r'(\d{4})(\d{2})(\d{2})',     # YYYYMMDD
        r'_(\d{4})(\d{2})(\d{2})_',   # _YYYYMMDD_
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, filename)
        if match:
            groups = match.groups()
            year = groups[0]
            month = groups[1] if len(groups) > 1 else '01'
            day = groups[2] if len(groups) > 2 else '01'
            return f'{year}-{month}-{day}'
    
    # Return today's date as default
    return '2025-12-29'

# Function to create slug from filename
def create_id(category, filename):
    # Sử dụng cả tên file VÀ extension để đảm bảo ID unique
    name_with_ext = filename.lower().replace(' ', '-')
    # Remove special characters but keep Vietnamese characters
    slug = re.sub(r'[^\w\s.-]', '', name_with_ext, flags=re.UNICODE)
    slug = re.sub(r'[-\s]+', '-', slug)
    cat_slug = category.lower().replace(' ', '-').replace('/', '-')
    return f'{cat_slug}-{slug}'

# Scan image directories
photos = []
videos = []
image_dir = Path('./public/image')

print("🔍 Scanning images...")
for category_dir in sorted(image_dir.iterdir()):
    if category_dir.is_dir():
        category_name = category_dir.name
        print(f"  📁 {category_name}")
        for img_file in sorted(category_dir.iterdir(), key=lambda x: natural_sort_key(x.name)):
            if img_file.is_file():
                # Kiểm tra nếu là ảnh
                if img_file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
                    photo_data = {
                        'id': create_id(category_name, img_file.name),
                        'title': img_file.stem,
                        'category': category_name,
                        'src': f'/image/{category_name}/{img_file.name}',
                        'date': extract_date_from_filename(img_file.name),
                        'type': 'photo'
                    }
                    photos.append(photo_data)
                # Kiểm tra nếu là video trong thư mục image
                elif img_file.suffix.lower() in ['.mp4', '.webm', '.mov', '.avi', '.mkv']:
                    video_data = {
                        'id': create_id(category_name, img_file.name),
                        'title': img_file.stem,
                        'category': category_name,
                        'src': f'/image/{category_name}/{img_file.name}',
                        'thumbnail': f'/image/{category_name}/{img_file.name}',
                        'date': extract_date_from_filename(img_file.name),
                        'type': 'video'
                    }
                    videos.append(video_data)

# Scan video directories
video_dir = Path('./public/video')

print("\n🔍 Scanning videos...")
for category_dir in sorted(video_dir.iterdir()):
    if category_dir.is_dir():
        category_name = category_dir.name
        print(f"  📁 {category_name}")
        for vid_file in sorted(category_dir.iterdir(), key=lambda x: natural_sort_key(x.name)):
            if vid_file.is_file() and vid_file.suffix.lower() in ['.mp4', '.webm', '.mov', '.avi', '.mkv']:
                video_data = {
                    'id': create_id(category_name, vid_file.name),
                    'title': vid_file.stem,
                    'category': category_name,
                    'src': f'/video/{category_name}/{vid_file.name}',
                    'thumbnail': f'/video/{category_name}/{vid_file.name}',
                    'date': extract_date_from_filename(vid_file.name),
                    'type': 'video'
                }
                videos.append(video_data)

# Generate TypeScript file
print("\n📝 Generating db.ts...")
ts_content = 'import { MediaItem } from \'../types\';\n\n'

# Chia nhỏ photos thành các chunks để tránh "union type too complex"
CHUNK_SIZE = 300
photo_chunks = [photos[i:i + CHUNK_SIZE] for i in range(0, len(photos), CHUNK_SIZE)]
video_chunks = [videos[i:i + CHUNK_SIZE] for i in range(0, len(videos), CHUNK_SIZE)]

# Generate photo chunks
for i, chunk in enumerate(photo_chunks):
    ts_content += f'const photos{i + 1} = '
    ts_content += json.dumps(chunk, indent=2, ensure_ascii=False)
    ts_content += ' as MediaItem[];\n\n'

# Combine photo chunks
ts_content += 'export const photos = ['
ts_content += ', '.join([f'...photos{i + 1}' for i in range(len(photo_chunks))])
ts_content += '] as MediaItem[];\n\n'

# Generate video chunks
for i, chunk in enumerate(video_chunks):
    ts_content += f'const videos{i + 1} = '
    ts_content += json.dumps(chunk, indent=2, ensure_ascii=False)
    ts_content += ' as MediaItem[];\n\n'

# Combine video chunks
ts_content += 'export const videos = ['
ts_content += ', '.join([f'...videos{i + 1}' for i in range(len(video_chunks))])
ts_content += '] as MediaItem[];\n\n'

ts_content += 'export const mediaItems = [...photos, ...videos] as MediaItem[];\n'

# Write to file
with open('./data/db.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f'\n✅ Generated db.ts successfully!')
print(f'📸 Total photos: {len(photos)}')
print(f'🎬 Total videos: {len(videos)}')
print(f'📦 Total media items: {len(photos) + len(videos)}')
