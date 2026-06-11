/**
 * Transforms Cloudinary image URLs to use dynamic optimization parameters (auto format, auto quality, width scaling).
 * If the URL is not a Cloudinary URL, it is returned unchanged.
 */
export const getOptimizedImageUrl = (url: string | undefined | null, width = 600): string => {
  if (!url) return '/logo.png';
  if (!url.includes('cloudinary.com')) return url;
  
  // Replace the default "/upload/" path with optimization flags
  // f_auto: automatic format selection (WebP, AVIF, etc.)
  // q_auto: automatic quality compression
  // c_limit: limit size to requested width while preserving aspect ratio
  // w_{width}: resize to the specified width
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);
};
