'use client';

import React, { useState } from 'react';
import { Camera } from 'lucide-react';

interface CarImageGalleryProps {
  images: string[];
  title: string;
}

export default function CarImageGallery({ images, title }: CarImageGalleryProps) {
  const imageList = images && images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&auto=format&fit=crop&q=80'];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  return (
    <div className="space-y-3">
      {/* Main Image View */}
      <div className="relative aspect-[16/10] w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <img
          src={imageList[activeImageIndex]}
          alt={`${title} - Photo ${activeImageIndex + 1}`}
          className="h-full w-full object-cover object-center transition-all duration-300"
        />
        
        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow">
          <Camera className="h-3.5 w-3.5 text-nyasa-500" />
          <span>
            {activeImageIndex + 1} of {imageList.length}
          </span>
        </div>
      </div>

      {/* Thumbnails strip */}
      {imageList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {imageList.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImageIndex(idx)}
              className={`relative h-20 w-28 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                idx === activeImageIndex
                  ? 'border-nyasa-700 ring-2 ring-nyasa-700/30 scale-95'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
