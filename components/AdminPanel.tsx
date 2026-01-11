import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { MediaItem, MediaCategory } from '../types';

interface AdminPanelProps {
  photos: MediaItem[];
  videos: MediaItem[];
  onUpdate: (item: MediaItem) => void;
  onExport: () => void;
  onImport: (payload: { photos?: MediaItem[]; videos?: MediaItem[] }) => void;
  onSaveToDb: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ photos, videos, onUpdate, onExport, onImport, onSaveToDb }) => {
  const [tab, setTab] = useState<'dashboard' | 'editor'>('dashboard');
  const [mode, setMode] = useState<'video' | 'photo'>('video');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thumbLoading, setThumbLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  const list = useMemo(() => {
    const pool = mode === 'video' ? videos : photos;
    const q = search.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      (item.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [mode, photos, videos, search]);

  const selectedItem = useMemo(() => list.find((i) => i.id === selectedId) || null, [list, selectedId]);

  useEffect(() => {
    if (selectedItem) {
      setTagsInput((selectedItem.tags || []).join(', '));
    } else {
      setTagsInput('');
    }
  }, [selectedItem?.id]);

  const handleFieldChange = useCallback(
    (field: 'title' | 'category' | 'thumbnail', value: string) => {
      if (!selectedItem) return;
      const nextValue = field === 'category' ? (value as MediaCategory) : value;
      const updated: MediaItem = {
        ...selectedItem,
        [field]: nextValue as never,
      };
      onUpdate(updated);
      setSelectedId(updated.id);
    },
    [onUpdate, selectedItem]
  );

  const handleTagsChange = useCallback(
    (value: string) => {
      setTagsInput(value);
      if (!selectedItem) return;
      const tags = value.split(',').map((t) => t.trim()).filter(Boolean);
      const updated: MediaItem = {
        ...selectedItem,
        tags,
      };
      onUpdate(updated);
      setSelectedId(updated.id);
    },
    [onUpdate, selectedItem]
  );

  // Dashboard statistics
  const stats = useMemo(() => {
    const allItems = [...photos, ...videos];
    const totalViews = allItems.reduce((sum, item) => sum + (item.views || 0), 0);
    const avgViews = allItems.length > 0 ? Math.round(totalViews / allItems.length) : 0;
    
    const categories = new Set(allItems.map(item => item.category));
    const allTags = new Set<string>();
    allItems.forEach(item => {
      item.tags?.forEach(tag => allTags.add(tag));
    });

    // Top 10 most viewed items
    const topViewed = [...allItems]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);

    // Category breakdown
    const categoryStats = Array.from(categories).map(cat => {
      const items = allItems.filter(item => item.category === cat);
      const views = items.reduce((sum, item) => sum + (item.views || 0), 0);
      return {
        name: cat,
        count: items.length,
        videos: items.filter(i => i.type === 'video').length,
        photos: items.filter(i => i.type === 'photo').length,
        views,
      };
    }).sort((a, b) => b.count - a.count);

    return {
      totalVideos: videos.length,
      totalPhotos: photos.length,
      totalCategories: categories.size,
      totalTags: allTags.size,
      totalViews,
      avgViews,
      topViewed,
      categoryStats,
    };
  }, [photos, videos]);

  return (
    <div className="p-6 text-white">
      {/* Tab switcher */}
      <div className="flex items-center gap-3 mb-6">
        <div className="inline-flex rounded-lg bg-white/5 p-1">
          <button
            onClick={() => setTab('dashboard')}
            className={`px-6 py-2 rounded-md font-semibold transition-colors ${
              tab === 'dashboard' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setTab('editor')}
            className={`px-6 py-2 rounded-md font-semibold transition-colors ${
              tab === 'editor' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            ✏️ Editor
          </button>
        </div>
      </div>

      {/* Dashboard Tab */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Videos</span>
                <span className="text-2xl">🎬</span>
              </div>
              <div className="text-3xl font-bold">{stats.totalVideos}</div>
              <div className="text-xs text-gray-400 mt-1">
                {stats.totalViews > 0 && `${Math.round((videos.reduce((sum, v) => sum + (v.views || 0), 0) / stats.totalViews) * 100)}% tổng views`}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Photos</span>
                <span className="text-2xl">📸</span>
              </div>
              <div className="text-3xl font-bold">{stats.totalPhotos}</div>
              <div className="text-xs text-gray-400 mt-1">
                {stats.totalViews > 0 && `${Math.round((photos.reduce((sum, p) => sum + (p.views || 0), 0) / stats.totalViews) * 100)}% tổng views`}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Categories</span>
                <span className="text-2xl">📁</span>
              </div>
              <div className="text-3xl font-bold">{stats.totalCategories}</div>
              <div className="text-xs text-gray-400 mt-1">
                {Math.round((stats.totalVideos + stats.totalPhotos) / stats.totalCategories)} items/category
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Tags</span>
                <span className="text-2xl">🏷️</span>
              </div>
              <div className="text-3xl font-bold">{stats.totalTags}</div>
              <div className="text-xs text-gray-400 mt-1">Unique tags</div>
            </div>
          </div>

          {/* Views Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>👁️</span> Thống kê lượt xem
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                  <span className="text-gray-400">Tổng lượt xem</span>
                  <span className="text-2xl font-bold text-red-500">{stats.totalViews.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                  <span className="text-gray-400">Trung bình/item</span>
                  <span className="text-2xl font-bold text-blue-500">{stats.avgViews}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                  <span className="text-gray-400">Video views</span>
                  <span className="text-xl font-bold">
                    {videos.reduce((sum, v) => sum + (v.views || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                  <span className="text-gray-400">Photo views</span>
                  <span className="text-xl font-bold">
                    {photos.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Top 10 Most Viewed */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🏆</span> Top 10 xem nhiều nhất
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {stats.topViewed.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-white/10 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {item.category} • {item.type === 'video' ? '🎬' : '📸'}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="font-bold text-red-500">{(item.views || 0).toLocaleString()}</div>
                      <div className="text-xs text-gray-400">views</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📊</span> Phân tích theo danh mục
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Danh mục</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Tổng</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Videos</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Photos</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.categoryStats.map((cat) => (
                    <tr key={cat.name} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 font-medium">{cat.name}</td>
                      <td className="py-3 px-4 text-center font-bold">{cat.count}</td>
                      <td className="py-3 px-4 text-center text-red-400">{cat.videos}</td>
                      <td className="py-3 px-4 text-center text-blue-400">{cat.photos}</td>
                      <td className="py-3 px-4 text-center font-semibold">{cat.views.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Editor Tab */}
      {tab === 'editor' && (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="inline-flex rounded-lg bg-white/5 p-1">
          <button
            onClick={() => setMode('video')}
            className={`px-4 py-2 rounded-md ${mode === 'video' ? 'bg-red-600 text-white' : 'text-gray-300'}`}
          >
            Videos
          </button>
          <button
            onClick={() => setMode('photo')}
            className={`px-4 py-2 rounded-md ${mode === 'photo' ? 'bg-red-600 text-white' : 'text-gray-300'}`}
          >
            Photos
          </button>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, id, tag..."
          className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 focus:outline-none focus:border-red-500 min-w-[240px]"
        />

        <button
          onClick={onExport}
          className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:opacity-90"
        >
          Export JSON
        </button>

        <label className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10">
          Import JSON
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const text = await file.text();
                const data = JSON.parse(text);
                onImport(data);
              } catch {
                alert('Không thể đọc file JSON.');
              } finally {
                e.target.value = '';
              }
            }}
          />
        </label>

        <button
          onClick={async () => {
            if (saving) return;
            if (!confirm('⚠️ Lưu dữ liệu vào db.ts?\n\nFile backup sẽ được tạo tự động.\nServer backend phải đang chạy (port 3001).')) return;
            setSaving(true);
            try {
              await onSaveToDb();
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          className={`px-4 py-2 rounded-lg font-semibold transition-opacity ${
            saving 
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
              : 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90'
          }`}
        >
          {saving ? '⏳ Đang lưu...' : '💾 Lưu vào db.ts'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto divide-y divide-white/5">
            {list.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${
                  selectedId === item.id ? 'bg-red-600/30' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.type === 'video' && item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt="thumb"
                        className="w-16 h-10 object-cover rounded-md border border-white/10 flex-shrink-0"
                        loading="lazy"
                      />
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.title}</p>
                      <p className="text-xs text-gray-400 truncate">{item.category}</p>
                      {item.tags?.length ? (
                        <p className="text-xs text-gray-400 truncate">#{item.tags.join(' #')}</p>
                      ) : null}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{item.type}</span>
                </div>
              </button>
            ))}
            {list.length === 0 && (
              <div className="p-6 text-gray-400">Không có mục nào.</div>
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-3">Chỉnh sửa</h3>
          {!selectedItem && <p className="text-gray-400 text-sm">Chọn một mục để chỉnh sửa.</p>}
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">ID</label>
                <div className="px-3 py-2 bg-black/40 rounded-lg text-gray-400 text-sm break-all">{selectedItem.id}</div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Tiêu đề</label>
                <input
                  value={selectedItem.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Danh mục</label>
                <input
                  disabled
                  value={selectedItem.category}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Tags (phân tách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="cute, hot, dance"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-red-500"
                  autoComplete="off"
                />
              </div>

              {selectedItem.type === 'video' && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Thumbnail (URL hoặc data URL)</label>
                  <input
                    value={selectedItem.thumbnail || ''}
                    onChange={(e) => handleFieldChange('thumbnail', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-red-500"
                    placeholder="/thumbs/video.jpg hoặc data:image/png;base64,..."
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      disabled={thumbLoading}
                      onClick={async () => {
                        if (!selectedItem) return;
                        setThumbLoading(true);
                        try {
                          const video = document.createElement('video');
                          video.src = selectedItem.src;
                          video.crossOrigin = 'anonymous';
                          video.preload = 'auto';
                          video.muted = true;
                          // Wait for metadata to know video size
                          await new Promise<void>((resolve, reject) => {
                            const onMeta = () => resolve();
                            const onErr = () => reject(new Error('Không thể đọc video để tạo thumbnail.'));
                            video.addEventListener('loadedmetadata', onMeta, { once: true });
                            video.addEventListener('error', onErr, { once: true });
                          });
                          // Seek to 1s (or 0.1s if shorter)
                          const seekTime = Math.min(1, Math.max(0.1, video.duration ? 1 : 0.1));
                          await new Promise<void>((resolve) => {
                            video.currentTime = seekTime;
                            const onSeeked = () => resolve();
                            video.addEventListener('seeked', onSeeked, { once: true });
                          });
                          const canvas = document.createElement('canvas');
                          const vw = Math.max(1, video.videoWidth || 1280);
                          const vh = Math.max(1, video.videoHeight || 720);
                          const targetW = 640; // reasonable size
                          const targetH = Math.round((targetW / vw) * vh);
                          canvas.width = targetW;
                          canvas.height = targetH;
                          const ctx = canvas.getContext('2d');
                          if (!ctx) throw new Error('Canvas context không khả dụng.');
                          ctx.drawImage(video, 0, 0, targetW, targetH);
                          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                          handleFieldChange('thumbnail', dataUrl);
                        } catch (e: any) {
                          alert(e?.message || 'Tạo thumbnail thất bại.');
                        } finally {
                          setThumbLoading(false);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg ${thumbLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-white text-black hover:opacity-90'}`}
                    >
                      {thumbLoading ? 'Đang tạo...' : 'Generate thumbnail từ video'}
                    </button>
                  </div>
                  {selectedItem.thumbnail && (
                    <img
                      src={selectedItem.thumbnail}
                      alt="thumbnail preview"
                      className="mt-2 w-full rounded-lg border border-white/10"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default AdminPanel;
