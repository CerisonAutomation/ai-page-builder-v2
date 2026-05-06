import type { AllBlockProps } from "../types";

export function TimelineBlock(props: AllBlockProps["TimelineBlock"]) {
  return (
    <div className="w-full py-16 px-4 max-w-3xl mx-auto">
      {props.events.map((evt, i) => (
        <div key={i} className="mb-8 flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 bg-indigo-600 rounded-full" />
            {i < props.events.length - 1 && (
              <div className="w-0.5 h-16 bg-indigo-200" />
            )}
          </div>
          <div>
            <p className="font-semibold text-indigo-600">{evt.date}</p>
            <h3 className="font-bold">{evt.title}</h3>
            <p className="text-slate-600 text-sm">{evt.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
