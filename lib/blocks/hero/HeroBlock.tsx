import Image from "next/image";
import type { AllBlockProps } from "../types";

export function HeroBlock(props: AllBlockProps["HeroBlock"]) {
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
      <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading, Montserrat, sans-serif)' }}>{props.headline}</h1>
      <p className="text-xl text-[var(--color-muted,#cbd5e1)] mb-6">{props.subheadline}</p>
      <a
        href={props.ctaHref}
        className="inline-block text-white font-semibold px-6 py-3 transition rounded-lg"
        style={{ backgroundColor: 'var(--color-primary, #6366f1)' }}
      >
        {props.ctaLabel}
      </a>
    </div>
  );
}

export const heroBlockFields = {
  headline: { type: "text" as const, label: "Headline" },
  subheadline: { type: "text" as const, label: "Subheadline" },
  ctaLabel: { type: "text" as const, label: "CTA Label" },
  ctaHref: { type: "text" as const, label: "CTA Link" },
  bgImage: { type: "text" as const, label: "Background Image URL" },
  bgColor: { type: "text" as const, label: "Background Color (optional)" },
};

export const heroBlockDefaultProps = {
  headline: "Your Headline Here",
  subheadline: "Your subheadline text goes here",
  ctaLabel: "Get Started",
  ctaHref: "#",
  bgImage: undefined,
  bgColor: undefined,
};

