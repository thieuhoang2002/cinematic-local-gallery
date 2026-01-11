# 💾 Hướng Dẫn Lưu Dữ Liệu Vào db.ts

## 🎯 Mục đích
Giải quyết vấn đề **mất dữ liệu** khi localStorage bị xóa hoặc clear cache. Sau khi chỉnh sửa tags/title/category, bạn có thể lưu vĩnh viễn vào file `data/db.ts`.

---

## 🚀 Cách sử dụng

### Bước 1: Chạy Backend Server
Mở terminal và chạy:

```powershell
cd cinematic-local-gallery
npm run server
```

Bạn sẽ thấy:
```
🚀 Backend server running on http://localhost:3001
📁 Database file: C:\...\data\db.ts
```

**Lưu ý:** Giữ terminal này chạy trong suốt quá trình làm việc.

### Bước 2: Chạy App (terminal mới)
Mở terminal thứ 2:

```powershell
npm run dev
```

### Bước 3: Chỉnh sửa dữ liệu
1. Truy cập http://localhost:3000
2. Vào tab **Admin** (sidebar)
3. Chỉnh sửa title, tags, category cho video/ảnh
4. Các thay đổi tự động lưu vào localStorage

### Bước 4: Lưu vào db.ts
1. Trong Admin Panel, click nút **"💾 Lưu vào db.ts"**
2. Confirm dialog xuất hiện
3. Đợi vài giây
4. Thông báo thành công hiển thị:
   ```
   ✅ Lưu thành công!
   📸 1234 ảnh
   🎬 567 videos
   📦 Backup: db.backup-1735567890123.ts
   ```

---

## 📁 File Backup

Mỗi lần lưu, server tự động tạo backup với tên:
```
db.backup-{timestamp}.ts
```

Ví dụ:
```
data/db.ts                          ← File hiện tại
data/db.backup-1735567890123.ts    ← Backup lần 1
data/db.backup-1735567901456.ts    ← Backup lần 2
```

Để khôi phục từ backup:
```powershell
# Rename backup thành db.ts
cd cinematic-local-gallery/data
mv db.backup-1735567890123.ts db.ts
```

---

## ⚙️ Cấu trúc Backend Server

File: [server.cjs](server.cjs)

- **Port:** 3001
- **API Endpoint:** `POST /api/save-db`
- **CORS:** Enabled (để frontend có thể gọi)
- **Backup:** Tự động trước khi ghi đè

---

## ⚠️ Lưu ý quan trọng

### 1. Server phải chạy
Nếu server không chạy, bạn sẽ thấy lỗi:
```
❌ Lỗi khi lưu vào db.ts:
Failed to fetch

⚠️ Đảm bảo backend server đang chạy:
node server.cjs
```

### 2. Sau khi lưu
- File `db.ts` đã được cập nhật
- **Nhưng app đang chạy vẫn dùng dữ liệu cũ trong memory**
- Để thấy thay đổi: **Refresh trang** (F5)
- localStorage sẽ bị clear và load dữ liệu mới từ `db.ts`

### 3. Production Build
Nếu muốn deploy:
```powershell
npm run build
```
File `dist/` sẽ chứa code đã compile với `db.ts` mới.

---

## 🔄 Workflow Hoàn Chỉnh

```
┌─────────────────┐
│  Chỉnh sửa UI   │ → localStorage
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Click "Lưu vào  │ → POST /api/save-db
│    db.ts"       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend Server │ → Tạo backup
│  (port 3001)    │ → Ghi db.ts
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Refresh trang  │ → Load db.ts mới
│      (F5)       │
└─────────────────┘
```

---

## 🐛 Troubleshooting

### Lỗi: "Failed to fetch"
- Server chưa chạy → `npm run server`
- Port 3001 bị chiếm → Kill process hoặc đổi port trong `server.cjs`

### Lỗi: "Invalid data format"
- Dữ liệu bị corrupt → Import lại từ backup JSON
- Check console log để debug

### Dữ liệu không cập nhật
- Chưa refresh trang → Nhấn F5
- Cache browser → Xóa localStorage thủ công

---

## 💡 Tips

1. **Backup thường xuyên:** Export JSON ra file trước khi chỉnh sửa nhiều
2. **Giữ backup:** Đừng xóa các file `db.backup-*.ts`
3. **Test trước:** Thử lưu với vài items trước khi lưu toàn bộ
4. **Version control:** Commit `db.ts` vào Git sau mỗi lần lưu lớn

---

## 📞 Support

Nếu gặp vấn đề, check:
- Terminal backend có lỗi gì không
- Network tab trong DevTools (F12)
- File `db.ts` có quyền ghi không
