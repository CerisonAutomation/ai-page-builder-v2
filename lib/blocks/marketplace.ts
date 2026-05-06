/**
 * Blocks Marketplace — Block Discovery & Catalog
 * ✅ Browse, search, install community blocks online
 */

import { z } from "zod";

/**
 * Block metadata for marketplace catalog
 */
export const BlockMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  label: z.string(),
  description: z.string(),
  category: z.enum([
    "Hero",
    "Content",
    "SocialProof",
    "Commerce",
    "CTA",
    "Media",
    "Custom",
  ]),
  version: z.string(),
  author: z.string(),
  authorUrl: z.string().optional(),
  license: z.string(),
  downloads: z.number(),
  rating: z.number().min(0).max(5),
  reviews: z.number(),
  featured: z.boolean(),
  github: z.string().optional(),
  npm: z.string().optional(),
  image: z.string(),
  tags: z.array(z.string()),
  previewUrl: z.string().optional(),
});

export type BlockMetadata = z.infer<typeof BlockMetadataSchema>;

/**
 * Core blocks (built-in)
 */
export const coreBlocks: BlockMetadata[] = [
  {
    id: "hero",
    name: "HeroBlock",
    label: "Hero",
    description: "Full-width hero section with headline and CTA",
    category: "Hero",
    version: "1.0.0",
    author: "AI Page Builder",
    authorUrl: "https://github.com/ai-page-builder",
    license: "MIT",
    downloads: 999999,
    rating: 4.9,
    reviews: 2847,
    featured: true,
    github: "https://github.com/ai-page-builder/blocks/hero",
    npm: "@ai-page-builder/blocks-hero",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400",
    tags: ["hero", "landing", "cta", "conversion"],
    previewUrl: "https://example.com/preview/hero",
  },
  {
    id: "cardgrid",
    name: "CardGridBlock",
    label: "Card Grid",
    description: "Display features/services in a responsive grid",
    category: "Content",
    version: "1.0.0",
    author: "AI Page Builder",
    license: "MIT",
    downloads: 850000,
    rating: 4.8,
    reviews: 2100,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
    tags: ["features", "grid", "cards", "layout"],
  },
  {
    id: "featurelist",
    name: "FeatureListBlock",
    label: "Feature List",
    description: "Vertical list of features with descriptions",
    category: "Content",
    version: "1.0.0",
    author: "AI Page Builder",
    license: "MIT",
    downloads: 650000,
    rating: 4.7,
    reviews: 1500,
    featured: false,
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400",
    tags: ["features", "list", "description", "benefits"],
  },
  {
    id: "stats",
    name: "StatsBlock",
    label: "Statistics",
    description: "Display metrics, numbers, and key statistics",
    category: "SocialProof",
    version: "1.0.0",
    author: "AI Page Builder",
    license: "MIT",
    downloads: 520000,
    rating: 4.6,
    reviews: 950,
    featured: false,
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
    tags: ["stats", "metrics", "numbers", "proof"],
  },
  {
    id: "cta",
    name: "CTABlock",
    label: "Call to Action",
    description: "Prominent call-to-action section",
    category: "CTA",
    version: "1.0.0",
    author: "AI Page Builder",
    license: "MIT",
    downloads: 780000,
    rating: 4.8,
    reviews: 1850,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400",
    tags: ["cta", "conversion", "button", "action"],
  },
  {
    id: "faq",
    name: "FAQBlock",
    label: "FAQ",
    description: "Frequently asked questions with expandable answers",
    category: "Content",
    version: "1.0.0",
    author: "AI Page Builder",
    license: "MIT",
    downloads: 610000,
    rating: 4.7,
    reviews: 1100,
    featured: false,
    image:
      "https://images.unsplash.com/photo-1455849318169-8381d3a853fa?w=400",
    tags: ["faq", "help", "accordion", "support"],
  },
  {
    id: "pricing",
    name: "PricingBlock",
    label: "Pricing",
    description: "Pricing table with multiple plans",
    category: "Commerce",
    version: "1.0.0",
    author: "AI Page Builder",
    license: "MIT",
    downloads: 920000,
    rating: 4.9,
    reviews: 2200,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1579621970563-fddb63c64892?w=400",
    tags: ["pricing", "plans", "commerce", "subscription"],
  },
  {
    id: "testimonial",
    name: "TestimonialBlock",
    label: "Testimonials",
    description: "Customer testimonials and reviews",
    category: "SocialProof",
    version: "1.0.0",
    author: "AI Page Builder",
    license: "MIT",
    downloads: 580000,
    rating: 4.6,
    reviews: 980,
    featured: false,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f70504504?w=400",
    tags: ["testimonials", "reviews", "proof", "social"],
  },
  {
    id: "timeline",
    name: "TimelineBlock",
    label: "Timeline",
    description: "Chronological timeline of events",
    category: "Content",
    version: "1.0.0",
    author: "AI Page Builder",
    license: "MIT",
    downloads: 380000,
    rating: 4.5,
    reviews: 520,
    featured: false,
    image:
      "https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=400",
    tags: ["timeline", "history", "events", "chronological"],
  },
  {
    id: "gallery",
    name: "GalleryBlock",
    label: "Gallery",
    description: "Responsive image gallery with grid layout",
    category: "Media",
    version: "1.0.0",
    author: "AI Page Builder",
    license: "MIT",
    downloads: 450000,
    rating: 4.7,
    reviews: 750,
    featured: false,
    image:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400",
    tags: ["gallery", "images", "grid", "portfolio"],
  },
];

/**
 * Community blocks (marketplace examples)
 */
export const communityBlocks: BlockMetadata[] = [
  {
    id: "countdown",
    name: "CountdownBlock",
    label: "Countdown Timer",
    description: "Countdown timer for launches or deadlines",
    category: "Custom",
    version: "1.2.1",
    author: "BuilderStudio",
    authorUrl: "https://builderstudio.dev",
    license: "MIT",
    downloads: 45000,
    rating: 4.4,
    reviews: 180,
    featured: false,
    github: "https://github.com/builderstudio/countdown-block",
    npm: "@builderstudio/countdown-block",
    image:
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400",
    tags: ["countdown", "timer", "launch", "deadline"],
  },
  {
    id: "video",
    name: "VideoBlock",
    label: "Video Player",
    description: "Embedded video player (YouTube, Vimeo, MP4)",
    category: "Media",
    version: "1.1.0",
    author: "MediaFlow",
    authorUrl: "https://mediaflow.dev",
    license: "MIT",
    downloads: 120000,
    rating: 4.8,
    reviews: 340,
    featured: true,
    npm: "@mediaflow/video-block",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400",
    tags: ["video", "player", "youtube", "media"],
  },
  {
    id: "form",
    name: "FormBlock",
    label: "Contact Form",
    description: "Customizable contact form with validation",
    category: "CTA",
    version: "2.0.5",
    author: "FormKit",
    license: "MIT",
    downloads: 280000,
    rating: 4.7,
    reviews: 560,
    featured: true,
    npm: "@formkit/form-block",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400",
    tags: ["form", "contact", "validation", "submission"],
  },
  {
    id: "newsletter",
    name: "NewsletterBlock",
    label: "Newsletter Signup",
    description: "Email capture with Mailchimp/ConvertKit integration",
    category: "CTA",
    version: "1.3.0",
    author: "GrowthHQ",
    license: "MIT",
    downloads: 95000,
    rating: 4.6,
    reviews: 210,
    featured: false,
    npm: "@growthhq/newsletter-block",
    image:
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400",
    tags: ["newsletter", "email", "signup", "growth"],
  },
  {
    id: "carousel",
    name: "CarouselBlock",
    label: "Image Carousel",
    description: "Swipeable image carousel with dots/arrows",
    category: "Media",
    version: "1.5.2",
    author: "SlideKit",
    license: "MIT",
    downloads: 165000,
    rating: 4.5,
    reviews: 380,
    featured: false,
    npm: "@slidekit/carousel-block",
    image:
      "https://images.unsplash.com/photo-1460925895917-adf4ee868993?w=400",
    tags: ["carousel", "slider", "images", "gallery"],
  },
  {
    id: "comparison",
    name: "ComparisonBlock",
    label: "Product Comparison",
    description: "Side-by-side product/plan comparison table",
    category: "Commerce",
    version: "1.0.8",
    author: "Commerce+",
    license: "MIT",
    downloads: 72000,
    rating: 4.6,
    reviews: 145,
    featured: false,
    npm: "@commerce-plus/comparison-block",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    tags: ["comparison", "products", "pricing", "table"],
  },
];

/**
 * Get all blocks (core + community)
 */
export function getAllBlocks(): BlockMetadata[] {
  return [...coreBlocks, ...communityBlocks];
}

/**
 * Search blocks by keyword
 */
export function searchBlocks(query: string): BlockMetadata[] {
  const lower = query.toLowerCase();
  return getAllBlocks().filter(
    (block) =>
      block.label.toLowerCase().includes(lower) ||
      block.description.toLowerCase().includes(lower) ||
      block.tags.some((tag) => tag.toLowerCase().includes(lower)) ||
      block.category.toLowerCase().includes(lower)
  );
}

/**
 * Get featured blocks
 */
export function getFeaturedBlocks(): BlockMetadata[] {
  return getAllBlocks()
    .filter((block) => block.featured)
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 6);
}

/**
 * Get blocks by category
 */
export function getBlocksByCategory(category: string): BlockMetadata[] {
  return getAllBlocks().filter((block) => block.category === category);
}

/**
 * Get most popular blocks
 */
export function getMostPopularBlocks(limit: number = 10): BlockMetadata[] {
  return getAllBlocks()
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, limit);
}

/**
 * Get highest rated blocks
 */
export function getTopRatedBlocks(limit: number = 10): BlockMetadata[] {
  return getAllBlocks()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}
