import type { AllBlockProps } from "../types";

export function CTABlock(props: AllBlockProps["CTABlock"]) {
  return (
    <div className="w-full text-white py-16 px-4 text-center" style={{ backgroundColor: 'var(--color-primary, #6366f1)' }}>
      <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading, Montserrat, sans-serif)' }}>{props.headline}</h2>
      <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--color-background, #e0e7ff)' }}>
        {props.body}
      </p>
      <div className="flex gap-4 justify-center">
        <a
          href={props.primaryHref}
          className="font-bold px-6 py-3 rounded-lg"
          style={{ backgroundColor: 'var(--color-bg, #ffffff)', color: 'var(--color-primary, #6366f1)' }}
        >
          {props.primaryCta}
        </a>
        {props.secondaryCta && props.secondaryHref && (
          <a
            href={props.secondaryHref}
            className="border font-bold px-6 py-3 rounded-lg"
            style={{ borderColor: 'var(--color-bg, #ffffff)', color: 'var(--color-bg, #ffffff)' }}
          >
            {props.secondaryCta}
          </a>
        )}
      </div>
    </div>
  );
}
