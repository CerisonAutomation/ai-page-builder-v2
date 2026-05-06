'use client'

import Image from "next/image";
import { useState } from "react";
import { ImagePicker } from "@/components/media/ImagePicker";
import type { AllBlockProps } from "../types";

const gridColsMap = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
} as const;

const gapMap = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
  12: "gap-12",
  16: "gap-16",
} as const;

export function GalleryBlockClient(props: AllBlockProps["GalleryBlock"]) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const colsClass =
    gridColsMap[Math.min(props.columns ?? 3, 6) as keyof typeof gridColsMap] ||
    "grid-cols-3";
  const gapClass =
    gapMap[Math.min(props.gap ?? 4, 16) as keyof typeof gapMap] || "gap-4";

  const handleImageSelect = (image: { url: string; alt?: string }) => {
    if (selectedIndex !== null) {
      // Update image at index
      console.log("Update image at index", selectedIndex, image);
    }
    setShowPicker(false);
    setSelectedIndex(null);
  };

  return (
    <div className="w-full py-16 px-4">
      <div className={`grid ${colsClass} ${gapClass}`}>
        {props.images.map((img, i) => (
          <div key={i} className="relative group">
            <Image
              src={img}
              alt={`Gallery image ${i + 1}`}
              width={400}
              height={256}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              onClick={() => {
                setSelectedIndex(i);
                setShowPicker(true);
              }}
              className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100"
            >
              <span className="text-white text-sm font-medium">Change Image</span>
            </button>
          </div>
        ))}
      </div>

      {showPicker && (
        <ImagePicker
          onSelect={handleImageSelect}
          onClose={() => {
            setShowPicker(false);
            setSelectedIndex(null);
          }}
        />
      )}
    </div>
  );
}
