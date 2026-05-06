# Inline AI Text Refinement System

## Overview

The text refinement system enables users to select and improve any text in page blocks using AI. Users can make text shorter, more engaging, professional, or fix grammar with a single click.

**Features:**
- ✅ Select text anywhere in blocks
- ✅ Choose refinement mode (shorter, engaging, professional, grammar, custom)
- ✅ Real-time streaming of refined text
- ✅ Side-by-side diff preview with stats
- ✅ Accept or reject refined content
- ✅ Copy to clipboard
- ✅ Integrated with Puck editor

## Architecture

### Components

#### 1. **TextRefinePanel** (`components/editor/TextRefinePanel.tsx`)
Main UI panel for text refinement workflow.

**Props:**
```typescript
interface TextRefinePanelProps {
  isOpen: boolean;                    // Panel visibility
  onClose: () => void;                // Close handler
  selectedText: string;               // Text to refine
  fieldPath?: string;                 // Puck field path for updates
  context?: string;                   // Human-readable context
}
```

**Features:**
- Modal panel with refinement mode selection
- Real-time streaming response display
- Diff preview with word-level highlighting
- Accept/Reject/Copy/Refine Again actions
- Custom prompt input for "custom" mode
- Error handling and loading states

#### 2. **DiffPreview** (`components/editor/DiffPreview.tsx`)
Visual comparison component showing original vs refined text.

**Props:**
```typescript
interface DiffPreviewProps {
  original: string;           // Original text
  refined: string;            // Refined text
  compact?: boolean;          // Compact layout
}
```

**Features:**
- Side-by-side comparison (default) or stacked (compact)
- Character and word count stats
- Word-level diff highlighting
- Color-coded additions/removals

#### 3. **RefinableText** (`components/blocks/RefinableText.tsx`)
Wrapper component for making text fields refinable.

```typescript
interface RefinableTextProps {
  text: string;
  onRefine: (selectedText: string) => void;
  children?: ReactNode;
  className?: string;
  isEditable?: boolean;
  context?: string;
}
```

### API Route

#### POST `/api/ai/refine-text`

**Request Body:**
```json
{
  "text": "Original text to refine",
  "instruction": "shorter" | "engaging" | "professional" | "grammar" | "custom",
  "customPrompt": "Optional custom instructions",
  "context": "Optional context e.g., hero headline"
}
```

**Response (Streaming):**
```json
{
  "chunk": "word being streamed",
  "refined": "accumulated refined text so far",
  "isComplete": false | true
}
```

**Refinement Modes:**

| Mode | Purpose | Example |
|------|---------|---------|
| **shorter** | Reduce length while keeping key message | "Transform your workflow" → "Workflow transformation" |
| **engaging** | Add compelling language, active voice | "Our tool helps" → "Revolutionize your workflow" |
| **professional** | Formal business tone | "Cool feature bro" → "Advanced feature implementation" |
| **grammar** | Fix errors, keep tone/meaning | "Their going to the store" → "They're going to the store" |
| **custom** | Apply custom instructions | Any transformation following your prompt |

## Usage

### Basic Integration

1. **Enable text selection in editor:**

```typescript
import { useTextRefinement } from '@/lib/hooks/useTextRefinement';
import { TextRefinePanel } from '@/components/editor/TextRefinePanel';

function MyEditor() {
  const textRefinement = useTextRefinement();

  return (
    <>
      {/* Your editor UI */}
      <TextRefinePanel
        isOpen={textRefinement.isPanelOpen}
        onClose={textRefinement.closePanel}
        selectedText={textRefinement.selectedText}
        fieldPath={textRefinement.fieldPath}
        context={textRefinement.context}
      />
    </>
  );
}
```

2. **Use RefinableText wrapper in blocks:**

```typescript
import { RefinableText } from '@/components/blocks/RefinableText';

function HeroBlock({ headline, onHeadlineRefine }) {
  return (
    <div className="hero">
      <RefinableText
        text={headline}
        onRefine={onHeadlineRefine}
        context="hero headline"
        className="text-4xl font-bold"
        isEditable={true}
      >
        {headline}
      </RefinableText>
    </div>
  );
}
```

### Advanced: Custom Refinement

Users can create custom refinements with their own instructions:

1. Select text
2. Click "Refine Text"
3. Choose mode: "Custom"
4. Enter custom instructions:
   - "Make this more casual and friendly"
   - "Add emojis to make it fun"
   - "Use technical terminology"
   - "Write in conversational style"
5. Text is refined according to instructions

### Streaming Response Example

The API streams responses word-by-word:

```
{"chunk":"Revolutionize","refined":"Revolutionize","isComplete":false}
{"chunk":" your","refined":"Revolutionize your","isComplete":false}
{"chunk":" workflow","refined":"Revolutionize your workflow","isComplete":false}
{"chunk":" today","refined":"Revolutionize your workflow today","isComplete":true}
```

This enables real-time display of refinement progress.

## Hook API: useTextRefinement

### State

```typescript
const {
  isPanelOpen,              // boolean
  selectedText,             // string
  fieldPath,                // string | undefined
  context,                  // string | undefined
  selectionRef,             // RefObject
} = useTextRefinement();
```

### Actions

```typescript
const {
  selectText,               // (selection: TextSelection) => void
  closePanel,               // () => void
  getSelectedTextFromDOM,   // () => string
  enableInlineRefinement,   // (element: HTMLElement, options?: {}) => () => void
} = useTextRefinement();
```

### Example: Enable refinement on element

```typescript
useEffect(() => {
  const cleanup = textRefinement.enableInlineRefinement(
    paragraphRef.current,
    {
      context: "product description",
      fieldPath: "content[0].props.description"
    }
  );
  return cleanup;
}, []);
```

## Integrating with Enhanced AIPanel

The `AIPanel.enhanced.tsx` includes both:
- Block/page generation (original)
- Text refinement (new)

```typescript
import { AIEnhancedPanel } from '@/components/editor/AIPanel.enhanced';

// In your editor layout:
<AIEnhancedPanel slug={slug} />
```

Users will see:
1. Generate tab (create new blocks/pages)
2. Text refinement hint
3. Auto-opening TextRefinePanel on selection

## Diff Algorithm

The diff preview uses a simple word-level comparison:

1. Split both texts into words
2. Find matching sequences
3. Highlight additions (green), removals (red), unchanged (normal)
4. Show statistics:
   - Character count (before/after, % change)
   - Word count (before/after)

This is fast and suitable for UI preview. For production analysis, consider a library like `diff-match-patch`.

## Styling & Theming

All components use Tailwind CSS with:
- Violet/indigo as primary accent
- Slate as neutral
- Green for acceptance
- Red for removal/errors

Customize by modifying className props or updating Tailwind config.

## Performance Considerations

- **Streaming:** API responses stream word-by-word for perceived responsiveness
- **Abort:** Requests can be cancelled (AbortController)
- **Debounce:** Panel opens immediately on selection (no debounce needed)
- **Memory:** Selected text stored in state; cleared on close

## Error Handling

- Empty text validation
- API error messages displayed in panel
- Network errors caught and displayed
- Graceful fallbacks with user feedback

## Security

- Input text sent to Gemini API (not stored)
- No sensitive data in refinement flows
- XSS: Puck handles text sanitization
- CSRF: API uses POST with headers validation

## Testing

### Manual Testing Checklist

- [ ] Select text in hero block → panel opens
- [ ] Try each refinement mode (shorter, engaging, professional, grammar)
- [ ] Use custom mode with custom prompt
- [ ] Diff preview shows word-level changes
- [ ] Accept applies changes to block
- [ ] Reject closes panel without changes
- [ ] Copy copies to clipboard
- [ ] Cancel stream stops generation
- [ ] Works with headlines, descriptions, body text

### Unit Testing Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TextRefinePanel } from '@/components/editor/TextRefinePanel';

describe('TextRefinePanel', () => {
  it('opens when isOpen=true', () => {
    render(
      <TextRefinePanel
        isOpen={true}
        onClose={() => {}}
        selectedText="Hello world"
      />
    );
    expect(screen.getByText('Refine Text')).toBeInTheDocument();
  });

  it('calls onClose when X is clicked', () => {
    const onClose = jest.fn();
    render(
      <TextRefinePanel
        isOpen={true}
        onClose={onClose}
        selectedText="Hello"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /X/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
```

## Gemini Model Details

- **Model:** gemini-1.5-flash (fast, free tier)
- **Temperature:** 0.7 (balanced creativity)
- **Max tokens:** 500 (sufficient for refinement)
- **Cost:** Free tier (12.5K req/min)

## Future Enhancements

- [ ] Batch refinement (refine multiple fields at once)
- [ ] Refinement history (undo/redo)
- [ ] Custom refinement presets
- [ ] A/B testing (compare multiple refinements)
- [ ] Language detection
- [ ] Tone analysis on original text
- [ ] Integration with version history
- [ ] Keyboard shortcuts (Cmd+Shift+R to refine)

## Troubleshooting

### Panel doesn't open on text selection

**Cause:** Hook not properly connected to editor state

**Fix:** Ensure `TextRefinePanel` is rendered in your main editor component

### Streaming text doesn't update

**Cause:** Fetch response parsing issue

**Fix:** Check browser console for errors; verify API endpoint returns valid JSON lines

### Gemini API errors

**Cause:** API key missing or quota exceeded

**Fix:** 
- Set `GOOGLE_GENERATIVE_AI_API_KEY` env var
- Check quota in Google AI Studio
- Use free tier (12.5K requests/min)

### Diff preview not showing

**Cause:** `refined` state is empty

**Fix:** Ensure refine button completes before checking

---

**Last Updated:** May 2026
**Version:** 1.0
