import type { AllBlockProps } from "../types";

export function TimelineBlock(props: AllBlockProps["TimelineBlock"]) {
  return (
    <div className="w-full py-16 px-4 max-w-3xl mx-auto">
      {props.events.map((evt, i) => (
        <div key={i} className="mb-8 flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--color-primary, #6366f1)' }} />
            {i < props.events.length - 1 && (
              <div className="w-0.5 h-16" style={{ backgroundColor: 'var(--color-primary, #6366f1)20' }} />
            )}
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--color-primary, #6366f1)' }}>{evt.date}</p>
            <h3 className="font-bold" style={{ fontFamily: 'var(--font-heading, Montserrat, sans-serif)' }}>{evt.title}</h3>
            <p className="text-sm" style={{ color: 'var(--color-muted, #64748b)' }}>{evt.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
