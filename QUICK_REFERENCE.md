# Text Refinement System - Quick Reference Card

## 📌 One-Minute Setup

```typescript
// Step 1: Replace in app/(editor)/edit/[slug]/page.tsx
import { AIEnhancedPanel } from "@/components/editor/AIPanel.enhanced";
<AIEnhancedPanel slug={slug} />

// Step 2: Test it
// - Open editor
// - Generate block
// - Select text
// - Refine!
```

## 🎯 Refinement Modes Cheat Sheet

| Mode | Input | Output |
|------|-------|--------|
| **shorter** | "Our amazing software solution" | "Software excellence" |
| **engaging** | "Click here" | "Unlock your potential" |
| **professional** | "cool stuff" | "Advanced functionality" |
| **grammar** | "There going to the store" | "They're going to the store" |
| **custom** | "Make it pirate-themed" | "Arr, ye be needin' this software" |

## 📂 File Structure

```
app/api/ai/refine-text/route.ts           ← API endpoint
components/editor/
  ├── TextRefinePanel.tsx                 ← Main UI
  ├── DiffPreview.tsx                     ← Diff viewer
  └── AIPanel.enhanced.tsx                ← Integrated panel
components/blocks/
  └── RefinableText.tsx                   ← Text wrapper
lib/hooks/
  └── useTextRefinement.ts                ← State management
docs/
  ├── TEXT_REFINEMENT.md                  ← Full docs
  └── INTEGRATION_GUIDE.md                ← Setup guide
```

## 🔌 Hook Usage

```typescript
import { useTextRefinement } from "@/lib/hooks/useTextRefinement";

const textRefinement = useTextRefinement();

// Select text programmatically
textRefinement.selectText({
  text: "Hello world",
  fieldPath: "headline",
  context: "page headline",
});

// Open/close panel
textRefinement.selectText(selection);
textRefinement.closePanel();

// Get selected text from DOM
const selected = textRefinement.getSelectedTextFromDOM();

// Enable inline refinement on element
textRefinement.enableInlineRefinement(element, {
  context: "hero headline",
  fieldPath: "content[0].props.headline"
});
```

## 🛣️ Component Props

### TextRefinePanel

```typescript
<TextRefinePanel
  isOpen={boolean}              // Show/hide
  onClose={() => {}}            // Close handler
  selectedText="text"           // Text to refine
  fieldPath="path.to.field"     // Where to apply
  context="hero headline"       // Context for AI
/>
```

### DiffPreview

```typescript
<DiffPreview
  original="Old text"
  refined="New text"
  compact={false}               // Side-by-side (false) or stacked (true)
/>
```

### RefinableText

```typescript
<RefinableText
  text="headline text"
  onRefine={(text) => {}}       // Selection handler
  context="hero headline"       // For AI
  className="text-4xl"          // Styling
  isEditable={true}             // Show indicator
/>
```

## 🔗 API Endpoint

```bash
POST /api/ai/refine-text

Request:
{
  "text": "text to refine",
  "instruction": "shorter|engaging|professional|grammar|custom",
  "customPrompt": "optional custom instructions",
  "context": "optional context"
}

Response (streaming):
{"chunk":"word","refined":"accumulated","isComplete":false}
```

## 🎨 Tailwind Classes Used

- `bg-violet-50` / `bg-violet-100` / `bg-violet-600` - Primary
- `bg-green-50` / `bg-green-200` / `bg-green-600` - Accept
- `bg-red-50` / `bg-red-200` / `bg-red-600` - Remove
- `bg-slate-50` / `text-slate-600` - Neutral
- `text-xs` / `text-sm` - Typography

## 🚀 Performance Tips

```typescript
// Lazy load panel for bundle optimization
const TextRefinePanel = dynamic(
  () => import("@/components/editor/TextRefinePanel"),
  { loading: () => <Skeleton /> }
);

// Debounce selection for performance
const [selectedText, setSelectedText] = useState("");
const debouncedRefine = useCallback(
  debounce((text) => selectText(text), 100),
  []
);
```

## 🧪 Testing Quick Commands

```bash
# Run tests
npm run test -- text-refinement.test.ts

# Run specific suite
npm run test -- text-refinement.test.ts -t "Diff Algorithm"

# Run with coverage
npm run test -- text-refinement.test.ts --coverage
```

## 🐛 Quick Debugging

```typescript
// Check if panel is open
console.log("Panel open:", textRefinement.isPanelOpen);

// Check selected text
console.log("Selected:", textRefinement.selectedText);

// Check field path
console.log("Field path:", textRefinement.fieldPath);

// Enable verbose logging
// Add console.log() in TextRefinePanel after refinement

// Check API response
// Open DevTools → Network → filter "refine-text"
```

## 📊 Diff Preview Stats

```typescript
const original = "Hello world";
const refined = "Hi there world";

// Character count
original.length        // 11
refined.length         // 14
// Change: +3 chars (+27%)

// Word count
original.split(/\s+/).length    // 2
refined.split(/\s+/).length     // 3
// Change: +1 word
```

## 🔐 Security Checklist

```typescript
// ✅ Validate text input
if (!text.trim()) throw new Error("Empty text");

// ✅ Sanitize before rendering
import DOMPurify from "dompurify";
const clean = DOMPurify.sanitize(refined);

// ✅ Use AbortController for cleanup
streamAbortRef.current = new AbortController();
// ... later ...
streamAbortRef.current.abort();

// ✅ Don't log sensitive data
// ❌ console.log(refinedText)  // User's content
// ✅ console.log("Refinement complete")  // Log action, not content
```

## 🚢 Deployment Checklist

```bash
# Before deploying:

# 1. Set environment variable
echo "GOOGLE_GENERATIVE_AI_API_KEY=your_key" >> .env.production

# 2. Test refinement in staging
npm run build
npm run start
# ... manual test ...

# 3. Monitor API usage
# → Google AI Studio dashboard → Usage

# 4. Set up alerts for quota
# → Dashboard → Quotas & Rate limits

# 5. Verify error handling
# → Test with invalid API key
# → Test with network failure
```

## 💡 Common Patterns

### Refine on Double-Click

```typescript
function TextField({ text, onChange }) {
  const textRefinement = useTextRefinement();
  
  return (
    <input
      value={text}
      onDoubleClick={() => 
        textRefinement.selectText({
          text,
          context: "text field"
        })
      }
    />
  );
}
```

### Batch Refine

```typescript
async function refineAllHeadlines(blocks, mode) {
  return Promise.all(
    blocks.map(block =>
      fetch("/api/ai/refine-text", {
        method: "POST",
        body: JSON.stringify({
          text: block.headline,
          instruction: mode,
          context: "block headline"
        })
      })
    )
  );
}
```

### Custom Prompt from Template

```typescript
const templates = {
  pirate: "Rewrite in pirate speak",
  shakespeare: "Rewrite as Shakespeare",
  yoda: "Rewrite in Yoda's style",
};

// User selects template
// setCustomPrompt(templates.pirate);
// Refinement applies custom prompt
```

## 🆘 Error Codes

| Error | Fix |
|-------|-----|
| "API key not found" | Set GOOGLE_GENERATIVE_AI_API_KEY |
| "Quota exceeded" | Wait 60s or upgrade API tier |
| "Invalid request" | Check JSON in request body |
| "Network error" | Check internet connection |
| "Text too long" | Keep text under 5000 chars |

## 📱 Mobile Considerations

```typescript
// Panel is full-width on mobile
<div className="fixed inset-0 z-50">
  <div className="w-full max-w-2xl">  // ← Full-width on mobile
    {/* Panel content */}
  </div>
</div>

// Test on:
// - iPhone 12/13/14/15
// - iPad (portrait/landscape)
// - Android phones (various sizes)
```

## 🎓 Learning Resources

- **TEXT_REFINEMENT.md** - Deep dive (384 lines)
- **INTEGRATION_GUIDE.md** - How to use (418 lines)
- **text-refinement.test.ts** - Test examples (324 lines)
- **Gemini docs** - AI model reference

## 🔗 Related Files

```
app/(editor)/edit/[slug]/page.tsx       ← Update here
components/editor/PuckEditor.tsx        ← Editor layout
lib/puck/config.ts                      ← Block types
app/api/ai/generate-block/route.ts      ← Similar pattern
```

## 💬 Quick Customization

### Add New Refinement Mode

```typescript
// 1. Update schema in route.ts
instruction: z.enum([
  "shorter",
  "engaging",
  "professional",
  "grammar",
  "custom",
  "allcaps"  // ← Add new mode
])

// 2. Add prompt
const refinementPrompts = {
  // ...existing modes...
  allcaps: (text) => 
    `CONVERT THIS TO ALL CAPS:\n\nText: "${text}"\n\nResult:`
}

// 3. Add button in TextRefinePanel
<button
  onClick={() => setMode("allcaps")}
  className={/* styles */}
>
  ALL CAPS
</button>
```

### Change AI Model

```typescript
// In route.ts
const stream = await streamText({
  prompt,
  model: ai.model("gemini-1.5-pro"),  // ← Change here
  // or: ai.model("gemini-1.0-pro")
  // or: openai.model("gpt-4")
});
```

### Add Refinement History

```typescript
const [history, setHistory] = useState([
  { original: "", refined: "", mode: "shorter" }
]);

const handleAccept = () => {
  setHistory([
    ...history,
    { original: selectedText, refined, mode }
  ]);
  // ... rest of accept logic
};
```

---

**Quick Ref Version:** 1.0
**Last Updated:** May 2026
**Bookmark this!** ⭐
