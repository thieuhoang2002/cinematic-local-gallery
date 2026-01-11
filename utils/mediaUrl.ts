/**
 * Encode media URL to handle special characters and spaces
 * Splits path into segments and encodes each segment individually
 */
export function encodeMediaUrl(url: string): string {
  if (!url) return url;
  
  // Split by '/' to preserve path structure
  const parts = url.split('/');
  
  // Encode each part except empty ones (from leading /)
  const encodedParts = parts.map(part => {
    if (!part) return part;
    // encodeURIComponent handles all special chars including spaces, Vietnamese chars, etc.
    return encodeURIComponent(part);
  });
  
  return encodedParts.join('/');
}

/**
 * Get proper video source URL
 */
export function getVideoSrc(src: string): string {
  // Already absolute URL or data URL
  if (src.startsWith('http') || src.startsWith('data:')) {
    return src;
  }
  // Prefix with Vite base URL for GitHub Pages and encode
  const base = (import.meta as any).env?.BASE_URL ?? '/';
  const path = src.startsWith('/') ? src.slice(1) : src;
  return encodeMediaUrl(base + path);
}

/**
 * Get proper image source URL
 */
export function getImageSrc(src: string): string {
  // Already absolute URL or data URL
  if (src.startsWith('http') || src.startsWith('data:')) {
    return src;
  }
  // Prefix with Vite base URL for GitHub Pages and encode
  const base = (import.meta as any).env?.BASE_URL ?? '/';
  const path = src.startsWith('/') ? src.slice(1) : src;
  return encodeMediaUrl(base + path);
}
