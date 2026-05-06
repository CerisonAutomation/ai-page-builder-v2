'use client'

import Image from "next/image";
import { useState } from "react";
import { ImagePicker } from "@/components/media/ImagePicker";
import type { AllBlockProps } from "../types";

export function HeroBlockClient(props: AllBlockProps["HeroBlock"]) {
  const [showPicker, setShowPicker] = useState(false);

  const bgStyle: React.CSSProperties = props.bgColor
    ? { backgroundColor: props.bgColor }
    : { backgroundImage: "linear-gradient(to right, var(--color-text, #1e293b), var(--color-foreground, #0f172a))" };

  return (
    <div className="relative w-full text-white py-24 px-4">
      {props.bgImage ? (
        <Image
          src={props.bgImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover -z-10"
        />
      ) : (
        <div className="absolute inset-0 -z-10" style={bgStyle} />
      )}
      <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading, Montserrat, sans-serif)' }}>
        {props.headline}
      </h1>
      <p className="text-xl text-[var(--color-muted,#cbd5e1)] mb-6">{props.subheadline}</p>
      <a
        href={props.ctaHref}
        className="inline-block text-white font-semibold px-6 py-3 transition rounded-lg"
        style={{ backgroundColor: 'var(--color-primary, #6366f1)' }}
      >
        {props.ctaLabel}
      </a>

      {showPicker && (
        <ImagePicker
          onSelect={(image) => {
            // In a real implementation, this would update the block's bgImage prop
            console.log("Selected image:", image);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
