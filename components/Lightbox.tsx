
import React, { useEffect, useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Eye } from 'lucide-react';
import { MediaItem } from '../types';
import { getImageSrc } from '../utils/mediaUrl';

interface LightboxProps {
  photo: MediaItem;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ photo, onClose, onNext, onPrev }) => {
  const [zoom, setZoom] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === '+' || e.key === '=') setZoom(prev => Math.min(prev + 0.25, 3));
    if (e.key === '-') setZoom(prev => Math.max(prev - 0.25, 0.5));
    if (e.key === '0') setZoom(1);
  }, [onClose, onNext, onPrev]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => {
      const newZoom = Math.max(0.5, Math.min(3, prev + delta));
      if (newZoom === 1) {
        setPan({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    // Reset pan when photo changes
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, [photo.id]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown, handleWheel]);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black flex flex-col"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Top Bar */}
      <div 
        className={`h-14 bg-[#0f0f0f] border-b border-white/10 flex items-center justify-between px-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="border-l border-white/10 h-6 mx-2"></div>
          <div>
            <h3 className="text-sm font-semibold text-white">{photo.title}</h3>
            <div className="flex items-center gap-3">
              <p className="text-xs text-gray-400">{photo.date}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Eye className="w-3 h-3" />
                <span>{photo.views || 0} lượt xem</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-5 h-5 text-white" />
          </button>
          <span className="text-sm text-white font-medium min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={zoom >= 3}
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={resetZoom}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-2"
            title="Reset zoom (press 0)"
          >
            <Maximize2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div 
        className="flex-1 relative overflow-hidden flex items-center justify-center p-4 bg-black"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={getImageSrc(photo.src)}
          alt={photo.title}
          className="max-w-full max-h-full object-contain transition-transform duration-200 select-none z-10"
          style={{ 
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          onClick={zoom > 1 ? undefined : resetZoom}
          draggable={false}
          onError={(e) => console.error('Image load error:', photo.src, e)}
          onLoad={() => console.log('Image loaded successfully:', photo.src)}
        />

        {/* Navigation Buttons */}
        <button
          onClick={onPrev}
          className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all backdrop-blur-sm ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={onNext}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all backdrop-blur-sm ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Info */}
      <div 
        className={`h-12 bg-[#0f0f0f] border-t border-white/10 flex items-center justify-center transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="text-xs text-gray-400 flex items-center gap-4">
          <span>Press <kbd className="px-2 py-1 bg-white/10 rounded text-white">ESC</kbd> to exit</span>
          <span>•</span>
          <span><kbd className="px-2 py-1 bg-white/10 rounded text-white">←</kbd> <kbd className="px-2 py-1 bg-white/10 rounded text-white">→</kbd> to navigate</span>
          <span>•</span>
          <span><kbd className="px-2 py-1 bg-white/10 rounded text-white">Scroll</kbd> to zoom • Drag to pan</span>
        </div>
      </div>
    </div>
  );
};

export default Lightbox;
