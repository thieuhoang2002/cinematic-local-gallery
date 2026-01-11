
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PhotoGallery from './components/PhotoGallery';
import VideoLibrary from './components/VideoLibrary';
import Lightbox from './components/Lightbox';
import VideoOverlay from './components/VideoOverlay';
import AdminPanel from './components/AdminPanel';
import { photos, videos } from './data/db';
import { MediaItem, MediaCategory, SortOption } from './types';

// Ensure videos point to generated JPG thumbnails under /thumbs if their thumbnail is missing or still set to the video file.
const withGeneratedThumbnail = (item: MediaItem): MediaItem => {
  if (item.type !== 'video') return item;
  const thumb = item.thumbnail || '';
  const hasImageThumb = thumb && !thumb.toLowerCase().match(/\.(mp4|mov|m4v|avi|mkv|webm)$/);
  if (hasImageThumb) return item;
  const srcPath = thumb || item.src;
  let jpgPath = srcPath.replace(/\.(mp4|mov|m4v|avi|mkv|webm)$/i, '.jpg');
  if (/^\/video\//i.test(srcPath)) {
    jpgPath = jpgPath.replace(/^\/video/i, '/thumbs');
  } else if (/^\/image\//i.test(srcPath)) {
    jpgPath = jpgPath.replace(/^\/image/i, '/thumbs/image');
  }
  return { ...item, thumbnail: jpgPath };
};

const applyThumbs = (list: MediaItem[]) => list.map(withGeneratedThumbnail);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'photos' | 'videos' | 'admin'>('videos');
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('alphabet-asc');
  const [selectedPhoto, setSelectedPhoto] = useState<MediaItem | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);
  const [photoData, setPhotoData] = useState<MediaItem[]>(photos as unknown as MediaItem[]);
  const [videoData, setVideoData] = useState<MediaItem[]>(applyThumbs(videos as unknown as MediaItem[]));
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveToDbRef = useRef<((silent?: boolean) => Promise<void>) | null>(null);
  
  // Listen for openVideo events from suggested videos
  useEffect(() => {
    const handleOpenVideo = (event: Event) => {
      const customEvent = event as CustomEvent<MediaItem>;
      if (customEvent.detail) {
        setSelectedVideo(customEvent.detail);
      }
    };
    
    window.addEventListener('openVideo', handleOpenVideo);
    return () => window.removeEventListener('openVideo', handleOpenVideo);
  }, []);
  
  // Load from localStorage on first mount
  useEffect(() => {
    try {
      const savedPhotos = localStorage.getItem('media.photos');
      const savedVideos = localStorage.getItem('media.videos');
      if (savedPhotos) {
        const parsed = JSON.parse(savedPhotos) as MediaItem[];
        if (Array.isArray(parsed)) setPhotoData(parsed);
      }
      if (savedVideos) {
        const parsed = JSON.parse(savedVideos) as MediaItem[];
        if (Array.isArray(parsed)) setVideoData(applyThumbs(parsed));
      }
    } catch {}
  }, []);

  // Persist to localStorage when data changes
  useEffect(() => {
    try {
      localStorage.setItem('media.photos', JSON.stringify(photoData));
      localStorage.setItem('media.videos', JSON.stringify(videoData));
    } catch {}
  }, [photoData, videoData]);

  // Auto-save to db.ts every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      saveToDbRef.current?.(true); // silent save
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Save when closing tab/window
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Try to save (might not complete before page closes)
      saveToDbRef.current?.(true);
      // Don't show confirmation dialog
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);


  const pool = useMemo(() => {
    if (currentView === 'photos') return photoData;
    if (currentView === 'videos') return videoData;
    return [];
  }, [currentView, photoData, videoData]);

  const availableCategories = useMemo(() => {
    const uniqueCategories = new Set(pool.map(item => item.category));
    const categories: MediaCategory[] = ['All', ...Array.from(uniqueCategories).sort() as MediaCategory[]];
    return categories;
  }, [pool]);

  const categoryFiltered = useMemo(() => {
    if (selectedCategory === 'All') return pool;
    return pool.filter(item => item.category === selectedCategory);
  }, [pool, selectedCategory]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    categoryFiltered.forEach(item => {
      item.tags?.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [categoryFiltered]);

  const tagFiltered = useMemo(() => {
    if (selectedTag === 'All') return categoryFiltered;
    return categoryFiltered.filter(item => item.tags?.includes(selectedTag));
  }, [categoryFiltered, selectedTag]);

  // Apply sorting
  const currentMedia = useMemo(() => {
    const items = [...tagFiltered];
    
    switch (sortBy) {
      case 'alphabet-asc':
        return items.sort((a, b) => a.title.localeCompare(b.title));
      
      case 'alphabet-desc':
        return items.sort((a, b) => b.title.localeCompare(a.title));
      
      case 'date-desc':
        return items.sort((a, b) => {
          const dateA = new Date(a.date || '2000-01-01').getTime();
          const dateB = new Date(b.date || '2000-01-01').getTime();
          return dateB - dateA;
        });
      
      case 'date-asc':
        return items.sort((a, b) => {
          const dateA = new Date(a.date || '2000-01-01').getTime();
          const dateB = new Date(b.date || '2000-01-01').getTime();
          return dateA - dateB;
        });
      
      case 'views-desc':
        return items.sort((a, b) => (b.views || 0) - (a.views || 0));
      
      case 'views-asc':
        return items.sort((a, b) => (a.views || 0) - (b.views || 0));
      
      default:
        return items;
    }
  }, [tagFiltered, sortBy]);

  const handleViewChange = useCallback((view: 'photos' | 'videos' | 'admin') => {
    setCurrentView(view);
    setSelectedCategory('All');
    setSelectedTag('All');
  }, []);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort);
  }, []);

  const handleCategoryChange = useCallback((category: MediaCategory) => {
    setSelectedCategory(category);
    setSelectedTag('All');
  }, []);

  const handleTagChange = useCallback((tag: string) => {
    setSelectedTag(tag);
  }, []);

  const handlePhotoClick = useCallback((photo: MediaItem) => {
    // Increment view count
    setPhotoData(prev => prev.map(item => 
      item.id === photo.id ? { ...item, views: (item.views || 0) + 1 } : item
    ));
    setSelectedPhoto({ ...photo, views: (photo.views || 0) + 1 });
  }, []);

  const handleVideoClick = useCallback((video: MediaItem) => {
    // Increment view count
    setVideoData(prev => prev.map(item => 
      item.id === video.id ? { ...item, views: (item.views || 0) + 1 } : item
    ));
    setSelectedVideo({ ...video, views: (video.views || 0) + 1 });
  }, []);

  const handlePhotoNav = useCallback((direction: 'next' | 'prev') => {
    if (!selectedPhoto) return;
    const filteredPhotos = currentMedia as MediaItem[];
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % filteredPhotos.length;
    } else {
      nextIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    }
    setSelectedPhoto(filteredPhotos[nextIndex]);
  }, [selectedPhoto, currentMedia]);

  const closePhoto = useCallback(() => setSelectedPhoto(null), []);
  const closeVideo = useCallback(() => setSelectedVideo(null), []);

  const handleUpdateMedia = useCallback((updated: MediaItem) => {
    if (updated.type === 'photo') {
      setPhotoData(prev => prev.map(item => item.id === updated.id ? updated : item));
    } else {
      setVideoData(prev => prev.map(item => item.id === updated.id ? updated : item));
    }
  }, []);

  const handleExport = useCallback(() => {
    const payload = { photos: photoData, videos: videoData };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'media-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [photoData, videoData]);

  const handleImport = useCallback((payload: { photos?: MediaItem[]; videos?: MediaItem[] }) => {
    if (payload.photos && Array.isArray(payload.photos)) {
      setPhotoData(payload.photos);
    }
    if (payload.videos && Array.isArray(payload.videos)) {
      setVideoData(applyThumbs(payload.videos));
    }
  }, []);

  const handleSaveToDb = useCallback(async (silent = false) => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:3001/api/save-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: photoData, videos: videoData }),
      });
      const result = await response.json();
      if (result.success) {
        setLastSaveTime(new Date());
        if (!silent) {
          alert(`✅ Lưu thành công!\n\n📸 ${result.photosCount} ảnh\n🎬 ${result.videosCount} videos\n\n📦 Backup: ${result.backup}`);
        }
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error: any) {
      if (!silent) {
        alert(`❌ Lỗi khi lưu vào db.ts:\n\n${error.message}\n\n⚠️ Đảm bảo backend server đang chạy:\nnode server.cjs`);
      }
      console.error('Auto-save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [photoData, videoData, isSaving]);

  // Update ref when handleSaveToDb changes
  useEffect(() => {
    saveToDbRef.current = handleSaveToDb;
  }, [handleSaveToDb]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      <main className="pt-16 min-h-screen">
        <Header 
          itemCount={currentMedia.length}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          availableCategories={availableCategories}
          selectedTag={selectedTag}
          onTagChange={handleTagChange}
          availableTags={availableTags}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />

        {currentView === 'admin' ? (
          <AdminPanel
            photos={photoData}
            videos={videoData}
            onUpdate={handleUpdateMedia}
            onExport={handleExport}
            onImport={handleImport}
            onSaveToDb={handleSaveToDb}
          />
        ) : currentView === 'photos' ? (
          <PhotoGallery
            photos={currentMedia}
            onPhotoClick={handlePhotoClick}
          />
        ) : (
          <VideoLibrary
            videos={currentMedia}
            onVideoClick={handleVideoClick}
          />
        )}
      </main>

      {selectedPhoto && (
        <Lightbox
          photo={selectedPhoto}
          onClose={closePhoto}
          onNext={() => handlePhotoNav('next')}
          onPrev={() => handlePhotoNav('prev')}
        />
      )}

      {selectedVideo && (
        <VideoOverlay
          video={selectedVideo}
          onClose={closeVideo}
          allVideos={videoData}
        />
      )}

      {/* Auto-save Status Indicator */}
      {(isSaving || lastSaveTime) && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 shadow-xl">
          <div className="flex items-center gap-2 text-sm text-white">
            {isSaving ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Đang lưu...</span>
              </>
            ) : lastSaveTime ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Đã lưu lúc {lastSaveTime.toLocaleTimeString('vi-VN')}</span>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
