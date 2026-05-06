import type { AllBlockProps } from "../types";

export function FAQBlock(props: AllBlockProps["FAQBlock"]) {
  return (
    <div className="w-full py-16 px-4 max-w-3xl mx-auto">
      {props.title && (
        <h2 className="text-3xl font-bold mb-12 text-center">{props.title}</h2>
      )}
      <div className="space-y-4">
        {props.items.map((item, i) => (
          <details key={i} className="border rounded-lg p-4 cursor-pointer group">
            <summary className="font-semibold group-open:text-indigo-600">
              {item.question}
            </summary>
            <p className="mt-2 text-slate-600 text-sm">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
