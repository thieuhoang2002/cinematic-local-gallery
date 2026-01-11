# Hướng Dẫn Sử Dụng (cinematic-local-gallery)

Tài liệu này tóm tắt các tính năng chính, cách vận hành, và các lệnh cần nhớ để bạn không phải mò lại sau này.

## 1) Chạy dự án (dev server)
- Yêu cầu: Node.js (>=18), npm.
- Thư mục làm việc: `cinematic-local-gallery`.

PowerShell (Windows):
```powershell
cd cinematic-local-gallery
npm install
npm run dev
```
- Mở: http://localhost:3000
- Nếu cổng 3000 bận hoặc server kẹt, dừng bằng Ctrl+C rồi chạy lại.

## 2) Tính năng chính
- Thư viện Video/Ảnh: lưới hiển thị, phân trang, xem chi tiết video/ảnh.
- Bộ lọc theo Danh mục + Tag: chọn danh mục và/hoặc tag để lọc nhanh.- **Lượt xem (Views):** 
  - Tự động đếm số lần xem mỗi ảnh/video
  - Hiển thị số lượt xem với icon 👁️ ở nhiều vị trí:
    - Grid view (hover ảnh, bên cạnh video)
    - Lightbox (xem ảnh)
    - Video player (thông tin video)
  - Dữ liệu lưu vào localStorage và tự động sync vào db.ts
- **Video Player nâng cao:**
  - Fullscreen thực sự (F11-like): chiếm toàn bộ màn hình
  - Theater mode: mở rộng chiều ngang
  - Video gợi ý ngẫu nhiên: hiển thị 8 video random ở dưới player
  - Controls đầy đủ: speed, volume, seek, keyboard shortcuts
- **Tự động lưu dữ liệu:**
  - Auto-save mỗi 5 phút vào db.ts
  - Tự động lưu khi đóng tab/trình duyệt
  - Thông báo trạng thái save (góc dưới phải màn hình)- Admin Panel:
  - Tìm kiếm theo tiêu đề, id, tag.
  - Chỉnh sửa: `title`, `category`, `tags`, `thumbnail` (video).
  - Import/Export JSON dữ liệu.
  - Xem thumbnail preview trong danh sách (đối với video).
  - Nút “Generate thumbnail từ video” (chỉ hoạt động trong trình duyệt) để tạo tạm thời 1 ảnh xem trước.
- Thumbnail dựng sẵn (pre-generated): load rất nhanh vì chỉ tải ảnh `.jpg`, không cần giải mã video trong browser.

## 3) Cấu trúc thư mục media
- Video gốc: `public/video/**` và (nếu có) `public/image/**` (một số video ngắn nằm ở đây).
- Thumbnail đã sinh: `public/thumbs/**`
  - Với video từ `public/video/**` → thumbnail lưu tại `public/thumbs/<cùng đường dẫn>.jpg`.
  - Với video từ `public/image/**` → thumbnail lưu tại `public/thumbs/image/<cùng đường dẫn>.jpg`.

Ví dụ:
- `public/video/Category/sample.mp4` → `public/thumbs/Category/sample.jpg`
- `public/image/Shorts/foo.mp4` → `public/thumbs/image/Shorts/foo.jpg`

## 4) Sinh thumbnail hàng loạt (máy cục bộ, dùng ffmpeg)
Script đã kèm `ffmpeg-static` và `fluent-ffmpeg` nên không cần cài ffmpeg hệ thống.

Sinh tất cả thumbnail cho video trong `public/video/**` và `public/image/**`:
```powershell
cd cinematic-local-gallery
npm run thumbs:generate
```
Tùy chọn (PowerShell) chọn thời điểm và kích thước ảnh:
```powershell
# Lấy khung ở giây 2, chiều rộng 640
$env:THUMB_TIMEMARK="00:00:02"
$env:THUMB_SIZE="640x?"
npm run thumbs:generate
```
Gợi ý: lần sau chỉ tạo những file chưa có, file đã có sẽ bị bỏ qua.

## 5) Dùng thumbnail dựng sẵn trong ứng dụng
- Ứng dụng sẽ tự map `src` → `thumbnail` ở runtime nếu thiếu thumbnail (xem `App.tsx`).
- Để dữ liệu nguồn có sẵn đường dẫn thumbnail (không cần map runtime), chạy script cập nhật DB:
```powershell
cd cinematic-local-gallery
npm run thumbs:update-db
```
Script sẽ tìm những `thumbnail` còn đang trỏ `.mp4` và chuyển sang `/thumbs/... .jpg` tương ứng.

## 6) Admin Panel: thao tác chi tiết
- Vào tab Admin (sidebar) để quản trị.
- Ô tìm kiếm: gõ tiêu đề, id, hoặc tag.
- Chỉnh sửa:
  - Tiêu đề (`title`): nhập tên hiển thị.
  - Danh mục (`category`): nhập/đổi tên danh mục.
  - Tags: nhập nhiều tag, ngăn cách bằng dấu phẩy (ví dụ: `cute, hot`).
  - Thumbnail (video): dán URL ảnh, hoặc Data URL (bắt đầu bằng `data:image/jpeg;base64,...`).
- Generate thumbnail từ video (nút trong Admin):
  - Công dụng: tạo nhanh ảnh xem trước ngay trong trình duyệt (không ghi file vào `public/thumbs`).
  - Nếu muốn lưu thật vào đĩa, hãy dùng lệnh sinh thumbnail ở mục 4.
- Import/Export JSON:
  - Export: tải file `media-export.json` (ảnh hưởng bởi các thay đổi hiện tại trong bộ nhớ và localStorage).
  - Import: chọn file JSON để nạp lại dữ liệu.
- **💾 Lưu vào db.ts (MỚI):**
  - Nút "Lưu vào db.ts" lưu dữ liệu vĩnh viễn vào file source code `data/db.ts`.
  - **Yêu cầu:** Phải chạy backend server trước (xem mục 7).
  - Tự động tạo file backup trước khi ghi đè.
  - Sau khi lưu, dữ liệu sẽ không bị mất khi xóa localStorage hoặc clear cache.
- Lưu ý: dữ liệu chỉnh trong UI được lưu vào `localStorage`:
  - `media.photos`
  - `media.videos`
  - Để về dữ liệu gốc: xóa các key này trong trình duyệt hoặc import lại JSON gốc.

## 7) Chạy Backend Server (để lưu vào db.ts)
**Quan trọng:** Để sử dụng chức năng "Lưu vào db.ts" và **auto-save**, cần chạy backend server:

```powershell
# Terminal 1: Chạy backend server (port 3001)
cd cinematic-local-gallery
npm run server

# Terminal 2: Chạy dev server (port 3000)
npm run dev
```

- Backend server lắng nghe ở `http://localhost:3001`
- Khi click "Lưu vào db.ts" trong Admin Panel:
  - Dữ liệu được gửi đến server qua API
  - Server tạo backup tự động (ví dụ: `db.backup-1735567890123.ts`)
  - Ghi đè file `data/db.ts` với dữ liệu mới
  - **Lưu ý:** Sau khi lưu, cần build lại (`npm run build`) nếu muốn deploy production

### Tự động lưu (Auto-save)
- **Mỗi 5 phút:** App tự động lưu dữ liệu vào db.ts im lặng
- **Khi đóng tab:** Tự động lưu trước khi đóng trình duyệt
- **Thông báo trạng thái:** Góc dưới phải màn hình hiển thị:
  - 🟡 "Đang lưu..." (khi đang save)
  - 🟢 "Đã lưu lúc HH:MM:SS" (sau khi save thành công)
- **Yêu cầu:** Backend server phải đang chạy, nếu không auto-save sẽ im lặng skip

### Luồng dữ liệu
1. **Thao tác trong app** → lưu vào `localStorage` (tức thì)
2. **Auto-save (5 phút)** → lưu vào `data/db.ts` (vĩnh viễn)
3. **Hoặc click "Lưu vào db.ts"** → lưu ngay lập tức vào `data/db.ts`

## 8) Video Player - Hướng dẫn sử dụng

### Controls cơ bản
- **Play/Pause:** Click vào video hoặc nút play
- **Seek (tua):** Kéo thanh progress bar
- **Volume:** Click icon loa, hover để hiện thanh volume
- **Speed:** Click nút Settings (⚙️) để chọn tốc độ (0.25x → 2x)
- **Skip:** Nút ⏪ (lùi 5s) và ⏩ (tua 5s)

### Chế độ xem
- **Theater Mode:** Nút 🔳 - mở rộng video ra full chiều ngang
- **Fullscreen:** Nút ⛶ - toàn màn hình thực sự (tắt tất cả UI browser)
  - Phím tắt: `F` hoặc double-click
  - Thoát: `Esc` hoặc click nút Minimize

### Video gợi ý
- Hiển thị **8 video ngẫu nhiên** ở dưới player
- Chỉ hiện khi **không ở chế độ fullscreen**
- Click để xem video khác ngay lập tức
- Danh sách random mỗi lần mở video mới

### Keyboard Shortcuts
- `Space`: Play/Pause
- `→` `←`: Tua 5s
- `↑` `↓`: Tăng/giảm volume
- `F`: Toggle fullscreen
- `M`: Mute/Unmute
- `0-9`: Jump to 0%-90% của video
- `+` `-`: Tăng/giảm tốc độ phát

## 9) Tag Filter
- Thanh Tag nằm dưới thanh danh mục.
- Chọn `All` để bỏ lọc theo tag.
- Tag list được tổng hợp dựa trên tập item hiện có sau khi lọc theo danh mục.

## 9) Tag Filter
- Thanh Tag nằm dưới thanh danh mục.
- Chọn `All` để bỏ lọc theo tag.
- Tag list được tổng hợp dựa trên tập item hiện có sau khi lọc theo danh mục.

## 10) Lượt xem (Views Counter)

### Cách hoạt động
- **Tự động tăng:** Mỗi lần mở ảnh/video → +1 view
- **Hiển thị với icon 👁️:**
  - **Video Grid:** Số view bên cạnh ngày tháng
  - **Photo Grid:** Hiện khi hover vào ảnh
  - **Video Player:** Trong phần thông tin video
  - **Lightbox:** Trong top bar khi xem ảnh
- **Lưu trữ:**
  - Ngay lập tức: localStorage
  - Vĩnh viễn: db.ts (qua auto-save hoặc manual save)

### Reset lượt xem
Nếu muốn reset về 0:
1. Vào Admin Panel
2. Export JSON
3. Mở file, tìm và xóa tất cả field `"views"`
4. Import lại JSON đó
5. Lưu vào db.ts

## 11) Câu lệnh nhanh (PowerShell)
```powershell
# Cài deps và chạy dev server
cd cinematic-local-gallery
npm install
npm run dev

# Chạy backend server (terminal riêng, để auto-save hoạt động)
npm run server

# Sinh thumbnail cho tất cả video
npm run thumbs:generate

# Tùy chọn: thay đổi thời điểm/size khi sinh thumbnail
$env:THUMB_TIMEMARK="00:00:02"; $env:THUMB_SIZE="640x?"; npm run thumbs:generate

# Ghi đường dẫn thumbnail vào data/db.ts
npm run thumbs:update-db
```

## 12) Xử lý sự cố thường gặp
- Dev server không dừng được hoặc cổng 3000 bận:
  - Dừng bằng `Ctrl + C` trong terminal đang chạy, rồi `npm run dev` lại.
- Import JSON lỗi:
  - Kiểm tra định dạng file JSON, đảm bảo các trường tối thiểu (`id`, `title`, `category`, `src`, `date`, `type`, và `thumbnail` cho video nếu có).
- Thumbnail không hiện:
  - Kiểm tra đã có file `.jpg` trong `public/thumbs` đúng đường dẫn chưa.
  - Với video dưới `public/image/**`, thumbnail phải nằm ở `public/thumbs/image/**`.
- **Auto-save không hoạt động:**
  - Kiểm tra backend server có đang chạy không (`npm run server`)
  - Xem console có lỗi kết nối không
  - Thông báo save sẽ hiện góc dưới phải nếu thành công
- **Lượt xem không tăng:**
  - Xóa localStorage và thử lại
  - Kiểm tra console có lỗi không
- **Video gợi ý không hiện:**
  - Chỉ hiện khi không fullscreen
  - Cần có ít nhất 1 video khác trong database

## 13) Ghi chú kỹ thuật
- `App.tsx` tự map thumbnail nếu thiếu:
  - `/video/...mp4` → `/thumbs/...jpg`
  - `/image/...mp4` → `/thumbs/image/...jpg`
- `components/VideoThumbnail.tsx` ưu tiên dùng `thumbnailUrl` (ảnh dựng sẵn). Nếu không có, mới fallback sang cách tạo thumbnail tạm thời trong trình duyệt.
- `components/AdminPanel.tsx` hiển thị ảnh thumbnail nhỏ cho mỗi video ở danh sách bên trái.
- **Views counter:** Sử dụng `views` field trong MediaItem type, tự động increment khi click
- **Auto-save:** Sử dụng `setInterval` (5 phút) và `beforeunload` event
- **Fullscreen API:** Sử dụng native browser fullscreen API (`requestFullscreen()`)
- **Video suggestions:** Random shuffle từ tất cả videos, loại trừ video đang xem

Giữ file này (HDSD.md) bên cạnh dự án để tiện tra cứu nhanh.

## 14) Thêm mới ảnh hoặc video

Bạn có 2 phần việc: (1) bỏ file vào đúng thư mục, (2) thêm mục dữ liệu (qua Admin JSON hoặc sửa `data/db.ts`).

1) Bỏ file vào thư mục đúng

- Ảnh (photo): đặt vào `public/image/<Danh mục>/<ten-file>.(jpg|jpeg|png)`
  - Ví dụ: `public/image/Travel/paris-001.jpg`
- Video (khuyên dùng): đặt vào `public/video/<Danh mục>/<ten-file>.mp4`
  - Ví dụ: `public/video/Tổng hợp/new-clip.mp4`
- Video ngắn/gif-like (cũng hỗ trợ): có thể để ở `public/image/<Danh mục>/<ten-file>.mp4`

2) Tạo thumbnail cho video mới

PowerShell:
```powershell
cd cinematic-local-gallery
npm run thumbs:generate
```
- Mặc định sẽ tạo ảnh JPG tại:
  - `public/thumbs/<Danh mục>/<ten-file>.jpg` (nếu video ở `public/video/...`)
  - `public/thumbs/image/<Danh mục>/<ten-file>.jpg` (nếu video ở `public/image/...`)
- Tuỳ chọn thời điểm/kích thước:
```powershell
$env:THUMB_TIMEMARK="00:00:02"; $env:THUMB_SIZE="640x?"; npm run thumbs:generate
```

3) Thêm mục dữ liệu (để app hiển thị)

Bạn có 2 cách:

- Cách nhanh bằng Admin (không chạm code):
  1. Vào tab Admin → Export JSON để lấy bản hiện tại (tuỳ chọn).
  2. Tạo file JSON mới có thêm mục (xem mẫu bên dưới).
  3. Nhấn Import JSON để nạp.
  4. Dữ liệu sẽ lưu vào `localStorage` và dùng ngay.

- Cách cập nhật nguồn dữ liệu gốc: sửa file `data/db.ts`:
  1. Mở `cinematic-local-gallery/data/db.ts`.
  2. Thêm object `MediaItem` tương ứng vào danh sách `photos` (ảnh) hoặc `videos` (video).
  3. Lưu file, reload trang.

Mẫu JSON thêm mới (dùng cho Import JSON trong Admin):

Ảnh:
```json
{
  "photos": [
    {
      "id": "travel-paris-001.jpg",
      "title": "Paris 001",
      "category": "Travel",
      "src": "/image/Travel/paris-001.jpg",
      "date": "2025-12-29",
      "type": "photo",
      "tags": ["europe", "city"]
    }
  ]
}
```

Video (đã có thumbnail dựng sẵn):
```json
{
  "videos": [
    {
      "id": "tong-hop-new-clip.mp4",
      "title": "New Clip",
      "category": "Tổng hợp",
      "src": "/video/Tổng hợp/new-clip.mp4",
      "thumbnail": "/thumbs/Tổng hợp/new-clip.jpg",
      "date": "2025-12-29",
      "type": "video",
      "tags": ["hot", "short"],
      "views": 0
    }
  ]
}
```

Lưu ý:
- Nếu bạn chưa điền `thumbnail` cho video, ứng dụng sẽ tự map:
  - `src` bắt đầu bằng `/video/` → `/thumbs/... .jpg`
  - `src` bắt đầu bằng `/image/` → `/thumbs/image/... .jpg`
- Nếu muốn ghi cố định đường dẫn `thumbnail` vào `data/db.ts`, sau khi sinh xong thumbnails hãy chạy:
```powershell
npm run thumbs:update-db
```
- Trường `date` dùng để hiển thị, bạn có thể đặt theo `YYYY-MM-DD` hoặc string tuỳ ý.
- `id` nên duy nhất (thường dùng tên file gốc).
- **Field `views`:** Tùy chọn, mặc định là 0. Để trống cũng được, app sẽ tự khởi tạo khi cần.
