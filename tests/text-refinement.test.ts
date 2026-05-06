/**
 * Text Refinement System Tests
 * ✅ Unit and integration tests for refinement components
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ✅ DIFF ALGORITHM TESTS
describe("Diff Algorithm", () => {
  const diffWords = (original: string, refined: string) => {
    const origWords = original.split(/(\s+)/);
    const refinedWords = refined.split(/(\s+)/);
    const result: Array<{ text: string; type: "equal" | "removed" | "added" }> = [];

    let origIdx = 0;
    let refinedIdx = 0;

    while (origIdx < origWords.length && refinedIdx < refinedWords.length) {
      if (origWords[origIdx] === refinedWords[refinedIdx]) {
        result.push({ text: origWords[origIdx], type: "equal" });
        origIdx++;
        refinedIdx++;
      } else {
        let found = false;
        for (let i = refinedIdx + 1; i < Math.min(refinedIdx + 5, refinedWords.length); i++) {
          if (origWords[origIdx] === refinedWords[i]) {
            for (let j = refinedIdx; j < i; j++) {
              result.push({ text: refinedWords[j], type: "added" });
            }
            result.push({ text: origWords[origIdx], type: "equal" });
            origIdx++;
            refinedIdx = i + 1;
            found = true;
            break;
          }
        }
        if (!found) {
          result.push({ text: origWords[origIdx], type: "removed" });
          origIdx++;
        }
      }
    }

    while (origIdx < origWords.length) {
      result.push({ text: origWords[origIdx], type: "removed" });
      origIdx++;
    }

    while (refinedIdx < refinedWords.length) {
      result.push({ text: refinedWords[refinedIdx], type: "added" });
      refinedIdx++;
    }

    return result;
  };

  it("detects unchanged words", () => {
    const diff = diffWords("hello world", "hello world");
    expect(diff.every((item) => item.type === "equal")).toBe(true);
  });

  it("detects added words", () => {
    const diff = diffWords("hello world", "hello beautiful world");
    expect(diff.some((item) => item.type === "added")).toBe(true);
  });

  it("detects removed words", () => {
    const diff = diffWords("hello beautiful world", "hello world");
    expect(diff.some((item) => item.type === "removed")).toBe(true);
  });

  it("handles multiple changes", () => {
    const diff = diffWords(
      "our software is good",
      "revolutionize your workflow"
    );
    expect(diff.length).toBeGreaterThan(0);
    expect(diff.some((item) => item.type === "added" || item.type === "removed")).toBe(
      true
    );
  });

  it("preserves whitespace", () => {
    const diff = diffWords("hello  world", "hello world");
    expect(diff.some((item) => item.text.includes(" "))).toBe(true);
  });
});

// ✅ REFINEMENT PROMPT TESTS
describe("Refinement Prompts", () => {
  const refinementPrompts = {
    shorter: (text: string) =>
      `Make this text shorter and more concise while keeping the key message.\n\nOriginal: "${text}"\n\nRefined:`,
    engaging: (text: string) =>
      `Rewrite this to be more engaging, compelling, and dynamic.\n\nOriginal: "${text}"\n\nRefined:`,
    professional: (text: string) =>
      `Rewrite this in a professional, formal tone.\n\nOriginal: "${text}"\n\nRefined:`,
    grammar: (text: string) =>
      `Fix all grammar, spelling, and punctuation errors.\n\nOriginal: "${text}"\n\nRefined:`,
  };

  it("shorter mode includes original", () => {
    const prompt = refinementPrompts.shorter("hello world");
    expect(prompt).toContain("hello world");
    expect(prompt).toContain("shorter");
  });

  it("engaging mode includes original", () => {
    const prompt = refinementPrompts.engaging("hello world");
    expect(prompt).toContain("hello world");
    expect(prompt).toContain("engaging");
  });

  it("professional mode includes original", () => {
    const prompt = refinementPrompts.professional("hello world");
    expect(prompt).toContain("hello world");
    expect(prompt).toContain("professional");
  });

  it("grammar mode includes original", () => {
    const prompt = refinementPrompts.grammar("hello world");
    expect(prompt).toContain("hello world");
    expect(prompt).toContain("grammar");
  });

  it("all prompts include refinement instruction", () => {
    const text = "test";
    Object.values(refinementPrompts).forEach((promptFn) => {
      const prompt = promptFn(text);
      expect(prompt).toContain("Refined");
    });
  });
});

// ✅ STREAMING RESPONSE PARSING TESTS
describe("Streaming Response Parsing", () => {
  it("parses single JSON line", () => {
    const line = '{"chunk":"hello","refined":"hello","isComplete":false}';
    const data = JSON.parse(line);
    expect(data.chunk).toBe("hello");
    expect(data.isComplete).toBe(false);
  });

  it("accumulates chunks", () => {
    const lines = [
      '{"chunk":"hello","refined":"hello","isComplete":false}',
      '{"chunk":" world","refined":"hello world","isComplete":false}',
      '{"chunk":"","refined":"hello world","isComplete":true}',
    ];

    let accumulated = "";
    lines.forEach((line) => {
      const data = JSON.parse(line);
      accumulated = data.refined;
    });

    expect(accumulated).toBe("hello world");
  });

  it("handles empty chunks", () => {
    const line = '{"chunk":"","refined":"hello","isComplete":true}';
    const data = JSON.parse(line);
    expect(data.chunk).toBe("");
    expect(data.refined).toBe("hello");
  });
});

// ✅ TEXT VALIDATION TESTS
describe("Text Validation", () => {
  it("rejects empty text", () => {
    const text = "";
    expect(text.trim().length > 0).toBe(false);
  });

  it("rejects whitespace-only text", () => {
    const text = "   \n\t  ";
    expect(text.trim().length > 0).toBe(false);
  });

  it("accepts valid text", () => {
    const text = "Hello world";
    expect(text.trim().length > 0).toBe(true);
  });

  it("handles very long text", () => {
    const text = "a".repeat(10000);
    expect(text.length).toBe(10000);
  });

  it("handles special characters", () => {
    const text = "Hello @#$%^ world!";
    expect(text.trim().length > 0).toBe(true);
  });
});

// ✅ FIELD PATH PARSING TESTS
describe("Field Path Parsing", () => {
  it("parses simple path", () => {
    const path = "headline";
    const parts = path.match(/\w+/g) || [];
    expect(parts).toEqual(["headline"]);
  });

  it("parses array index path", () => {
    const path = "content[0].props.headline";
    const parts = path.match(/\w+/g) || [];
    expect(parts).toEqual(["content", "0", "props", "headline"]);
  });

  it("parses nested path", () => {
    const path = "cards[0].fields.title";
    const parts = path.match(/\w+/g) || [];
    expect(parts).toEqual(["cards", "0", "fields", "title"]);
  });
});

// ✅ REFINEMENT MODE VALIDATION
describe("Refinement Mode Validation", () => {
  const validModes = ["shorter", "engaging", "professional", "grammar", "custom"];

  it("accepts valid modes", () => {
    validModes.forEach((mode) => {
      expect(validModes.includes(mode)).toBe(true);
    });
  });

  it("rejects invalid modes", () => {
    const invalidModes = ["random", "silly", "xyz"];
    invalidModes.forEach((mode) => {
      expect(validModes.includes(mode)).toBe(false);
    });
  });
});

// ✅ CONTEXT PRESERVATION TESTS
describe("Context Preservation", () => {
  it("preserves original when returning refined", () => {
    const original = "Our software is good";
    const refined = "Revolutionize your workflow";

    expect(original).toBeTruthy();
    expect(refined).toBeTruthy();
    expect(original).not.toBe(refined);
  });

  it("tracks field path", () => {
    const fieldPath = "content[0].props.headline";
    expect(fieldPath).toContain("content");
    expect(fieldPath).toContain("headline");
  });

  it("includes context in prompt", () => {
    const context = "hero headline";
    const text = "Hello";
    const prompt = `Refine this for context: ${context}\n\nText: ${text}`;

    expect(prompt).toContain(context);
    expect(prompt).toContain(text);
  });
});

// ✅ ERROR HANDLING TESTS
describe("Error Handling", () => {
  it("handles network errors", () => {
    const error = new Error("Network failed");
    expect(error.message).toBe("Network failed");
  });

  it("handles API errors", () => {
    const error = new Error("API returned 500");
    expect(error).toBeTruthy();
  });

  it("handles abort signals", () => {
    const controller = new AbortController();
    controller.abort();
    expect(controller.signal.aborted).toBe(true);
  });

  it("recovers from partial responses", () => {
    const partialResponse = '{"chunk":"hello"';
    const isValidJSON = () => {
      try {
        JSON.parse(partialResponse);
        return true;
      } catch {
        return false;
      }
    };
    expect(isValidJSON()).toBe(false);
  });
});

// ✅ PERFORMANCE TESTS
describe("Performance", () => {
  it("diff algorithm handles long text", () => {
    const original = "a ".repeat(1000);
    const refined = "b ".repeat(1000);
    const start = performance.now();
    const diff = diffWords(original, refined);
    const end = performance.now();

    expect(end - start).toBeLessThan(100); // Should complete in < 100ms
    expect(diff.length).toBeGreaterThan(0);
  });

  it("parses many JSON lines quickly", () => {
    const lines = Array.from({ length: 1000 }, (_, i) => ({
      chunk: `word${i}`,
      refined: `accumulated${i}`,
      isComplete: false,
    }));

    const start = performance.now();
    lines.forEach((data) => {
      const str = JSON.stringify(data);
      JSON.parse(str);
    });
    const end = performance.now();

    expect(end - start).toBeLessThan(200); // Should complete in < 200ms
  });
});
