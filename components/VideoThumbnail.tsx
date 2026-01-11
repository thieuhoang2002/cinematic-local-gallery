import React, { useRef, useEffect, useState } from 'react';
import { getVideoSrc } from '../utils/mediaUrl';

interface VideoThumbnailProps {
  src: string; // video src (fallback generation)
  thumbnailUrl?: string; // pre-generated thumbnail URL
  alt: string;
  className?: string;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ src, thumbnailUrl, alt, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [thumbnail, setThumbnail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldGenerate, setShouldGenerate] = useState(false);
  const [hasError, setHasError] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // If pre-generated thumbnail provided, use it directly for instant display
  useEffect(() => {
    if (thumbnailUrl) {
      setThumbnail(thumbnailUrl);
    }
  }, [thumbnailUrl]);

  // Use Intersection Observer to only generate thumbnail when visible
  useEffect(() => {
    if (thumbnailUrl) return; // no need to observe if we already have image
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setShouldGenerate(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '300px' } // Tăng từ 50px lên 300px để load sớm hơn
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Generate thumbnail only when needed
  useEffect(() => {
    if (thumbnailUrl) return; // already have image
    if (!shouldGenerate) return;

    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setHasError(false);
    
    // Set a timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.warn('Thumbnail generation timeout for:', src);
        setIsLoading(false);
        setHasError(true);
      }
    }, 5000); // 5 second timeout

    const handleLoadedData = () => {
      // Seek to 0.5s instead of 1s for faster loading
      video.currentTime = Math.min(0.5, video.duration * 0.1);
    };

    const handleSeeked = () => {
      try {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        const canvas = document.createElement('canvas');
        // Giảm kích thước để tăng performance
        const maxWidth = 480; // Giảm từ 640 xuống 480
        const scale = Math.min(1, maxWidth / video.videoWidth);
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          // Giảm quality từ 0.5 xuống 0.4 để file nhỏ hơn
          const dataUrl = canvas.toDataURL('image/jpeg', 0.4);
          setThumbnail(dataUrl);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error generating thumbnail:', error, 'for video:', src);
        setIsLoading(false);
        setHasError(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    };

    const handleError = (e: any) => {
      console.error('Error loading video:', src, 'Error:', e.target.error?.message);
      setIsLoading(false);
      setHasError(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [shouldGenerate, src]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <video
        ref={videoRef}
        className="hidden"
        preload="metadata"
        muted
        playsInline
      >
        {shouldGenerate && <source src={getVideoSrc(src)} type={src.toLowerCase().endsWith('.mov') ? 'video/quicktime' : src.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4'} />}
      </video>
      {thumbnail ? (
        <img
          src={getImageSrc(thumbnail)}
          alt={alt}
          className={className}
        />
      ) : (
        <div className={`${className} flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900`}>
          {isLoading && !hasError ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-red-600/50 border-t-red-600"></div>
          ) : hasError ? (
            <div className="text-gray-500 text-xs text-center px-2">⚠️ Video unavailable</div>
          ) : (
            <div className="text-gray-600 text-xs">🎬</div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoThumbnail;
