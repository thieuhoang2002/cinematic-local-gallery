
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MediaItem } from '../types';
import LazyImage from './LazyImage';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface PhotoGalleryProps {
  photos: MediaItem[];
  onPhotoClick: (photo: MediaItem) => void;
}

const ITEMS_PER_PAGE = 50; // Giảm từ 640+ xuống 50 items/trang

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, onPhotoClick }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset về trang 1 khi photos array thay đổi (filter category)
  useEffect(() => {
    setCurrentPage(1);
  }, [photos]);

  const totalPages = Math.ceil(photos.length / ITEMS_PER_PAGE);
  
  const currentPhotos = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return photos.slice(startIndex, endIndex);
  }, [photos, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <p className="text-lg">No photos.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Pagination Info */}
      <div className="mb-4 text-sm text-gray-400 flex items-center justify-between">
        <span>
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, photos.length)} of {photos.length} photos
        </span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
        {currentPhotos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => onPhotoClick(photo)}
            className="group relative cursor-pointer overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <LazyImage
              key={photo.src}
              src={photo.src}
              alt={photo.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
              <h4 className="text-sm font-semibold text-white truncate">{photo.title}</h4>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{photo.date}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Eye className="w-3 h-3" />
                  <span>{photo.views || 0}</span>
                </div>
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

export default PhotoGallery;
