# Inline AI Text Refinement System - Visual Overview

## 🎯 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PUCK EDITOR                              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     Page Editor Canvas                     │   │
│  │                                                            │   │
│  │  ┌────────────────┐  ┌────────────────┐                  │   │
│  │  │  Hero Block    │  │  Card Block    │  ...             │   │
│  │  │  "Click here"  │  │  "Lorem ipsum" │                  │   │
│  │  └────────────────┘  └────────────────┘                  │   │
│  │        ↓ (select text)                                    │   │
│  │   User selects "Click here"                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│           │                                                       │
│           ↓                                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              AI PANEL (Enhanced)                           │   │
│  │  [Block] [Page]  ← Tabs                                   │   │
│  │  [Generate...] [Refine]  ← Actions                        │   │
│  │                                                            │   │
│  │  💡 "Select text to refine"  ← Hint                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
           │
           ↓ (text selected, panel opens)
┌─────────────────────────────────────────────────────────────────┐
│            TEXT REFINEMENT PANEL (Modal Overlay)                 │
│                                                                   │
│  ✨ Refine Text                                    ✕             │
│  ┌─────────────────────────────────────────────┐                │
│  │ Refinement Type:                             │                │
│  │ [Shorter] [Engaging] [Professional] [Grammar]│               │
│  ├─────────────────────────────────────────────┤                │
│  │ Original Text: "Click here"                  │                │
│  ├─────────────────────────────────────────────┤                │
│  │ STREAMING REFINEMENT...                      │                │
│  │ "Unlock" → "Unlock your" → "Unlock your..." │               │
│  ├─────────────────────────────────────────────┤                │
│  │           DIFF PREVIEW                       │                │
│  │ Original: Click here                         │                │
│  │           ↓↓↓                                 │                │
│  │ Refined:  Unlock your potential             │                │
│  │          [+green highlights] [copy]          │                │
│  ├─────────────────────────────────────────────┤                │
│  │ [Cancel] [Copy] [Refine Again] [✓ Accept]  │                │
│  └─────────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
           │ (Accept clicked)
           ↓
        Block updates: "Click here" → "Unlock your potential"
```

## 🔄 Data Flow Diagram

```
USER INTERACTION LAYER
┌─────────────────────────────┐
│  1. Select text in block    │
│  2. Click refinement mode   │
│  3. Click "Refine Text"     │
└──────────────┬──────────────┘
               │
               ↓
COMPONENT STATE LAYER (React)
┌──────────────────────────────────────┐
│ TextRefinePanel                       │
│  - isPanelOpen: true                 │
│  - selectedText: "Click here"         │
│  - mode: "engaging"                  │
│  - refined: "" (accumulating...)      │
│  - streaming: true                   │
└──────────────┬───────────────────────┘
               │
               ↓
API COMMUNICATION LAYER
┌──────────────────────────────────────┐
│ POST /api/ai/refine-text             │
│ {                                    │
│   "text": "Click here",              │
│   "instruction": "engaging",         │
│   "context": "CTA button"            │
│ }                                    │
└──────────────┬───────────────────────┘
               │
               ↓
AI PROCESSING LAYER
┌──────────────────────────────────────┐
│ Gemini 1.5 Flash (Google AI)         │
│ - Receives text                      │
│ - Applies refinement prompt          │
│ - Streams response                   │
│ - Returns: "Unlock your potential"   │
└──────────────┬───────────────────────┘
               │
               ↓
STREAMING RESPONSE LAYER
┌──────────────────────────────────────┐
│ JSON Lines (one per chunk)           │
│ {"chunk":"Unlock","refined":"Unlock"}│
│ {"chunk":" your","refined":"Unlock y"}
│ {"chunk":" potential","refined":"..."} │
│ {"chunk":"","refined":"...","done":1}  │
└──────────────┬───────────────────────┘
               │
               ↓
UI UPDATE LAYER
┌──────────────────────────────────────┐
│ DiffPreview renders:                 │
│ ✕ Click here                         │
│ ✓ Unlock your potential              │
│ [green highlights on new words]      │
└──────────────┬───────────────────────┘
               │
               ↓
ACCEPTANCE LAYER
┌──────────────────────────────────────┐
│ User clicks "Accept"                 │
│ dispatch({ type: "SET_DATA", ... })  │
│ Block re-renders with new text       │
└──────────────────────────────────────┘
```

## 📦 Component Tree

```
AIEnhancedPanel
│
├─ AIPanel (original)
│  ├─ Textarea (prompt input)
│  ├─ Buttons (Generate)
│  └─ Toast notifications
│
└─ TextRefinePanel (new)
   │
   ├─ Header
   │  ├─ Title
   │  └─ Close button
   │
   ├─ Content
   │  ├─ Mode selector
   │  │  ├─ [Shorter]
   │  │  ├─ [Engaging]
   │  │  ├─ [Professional]
   │  │  └─ [Grammar]
   │  │
   │  ├─ Original text display
   │  │
   │  ├─ Streaming indicator
   │  │  └─ Live refined text
   │  │
   │  ├─ DiffPreview (conditional)
   │  │  ├─ Statistics
   │  │  │  ├─ Character count
   │  │  │  └─ Word count
   │  │  │
   │  │  └─ Diff display
   │  │     ├─ Original
   │  │     └─ Refined (with highlighting)
   │  │
   │  └─ Error display (conditional)
   │
   └─ Footer
      └─ Action buttons
         ├─ [Cancel]
         ├─ [Copy] (conditional)
         ├─ [Refine Again] (conditional)
         └─ [✓ Accept] (conditional)
```

## 🎬 User Interaction Flow

```
START
  │
  ↓
[Opens Editor]
  │
  ├─→ Puck Editor loads
  │
  ↓
[Selects Text]
  │
  ├─→ User highlights text in any block
  ├─→ useTextRefinement detects selection
  └─→ Panel opens with selected text
  │
  ↓
[Chooses Mode]
  │
  ├─→ User sees 5 buttons:
  │   - Shorter (default)
  │   - Engaging
  │   - Professional
  │   - Grammar
  │   - Custom (if custom prompt entered)
  │
  ├─→ User clicks one button
  │
  ↓
[Refinement Starts]
  │
  ├─→ Button shows loading state
  ├─→ API endpoint called
  ├─→ Gemini processes text
  ├─→ Streaming begins
  │
  ↓
[Streaming Display]
  │
  ├─→ Words appear one by one
  ├─→ DiffPreview renders live
  ├─→ Stats update in real-time
  │
  ↓
[Refinement Complete]
  │
  ├─→ Loading state ends
  ├─→ Full diff visible
  ├─→ Action buttons enabled
  │
  ↓
[User Decision]
  │
  ├─→ Accept
  │   ├─→ Block updates immediately
  │   ├─→ Panel closes
  │   └─→ Toast confirms
  │
  ├─→ Reject
  │   ├─→ Panel closes
  │   └─→ Block unchanged
  │
  ├─→ Copy
  │   ├─→ Text copied to clipboard
  │   └─→ Toast confirms
  │
  ├─→ Refine Again
  │   ├─→ Clear current refined text
  │   ├─→ Ready for new mode
  │   └─→ Go back to [Chooses Mode]
  │
  ↓
[Session Ends]
  │
  └─→ Continue editing or exit
```

## 📊 Data Structure

### Selection State
```typescript
{
  text: string;              // "Click here"
  fieldPath?: string;        // "content[0].props.ctaLabel"
  context?: string;          // "CTA button"
  blockId?: string;          // "hero-block-1"
}
```

### Refinement Request
```typescript
{
  text: string;              // "Click here"
  instruction: string;       // "engaging"
  customPrompt?: string;     // "Make it pirate themed"
  context?: string;          // "CTA button"
}
```

### Streaming Response
```typescript
{
  chunk: string;             // "Unlock"
  refined: string;           // Accumulated full text
  isComplete: boolean;       // true when done
}
```

### Diff Result
```typescript
Array<{
  text: string;              // Word or whitespace
  type: string;              // "equal" | "added" | "removed"
}>
```

## 🎨 UI States

### 1. Initial State (Panel Closed)
```
┌─ AI Panel ─┐
│ [Block]    │ ← User can click to generate
│ [Page]     │    or select text
│ [Generate] │
└────────────┘
```

### 2. Selection State (Panel Opening)
```
┌──────────────────────────────┐
│ ✨ Refine Text               │
│ [Shorter] [Engaging] ...     │
│ Original: "Click here"       │
│ [Refine Text] button         │
└──────────────────────────────┘
```

### 3. Loading State
```
┌──────────────────────────────┐
│ ✨ Refine Text               │
│ [Shorter] [Engaging] ...     │
│ Original: "Click here"       │
│ ⏳ Refining text...          │
│ "Unlock your..." (streaming) │
└──────────────────────────────┘
```

### 4. Result State
```
┌──────────────────────────────┐
│ ✨ Refine Text               │
│ [Shorter] [Engaging] ...     │
│ Original: "Click here"       │
│                              │
│ ✓ DIFF PREVIEW:              │
│ Original | Refined           │
│ Click    | ✓Unlock           │
│ here     | ✓your potential   │
│                              │
│ [Cancel] [Copy] [Refine Again] │ [✓Accept] │
└──────────────────────────────┘
```

## 🔌 Integration Points

```
PuckEditor (main component)
    │
    ├─→ AIEnhancedPanel
    │   │
    │   ├─→ useTextRefinement hook
    │   │   │
    │   │   └─→ TextRefinePanel
    │   │       │
    │   │       ├─→ DiffPreview
    │   │       │
    │   │       └─→ POST /api/ai/refine-text
    │   │           │
    │   │           └─→ Gemini API (streaming)
    │   │
    │   └─→ [Block rendering with text]
    │       │
    │       └─→ (Optional) RefinableText wrapper
    │
    └─→ PuckEditor dispatch
        │
        └─→ Updates block props
            │
            └─→ Component re-renders
```

## ⏱️ Timeline / Sequence Diagram

```
User          Panel        API          Gemini
  │             │            │             │
  │─ select ───→│            │             │
  │             │            │             │
  │←─ open ─────│            │             │
  │             │            │             │
  │─ choose ───→│            │             │
  │  mode       │            │             │
  │             │            │             │
  │─ refine ───→│            │             │
  │             │─ POST ────→│             │
  │             │            │─ process ─→│
  │             │            │             │
  │             │←─ chunk 1 ─│←─ stream ──│
  │             │            │             │
  │←─ update 1 ─│            │             │
  │  (render)   │            │             │
  │             │            │             │
  │             │←─ chunk 2 ─│←─ stream ──│
  │             │            │             │
  │←─ update 2 ─│            │             │
  │  (render)   │            │             │
  │             │            │             │
  │             │← complete ─│← complete -│
  │             │            │             │
  │←─ diff ─────│            │             │
  │  ready      │            │             │
  │             │            │             │
  │─ accept ───→│            │             │
  │             │            │             │
  │←─ apply ────│            │             │
  │  to block   │            │             │
  │             │            │             │
  │             │←─ close ───│             │
  │             │            │             │
```

## 🎓 Learning Hierarchy

```
┌─────────────────────────────────────────┐
│         USERS (Non-technical)            │
│  "Click text, choose refinement, accept" │
│                                          │
│  Resources: Tutorial video, hover hints  │
└──────────────┬──────────────────────────┘

┌─────────────────────────────────────────┐
│     DEVELOPERS (Technical basics)         │
│  "How to integrate, configure, customize"│
│                                          │
│  Resources: INTEGRATION_GUIDE.md          │
│           QUICK_REFERENCE.md              │
└──────────────┬──────────────────────────┘

┌─────────────────────────────────────────┐
│   ADVANCED DEVELOPERS (Deep knowledge)    │
│  "Architecture, testing, performance"    │
│                                          │
│  Resources: TEXT_REFINEMENT.md            │
│           Source code                    │
│           Test suite                     │
└──────────────┬──────────────────────────┘

┌─────────────────────────────────────────┐
│  DEVOPS / OPERATIONS (Infrastructure)     │
│  "Deployment, monitoring, scaling"       │
│                                          │
│  Resources: DELIVERY_MANIFEST.md          │
│           INTEGRATION_GUIDE.md Deployment │
└──────────────────────────────────────────┘
```

---

This visual overview helps understand:
- 🏗️ How components connect
- 🔄 How data flows through the system
- 🎬 What happens at each step
- 📦 Where each piece lives
- ⏱️ Timeline of operations
- 📚 Learning path for different audiences
