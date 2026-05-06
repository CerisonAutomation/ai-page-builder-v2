import type { AllBlockProps } from "../types";

export function HeroBlock(props: AllBlockProps["HeroBlock"]) {
  // ✅ P1-7: Build background style from props
  const bgStyle: React.CSSProperties = {};
  if (props.bgImage) {
    bgStyle.backgroundImage = `url(${props.bgImage})`;
    bgStyle.backgroundSize = "cover";
    bgStyle.backgroundPosition = "center";
  } else if (props.bgColor) {
    bgStyle.backgroundColor = props.bgColor;
  } else {
    bgStyle.backgroundImage = "linear-gradient(to right, #1e293b, #0f172a)";
  }

  return (
    <div className="w-full text-white py-24 px-4" style={bgStyle}>
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
