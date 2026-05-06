import Image from "next/image";
import type { AllBlockProps } from "../types";

export function HeroBlock(props: AllBlockProps["HeroBlock"]) {
  const bgStyle: React.CSSProperties = props.bgColor
    ? { backgroundColor: props.bgColor }
    : { backgroundImage: "linear-gradient(to right, #1e293b, #0f172a)" };

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
      <h1 className="text-4xl font-bold mb-2">{props.headline}</h1>
      <p className="text-xl text-slate-300 mb-6">{props.subheadline}</p>
      <a
        href={props.ctaHref}
        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition"
      >
        {props.ctaLabel}
      </a>
    </div>
  );
}
