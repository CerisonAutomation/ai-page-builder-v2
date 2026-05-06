"use client";

import Image from "next/image";
import type { AllBlockProps } from "../types";

const gridColsMap: Record<number, string> = {
  1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3",
  4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6",
};

export function LogoGalleryBlock(props: AllBlockProps["LogoGalleryBlock"]) {
  const cols = Math.min(props.columns || 4, 6);
  const colsClass = gridColsMap[cols] || "grid-cols-4";

  return (
    <div className="w-full py-12 px-4">
      <div className={`grid ${colsClass} gap-8 items-center justify-items-center`}>
        {props.logos.map((logo, i) => (
          <div
            key={i}
            className={`relative h-16 w-full max-w-[160px] ${props.grayscale ? "grayscale" : ""} hover:grayscale-0 transition`}
          >
            <Image
              src={logo.image || "/placeholders/logo-placeholder.svg"}
              alt={logo.alt}
              fill
              sizes="160px"
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
