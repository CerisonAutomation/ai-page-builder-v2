/**
 * Fuzzy Search Utility
 * ✅ Fuzzy matching for pages, blocks, and content
 */

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(0));

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  return track[str2.length][str1.length];
}

/**
 * Calculate fuzzy match score (0-1)
 * 1.0 = exact match, lower = less similar
 */
export function fuzzyMatchScore(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact match
  if (q === t) return 1.0;

  // Substring match
  if (t.includes(q)) return 0.9;

  // Prefix match
  if (t.startsWith(q)) return 0.8;

  // Levenshtein distance-based score
  const maxLen = Math.max(q.length, t.length);
  const distance = levenshteinDistance(q, t);
  const score = Math.max(0, 1 - distance / maxLen);

  return score;
}

/**
 * Search array of items with fuzzy matching
 */
export function fuzzySearch<T extends Record<string, any>>(
  items: T[],
  query: string,
  searchFields: (keyof T)[],
  threshold: number = 0.3
): T[] {
  if (!query.trim()) return items;

  const results = items
    .map((item) => {
      const scores = searchFields
        .map((field) => {
          const value = item[field];
          if (typeof value !== "string") return 0;
          return fuzzyMatchScore(query, value);
        })
        .sort((a, b) => b - a);

      const maxScore = scores[0] || 0;
      return { item, score: maxScore };
    })
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);

  return results;
}

/**
 * Highlight matching text in results
 */
export function highlightMatches(
  text: string,
  query: string,
  className: string = "bg-yellow-200"
): string {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, `<mark class="${className}">$1</mark>`);
}

/**
 * Search within page content (blocks, text, etc)
 */
export interface SearchableBlock {
  type: string;
  props?: {
    [key: string]: any;
  };
}

export function searchBlocks(blocks: SearchableBlock[], query: string) {
  if (!query.trim()) return blocks;

  return blocks.filter((block) => {
    // Search in block type
    if (fuzzyMatchScore(query, block.type) > 0.5) return true;

    // Search in block props
    if (block.props) {
      for (const [key, value] of Object.entries(block.props)) {
        if (typeof value === "string") {
          if (fuzzyMatchScore(query, value) > 0.5) return true;
        } else if (typeof value === "object" && value !== null) {
          const stringified = JSON.stringify(value);
          if (fuzzyMatchScore(query, stringified) > 0.3) return true;
        }
      }
    }

    return false;
  });
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string, limit: number = 5): string[] {
  // Simple keyword extraction - split by common delimiters
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);

  // Remove duplicates and limit
  return [...new Set(words)].slice(0, limit);
}

/**
 * Calculate text relevance score
 */
export function calculateRelevance(
  text: string,
  query: string,
  boost: number = 1.0
): number {
  if (!query.trim()) return 0;

  const queryTerms = query.toLowerCase().split(/\s+/);
  const textLower = text.toLowerCase();

  let score = 0;

  for (const term of queryTerms) {
    // Term match
    if (textLower.includes(term)) {
      score += 1.0;
    }

    // Fuzzy match
    const fuzzyScore = fuzzyMatchScore(term, text);
    if (fuzzyScore > 0.5) {
      score += fuzzyScore * 0.5;
    }
  }

  return score * boost;
}

/**
 * Format search result with context snippet
 */
export interface SearchResult<T> {
  item: T;
  score: number;
  snippet?: string;
}

export function formatSearchResult<T extends Record<string, any>>(
  item: T,
  query: string,
  field: string,
  snippetLength: number = 100
): string {
  const text = item[field]?.toString() || "";
  const query_idx = text.toLowerCase().indexOf(query.toLowerCase());

  if (query_idx === -1) return text.substring(0, snippetLength);

  const start = Math.max(0, query_idx - snippetLength / 2);
  const end = Math.min(text.length, start + snippetLength);

  const snippet = text.substring(start, end);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";

  return prefix + snippet + suffix;
}
