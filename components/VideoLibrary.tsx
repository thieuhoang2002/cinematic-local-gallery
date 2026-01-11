
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { MediaItem } from '../types';
import VideoThumbnail from './VideoThumbnail';

interface VideoLibraryProps {
  videos: MediaItem[];
  onVideoClick: (video: MediaItem) => void;
}

const ITEMS_PER_PAGE = 24; // Giảm từ 246 xuống 24 videos/trang

const VideoLibrary: React.FC<VideoLibraryProps> = ({ videos, onVideoClick }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset về trang 1 khi videos array thay đổi (filter category)
  useEffect(() => {
    setCurrentPage(1);
  }, [videos]);

  const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE);
  
  const currentVideos = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return videos.slice(startIndex, endIndex);
  }, [videos, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <p className="text-lg">No videos.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Pagination Info */}
      <div className="mb-4 text-sm text-gray-400 flex items-center justify-between">
        <span>
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, videos.length)} of {videos.length} videos
        </span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {currentVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => onVideoClick(video)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-video overflow-hidden rounded-xl bg-white/5 mb-3 transition-transform duration-300 group-hover:scale-[1.02]">
              <VideoThumbnail
                key={video.src}
                src={video.src}
                thumbnailUrl={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                  <Play className="text-white w-6 h-6 fill-current ml-0.5" />
                </div>
              </div>
            </div>

            <h4 className="text-base font-semibold text-white group-hover:text-red-500 transition-colors mb-1 truncate">
              {video.title}
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{video.date}</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Eye className="w-3.5 h-3.5" />
                <span>{video.views || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex gap-2">
            {/* First page */}
            {currentPage > 3 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                >
                  1
                </button>
                {currentPage > 4 && <span className="px-2 py-2 text-gray-500">...</span>}
              </>
            )}

            {/* Pages around current */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => Math.abs(page - currentPage) <= 2)
              .map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-red-600 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  {page}
                </button>
              ))}

            {/* Last page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="px-2 py-2 text-gray-500">...</span>}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoLibrary;
