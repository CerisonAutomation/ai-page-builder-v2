"use client";

import Image from "next/image";
import type { AllBlockProps } from "../types";

export function HeroVideoBlock(props: AllBlockProps["HeroVideoBlock"]) {
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}?autoplay=${props.autoplay ? 1 : 0}&loop=${props.loop ? 1 : 0}&mute=${props.muted ? 1 : 0}`;
    }
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}?autoplay=${props.autoplay ? 1 : 0}&loop=${props.loop ? 1 : 0}&muted=${props.muted ? 1 : 0}`;
    }
    return url;
  };

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {props.videoUrl ? (
        <iframe
          src={getEmbedUrl(props.videoUrl)}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--color-muted,#64748b)] flex items-center justify-center">
          <p className="text-white">No video URL provided</p>
        </div>
      )}
      {(props.headline || props.subheadline) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white bg-black/40 px-4">
          {props.headline && <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading, Montserrat, sans-serif)' }}>{props.headline}</h1>}
          {props.subheadline && <p className="text-xl md:text-2xl">{props.subheadline}</p>}
        </div>
      )}
      {!props.videoUrl && props.fallbackImage && (
        <Image
          src={props.fallbackImage}
          alt="Fallback"
          fill
          sizes="100vw"
          className="object-cover"
        />
      )}
    </div>
  );
}
