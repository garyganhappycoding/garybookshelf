"use client";

import { useState } from "react";

export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-[4/3] rounded-xl bg-cream-100" />;
  }

  return (
    <div>
      <div className="aspect-[4/3] rounded-xl bg-cream-100 overflow-hidden mb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active]} alt={title} className="w-full h-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                i === active ? "border-clay-600" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}