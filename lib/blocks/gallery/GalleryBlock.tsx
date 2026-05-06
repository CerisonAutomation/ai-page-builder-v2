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

export function GalleryBlock(props: AllBlockProps["GalleryBlock"]) {
  const colsClass =
    gridColsMap[Math.min(props.columns ?? 3, 6) as keyof typeof gridColsMap] ||
    "grid-cols-3";
  const gapClass =
    gapMap[Math.min(props.gap ?? 4, 16) as keyof typeof gapMap] || "gap-4";

  return (
    <div className="w-full py-16 px-4">
      <div className={`grid ${colsClass} ${gapClass}`}>
        {props.images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Gallery image ${i + 1}`}
            className="w-full h-64 object-cover rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
