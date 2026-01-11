import React, { useState, useEffect, useRef } from 'react';
import { getImageSrc } from '../utils/mediaUrl';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className = '',
  aspectRatio = 'aspect-square'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Reset state khi src thay đổi
  useEffect(() => {
    setIsLoaded(false);
    setIsInView(false);
  }, [src]);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Load images 200px before they enter viewport
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src]); // Thêm src vào dependency

  return (
    <div ref={imgRef} className={`${aspectRatio} bg-white/5 overflow-hidden`}>
      {isInView ? (
        <>
          {!isLoaded && (
            <div className="w-full h-full flex items-center justify-center bg-white/5">
              <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={getImageSrc(src)}
            alt={alt}
            className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
          />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-white/5">
          <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
