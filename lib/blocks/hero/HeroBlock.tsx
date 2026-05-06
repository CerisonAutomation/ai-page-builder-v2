import type { AllBlockProps } from "../types";

export function HeroBlock(props: AllBlockProps["HeroBlock"]) {
  return (
    <div className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-24 px-4">
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
