import type { AllBlockProps } from "../types";

export function CTABlock(props: AllBlockProps["CTABlock"]) {
  return (
    <div className="w-full bg-indigo-600 text-white py-16 px-4 text-center">
      <h2 className="text-3xl font-bold mb-4">{props.headline}</h2>
      <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
        {props.body}
      </p>
      <div className="flex gap-4 justify-center">
        <a
          href={props.primaryHref}
          className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-lg hover:bg-indigo-50"
        >
          {props.primaryCta}
        </a>
        {props.secondaryCta && props.secondaryHref && (
          <a
            href={props.secondaryHref}
            className="border border-white text-white font-bold px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            {props.secondaryCta}
          </a>
        )}
      </div>
    </div>
  );
}
