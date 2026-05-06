import type { AllBlockProps } from "../types";

export function TestimonialBlock(props: AllBlockProps["TestimonialBlock"]) {
  return (
    <div className="w-full py-16 px-4 bg-slate-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {props.quotes.map((q, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
            <p className="italic text-slate-600 mb-4">"{q.text}"</p>
            <div className="flex items-center gap-3">
              {q.avatar && (
                <img
                  src={q.avatar}
                  alt={q.author}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold text-sm">{q.author}</p>
                <p className="text-xs text-slate-500">{q.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
