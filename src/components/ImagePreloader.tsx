import React from 'react';
import { getPageImageUrl } from '../lib/imageUtils';

interface ImagePreloaderProps {
  currentPage: number;
  riwaya: any;
}

export default function ImagePreloader({ currentPage, riwaya }: ImagePreloaderProps) {
  // Preload next 3 pages and previous 2 pages
  const preloadPages = [
    currentPage + 1, currentPage + 2, currentPage + 3,
    currentPage - 1, currentPage - 2
  ].filter(p => p >= 1 && p <= 604);

  return (
    <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', visibility: 'hidden' }} aria-hidden="true">
      {preloadPages.map(p => (
        <img
          key={`preload-${riwaya.id}-${p}`}
          src={getPageImageUrl(p, riwaya)}
          alt=""
          decoding="async"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ))}
    </div>
  );
}
