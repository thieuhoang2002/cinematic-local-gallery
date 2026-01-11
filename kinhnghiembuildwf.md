# Kinh nghiệm thiết lập và sử dụng GitHub Actions Workflow (cinematic-local-gallery)

Tổng hợp các bước và lỗi đã gặp khi khởi tạo workflow, build và deploy lên GitHub Pages, cùng cách khắc phục để media hiển thị đúng.

## Mục tiêu
- Tự động build dự án Vite + React khi push lên `main`.
- Tự động deploy lên GitHub Pages từ artifact.
- Đảm bảo media trong `public/` (image, video, thumbs) xuất hiện trên site.

## Thiết lập ban đầu
- Tạo workflow tại [.github/workflows/build.yml](.github/workflows/build.yml) với các bước: checkout, setup Node, `npm install`, `npm run build`, upload artifact, deploy.
- Bật GitHub Pages: Settings → Pages → Source: "GitHub Actions".
- Đổi README hiển thị sang tiếng Việt bằng cách copy nội dung [HDSD.md](HDSD.md) vào [README.md](README.md).

## Cấu hình Vite (quan trọng)
- Base path khác nhau cho dev và prod trong [vite.config.ts](vite.config.ts):
  - Dev: `base: '/'` để local server phục vụ root.
  - Prod: `base: '/cinematic-local-gallery/'` để Pages phục vụ đúng sub-path.
- Copy media vào build: đảm bảo `publicDir: 'public'` để Vite đưa thư mục `public/` vào `dist/`.
- Kiểm tra `dist/index.html` có link tới `/cinematic-local-gallery/assets/...` (đúng base) và thư mục media có mặt trong `dist/`.

## Tailwind CSS cho production
- Không dùng CDN `cdn.tailwindcss.com` trong production.
- Thêm devDependencies và cấu hình:
  - [package.json](package.json): `tailwindcss`, `postcss`, `autoprefixer`.
  - [postcss.config.js](postcss.config.js) và [tailwind.config.js](tailwind.config.js).
  - Tạo [index.css](index.css) với `@tailwind base; @tailwind components; @tailwind utilities;` và import trong [index.tsx](index.tsx).

## Media URL dưới GitHub Pages
- Vấn đề: Đường dẫn tuyệt đối `/image`, `/video`, `/thumbs` sẽ trỏ về root (404) trên Pages.
- Giải pháp: prefix bằng `import.meta.env.BASE_URL` + encode URL.
  - [utils/mediaUrl.ts](utils/mediaUrl.ts):
    - `getImageSrc()` và `getVideoSrc()` → prefix `BASE_URL` và encode từng segment.
  - Đảm bảo mọi nơi render media đều dùng helpers:
    - [components/LazyImage.tsx](components/LazyImage.tsx) dùng `getImageSrc()`.
    - [components/VideoThumbnail.tsx](components/VideoThumbnail.tsx) dùng `getVideoSrc()` cho `<source>` và `getImageSrc()` cho thumbnail (đã sửa import thiếu).

## Favicon 404
- Tránh 404 bằng cách dùng favicon dạng Data URL trong [index.html](index.html): emoji 🎬 SVG inline.

## Workflow tweaks và debug
- [build.yml](.github/workflows/build.yml):
  - Thêm `NODE_ENV: production` tại bước build để chắc chắn chạy prod.
  - Thêm bước "List build output" để log số file và nội dung `dist/` khi cần debug.
  - Sử dụng `actions/upload-pages-artifact@v3` với `path: dist`.
- Quan sát Actions:
  - Xác nhận có đủ thư mục `image/`, `video/`, `thumbs/` trong artifact.
  - Nếu site chưa cập nhật, thử commit trống để trigger rebuild.

## Lỗi đã gặp và cách khắc phục
- 404 `index.css` và media trên Pages:
  - Nguyên nhân: base path sai → sửa `base` theo mode dev/prod và dùng `BASE_URL` trong helpers.
- Cảnh báo Tailwind CDN prod:
  - Gỡ CDN, cài PostCSS + Tailwind local, import CSS.
- 404 favicon:
  - Dùng Data URL favicon.
- `ReferenceError: getImageSrc is not defined`:
  - Thiếu import trong [components/VideoThumbnail.tsx](components/VideoThumbnail.tsx) → thêm `{ getImageSrc }`.
- Dev không hiển thị media:
  - Do `base` đặt `/cinematic-local-gallery/` trong dev → chuyển dev về `/`.

## Quy trình kiểm tra nhanh
- Local dev:
  1) `npm install`
  2) `npm run dev` → mở `http://localhost:3000/`
- Build + preview:
  1) `npm run build`
  2) `npm run preview` → mở địa chỉ dạng `/cinematic-local-gallery/`
- Deploy:
  1) Push lên `main`
  2) Xem Actions build/deploy → hard refresh Pages.

## Một số lệnh hữu ích
```powershell
# Trigger rebuild Pages
git commit --allow-empty -m "Trigger rebuild"
git push

# Kiểm tra nội dung dist sau build local
npm run build
npm run preview

# Sinh thumbnails (Node) và cập nhật DB
npm run thumbs:generate
npm run thumbs:update-db

# Tạo lại db.ts từ public (Python)
python generate_db.py
```

## Checklist trước khi deploy
- [ ] `vite.config.ts` có `base` đúng và `publicDir: 'public'`.
- [ ] Mọi render media dùng `getImageSrc()` / `getVideoSrc()`.
- [ ] Không dùng Tailwind CDN; CSS đã import qua PostCSS.
- [ ] `dist/` có đầy đủ `image/`, `video/`, `thumbs/`.
- [ ] GitHub Pages: Source = GitHub Actions, workflow hoàn thành ✅.
- [ ] Hard refresh trang sau deploy.
