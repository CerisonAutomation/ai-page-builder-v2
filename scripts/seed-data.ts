/**
 * 🌱 AI Page Builder V2 — Comprehensive Seed Data
 * 
 * Generates realistic test data for:
 * - 5 sample pages (hero, features, pricing, blog, contact)
 * - 20 sample images with realistic CDN URLs
 * - All 10 block types in different configurations
 * - Version history for each page
 * - Complete audit log trail
 * - Real-time editor state snapshots
 * 
 * Usage:
 *   npm run db:seed
 * 
 * Or manually:
 *   npx tsx scripts/seed-data.ts
 */

import { v4 as uuid } from "uuid";

// ============================================================================
// 🎨 SAMPLE IMAGES (20 realistic CDN URLs)
// ============================================================================

const SAMPLE_IMAGES = [
  // Hero images
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80", // office team
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1920&q=80", // workspace
  "https://images.unsplash.com/photo-1559027615-cd58e6c61b8d?w=1920&q=80", // monitor
  
  // Feature images
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",   // team
  "https://images.unsplash.com/photo-1523289333684-401256e54e81?w=800&q=80", // productivity
  "https://images.unsplash.com/photo-1460925895917-aeb19be489ff?w=800&q=80", // analytics
  
  // Product showcase
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80", // laptop
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",    // design
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80", // mobile
  
  // Testimonial avatars
  "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=casey",
  
  // Gallery images
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&q=80", // workspace
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&q=80",   // office
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&q=80",   // team
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80", // desk
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&q=80",   // meeting
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80", // collab
];

// ============================================================================
// 📄 PAGE CONFIGURATIONS (5 pages with all 10 block types distributed)
// ============================================================================

interface PageConfig {
  slug: string;
  title: string;
  description: string;
  blocks: any[];
}

const PAGES: PageConfig[] = [
  // ========== PAGE 1: HERO (Landing Page) ==========
  {
    slug: "home",
    title: "AI Page Builder — Create Beautiful Pages with AI",
    description: "The fastest way to build landing pages, marketing sites, and content with AI-powered visual editing.",
    blocks: [
      {
        type: "HeroBlock",
        props: {
          headline: "Build Beautiful Pages in Minutes",
          subheadline:
            "Combine visual editing with AI-powered content generation. No coding required.",
          ctaLabel: "Start Building Free",
          ctaHref: "/signup",
          bgImage: SAMPLE_IMAGES[0],
          bgColor: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        },
      },
      {
        type: "StatsBlock",
        props: {
          stats: [
            { value: "50K+", label: "Pages Created", unit: "" },
            { value: "99.9%", label: "Uptime", unit: "" },
            { value: "10M+", label: "Blocks Rendered", unit: "" },
            { value: "24/7", label: "Support", unit: "" },
          ],
        },
      },
    ],
  },

  // ========== PAGE 2: FEATURES ==========
  {
    slug: "features",
    title: "Features — AI Page Builder V2",
    description: "Powerful features for modern web design and content creation.",
    blocks: [
      {
        type: "HeroBlock",
        props: {
          headline: "Powerful Features for Creators",
          subheadline: "Everything you need to build, design, and publish.",
          ctaLabel: "Explore All Features",
          ctaHref: "#features",
          bgColor: "#1e293b",
        },
      },
      {
        type: "CardGridBlock",
        props: {
          title: "Core Features",
          columns: 3,
          cards: [
            {
              title: "Visual Editor",
              body: "Drag-and-drop interface with real-time preview. Build without code.",
              icon: "🎨",
              href: "/docs/editor",
            },
            {
              title: "AI Content",
              body: "Generate headlines, copy, and layouts using Gemini AI.",
              icon: "✨",
              href: "/docs/ai",
            },
            {
              title: "100+ Blocks",
              body: "Hero, pricing, testimonials, FAQ, gallery, and more.",
              icon: "🧩",
              href: "/docs/blocks",
            },
            {
              title: "Version History",
              body: "Save snapshots and revert changes instantly.",
              icon: "⏮️",
              href: "/docs/versions",
            },
            {
              title: "Real-time Collab",
              body: "Work together with your team on the same page.",
              icon: "👥",
              href: "/docs/collab",
            },
            {
              title: "Analytics",
              body: "Track engagement and conversions on published pages.",
              icon: "📊",
              href: "/docs/analytics",
            },
          ],
        },
      },
      {
        type: "FeatureListBlock",
        props: {
          features: [
            {
              icon: "🔒",
              title: "Enterprise Security",
              description: "Row-level security, encrypted storage, SOC 2 compliant.",
            },
            {
              icon: "⚡",
              title: "Lightning Fast",
              description: "Pages load in <100ms. Optimized for Core Web Vitals.",
            },
            {
              icon: "📱",
              title: "Mobile Optimized",
              description: "Responsive by default. Works perfectly on all devices.",
            },
            {
              icon: "🌐",
              title: "SEO Ready",
              description: "Built-in meta tags, structured data, and sitemap generation.",
            },
          ],
        },
      },
    ],
  },

  // ========== PAGE 3: PRICING ==========
  {
    slug: "pricing",
    title: "Pricing — AI Page Builder V2",
    description: "Simple, transparent pricing. Choose the plan that fits your needs.",
    blocks: [
      {
        type: "HeroBlock",
        props: {
          headline: "Simple, Transparent Pricing",
          subheadline: "Start free. Scale as you grow. No credit card required.",
          ctaLabel: "View Plans",
          ctaHref: "#pricing",
          bgColor: "#1e293b",
        },
      },
      {
        type: "PricingBlock",
        props: {
          title: "Choose Your Plan",
          plans: [
            {
              name: "Starter",
              price: "$0",
              features: [
                "5 pages",
                "Basic blocks",
                "Community support",
                "Public pages",
                "Monthly exports",
              ],
              cta: "Get Started",
              ctaHref: "/signup?plan=starter",
              highlighted: false,
            },
            {
              name: "Pro",
              price: "$29",
              features: [
                "Unlimited pages",
                "All 10 block types",
                "AI content generation",
                "Version history",
                "Priority support",
                "Custom domain",
                "Analytics",
              ],
              cta: "Start 14-Day Trial",
              ctaHref: "/signup?plan=pro",
              highlighted: true,
            },
            {
              name: "Enterprise",
              price: "Custom",
              features: [
                "Everything in Pro",
                "Team collaboration",
                "API access",
                "Webhooks",
                "SLA support",
                "Dedicated account manager",
              ],
              cta: "Contact Sales",
              ctaHref: "/contact",
              highlighted: false,
            },
          ],
        },
      },
      {
        type: "FAQBlock",
        props: {
          title: "Frequently Asked Questions",
          items: [
            {
              question: "Can I try Pro for free?",
              answer:
                "Yes! All new accounts get a 14-day free trial of Pro with full access to all features.",
            },
            {
              question: "What payment methods do you accept?",
              answer:
                "We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.",
            },
            {
              question: "Can I cancel anytime?",
              answer:
                "Absolutely. Cancel anytime with no penalties. Your data remains accessible for 30 days.",
            },
            {
              question: "Do you offer discounts for annual plans?",
              answer:
                "Yes, annual plans get 2 months free. Contact our sales team for volume discounts.",
            },
          ],
        },
      },
    ],
  },

  // ========== PAGE 4: BLOG INDEX ==========
  {
    slug: "blog",
    title: "Blog — AI Page Builder V2",
    description: "Latest news, tips, and tutorials for modern web design.",
    blocks: [
      {
        type: "HeroBlock",
        props: {
          headline: "The Creator's Blog",
          subheadline: "Tips, trends, and tutorials for building with AI.",
          ctaLabel: "Subscribe",
          ctaHref: "/subscribe",
          bgColor: "#1e293b",
        },
      },
      {
        type: "GalleryBlock",
        props: {
          images: SAMPLE_IMAGES.slice(6, 12),
          columns: 3,
          gap: 4,
        },
      },
      {
        type: "TimelineBlock",
        props: {
          events: [
            {
              date: "May 2024",
              title: "AI Page Builder V2 Launched",
              body: "Full rewrite with better performance, more blocks, and improved AI.",
            },
            {
              date: "April 2024",
              title: "1M Pages Created",
              body: "Milestone celebration. Thanks to our amazing community!",
            },
            {
              date: "March 2024",
              title: "Team Collaboration Released",
              body: "Real-time editing for teams with conflict resolution.",
            },
            {
              date: "February 2024",
              title: "Gemini AI Integration",
              body: "AI-powered content generation now available to all users.",
            },
          ],
        },
      },
    ],
  },

  // ========== PAGE 5: CONTACT PAGE ==========
  {
    slug: "contact",
    title: "Contact Us — AI Page Builder V2",
    description: "Get in touch. We'd love to hear from you.",
    blocks: [
      {
        type: "HeroBlock",
        props: {
          headline: "Let's Talk",
          subheadline: "We're here to help. Reach out with questions or feedback.",
          ctaLabel: "Send Message",
          ctaHref: "#contact-form",
          bgColor: "#1e293b",
        },
      },
      {
        type: "CardGridBlock",
        props: {
          title: "Get in Touch",
          columns: 3,
          cards: [
            {
              title: "Email",
              body: "support@aipagebuilder.com",
              icon: "✉️",
              href: "mailto:support@aipagebuilder.com",
            },
            {
              title: "Chat",
              body: "Live support in app (9-5 EST)",
              icon: "💬",
              href: "#chat",
            },
            {
              title: "Status",
              body: "System status and uptime",
              icon: "📊",
              href: "https://status.aipagebuilder.com",
            },
          ],
        },
      },
      {
        type: "TestimonialBlock",
        props: {
          quotes: [
            {
              text: "AI Page Builder helped us launch our marketing site in 2 days instead of 2 weeks.",
              author: "Sarah Chen",
              role: "Founder, TechStartup",
              avatar: SAMPLE_IMAGES[9],
            },
            {
              text: "The visual editor is incredibly intuitive. Our non-technical team loves it.",
              author: "Alex Rodriguez",
              role: "Marketing Manager, Enterprise Co",
              avatar: SAMPLE_IMAGES[10],
            },
            {
              text: "Best investment in our marketing stack. Period.",
              author: "Jordan Blake",
              role: "CEO, Digital Agency",
              avatar: SAMPLE_IMAGES[11],
            },
          ],
        },
      },
      {
        type: "CTABlock",
        props: {
          headline: "Ready to Create Your First Page?",
          body: "Join thousands of creators, marketers, and developers building with AI.",
          primaryCta: "Start Free",
          primaryHref: "/signup",
          secondaryCta: "Watch Demo",
          secondaryHref: "https://youtube.com/watch?v=demo",
        },
      },
    ],
  },
];

// ============================================================================
// 🔐 USER FIXTURES (for auth.users references)
// ============================================================================

const TEST_USERS = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "alice@example.com",
    name: "Alice Johnson",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    email: "bob@example.com",
    name: "Bob Smith",
  },
];

// ============================================================================
// 📝 AUDIT LOG HELPER
// ============================================================================

function createAuditLog(
  pageId: string,
  action: "CREATE" | "UPDATE" | "PUBLISH",
  userId: string,
  changes?: any
) {
  return {
    id: uuid(),
    action,
    entity_type: "pages",
    entity_id: pageId,
    user_id: userId,
    changes: changes
      ? { old: changes.old, new: changes.new }
      : { message: `Page ${action.toLowerCase()}d` },
    created_at: new Date().toISOString(),
  };
}

// ============================================================================
// 🌱 SEED DATA GENERATOR
// ============================================================================

export function generateSeedData() {
  const pages: any[] = [];
  const pageVersions: any[] = [];
  const auditLogs: any[] = [];
  const media: any[] = [];

  const createdAt = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  let versionCounter = 0;

  // Create media records for images
  SAMPLE_IMAGES.forEach((url, index) => {
    media.push({
      id: uuid(),
      bucket_path: `media/${index}.jpg`,
      filename: `image-${index}.jpg`,
      mimetype: "image/jpeg",
      size: Math.floor(Math.random() * 500000) + 100000,
      width: 1920,
      height: 1280,
      alt_text: `Sample image ${index + 1}`,
      uploaded_by: TEST_USERS[0].id,
      created_at: new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      deleted_at: null,
    });
  });

  // Create pages with versions and audit logs
  PAGES.forEach((pageConfig, pageIndex) => {
    const pageId = uuid();
    const pageCreatedAt = new Date(
      createdAt.getTime() + pageIndex * 5 * 24 * 60 * 60 * 1000
    );
    const userId =
      TEST_USERS[pageIndex % TEST_USERS.length].id;

    // Convert blocks to Puck format
    const puckData = {
      content: pageConfig.blocks.map((block, idx) => ({
        _template: block.type,
        _id: `block-${idx}`,
        ...block.props,
      })),
      root: {
        props: {
          title: pageConfig.title,
          description: pageConfig.description,
        },
      },
    };

    // Main page record
    pages.push({
      id: pageId,
      slug: pageConfig.slug,
      title: pageConfig.title,
      description: pageConfig.description,
      data: JSON.stringify(puckData),
      published: Math.random() > 0.3,
      published_at: Math.random() > 0.3
        ? new Date(
            pageCreatedAt.getTime() + 2 * 24 * 60 * 60 * 1000
          ).toISOString()
        : null,
      created_by: userId,
      updated_by: userId,
      created_at: pageCreatedAt.toISOString(),
      updated_at: new Date(
        pageCreatedAt.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000
      ).toISOString(),
      deleted_at: null,
    });

    // Create 3-5 versions per page
    const versionCount = Math.floor(Math.random() * 3) + 3;
    for (let v = 0; v < versionCount; v++) {
      const versionData = {
        content: pageConfig.blocks
          .slice(0, Math.max(1, pageConfig.blocks.length - v))
          .map((block, idx) => ({
            _template: block.type,
            _id: `block-${idx}`,
            ...block.props,
          })),
        root: {
          props: {
            title: pageConfig.title,
            description: pageConfig.description,
          },
        },
      };

      pageVersions.push({
        id: uuid(),
        page_id: pageId,
        data: JSON.stringify(versionData),
        label: `Snapshot ${v + 1}`,
        created_by: userId,
        created_at: new Date(
          pageCreatedAt.getTime() + v * 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
      versionCounter++;
    }

    // Audit logs for each page
    auditLogs.push(
      createAuditLog(pageId, "CREATE", userId, {
        old: null,
        new: { title: pageConfig.title },
      })
    );

    if (Math.random() > 0.5) {
      auditLogs.push(
        createAuditLog(pageId, "UPDATE", userId, {
          old: { title: "Draft Title" },
          new: { title: pageConfig.title },
        })
      );
    }

    if (pages[pages.length - 1].published) {
      auditLogs.push(
        createAuditLog(pageId, "PUBLISH", userId, {
          old: { published: false },
          new: { published: true },
        })
      );
    }
  });

  return {
    pages,
    pageVersions,
    auditLogs,
    media,
    stats: {
      totalPages: pages.length,
      totalVersions: pageVersions.length,
      totalAuditLogs: auditLogs.length,
      totalMedia: media.length,
      blockTypesUsed: [
        "HeroBlock",
        "CardGridBlock",
        "FeatureListBlock",
        "StatsBlock",
        "CTABlock",
        "FAQBlock",
        "PricingBlock",
        "TestimonialBlock",
        "TimelineBlock",
        "GalleryBlock",
      ],
    },
  };
}

// ============================================================================
// 📊 EXPORT FUNCTIONS
// ============================================================================

/**
 * Generate TypeScript code for importing seed data
 */
export function generateTypeScriptExport() {
  const data = generateSeedData();
  return `// Auto-generated seed data
export const SEED_PAGES = ${JSON.stringify(data.pages, null, 2)};
export const SEED_PAGE_VERSIONS = ${JSON.stringify(
    data.pageVersions,
    null,
    2
  )};
export const SEED_AUDIT_LOGS = ${JSON.stringify(data.auditLogs, null, 2)};
export const SEED_MEDIA = ${JSON.stringify(data.media, null, 2)};
`;
}

/**
 * Generate SQL INSERT statements for Supabase
 */
export function generateSQLInserts() {
  const data = generateSeedData();
  let sql = `-- Auto-generated seed data for AI Page Builder V2
-- Generated: ${new Date().toISOString()}
-- Total pages: ${data.pages.length}
-- Total versions: ${data.pageVersions.length}
-- Total audit logs: ${data.auditLogs.length}
-- Total media: ${data.media.length}

-- Disable triggers temporarily
SET session_replication_role = replica;

`;

  // Media inserts
  sql += `-- ==================== MEDIA INSERTS ====================\n`;
  data.media.forEach((m) => {
    sql += `INSERT INTO media (id, bucket_path, filename, mimetype, size, width, height, alt_text, uploaded_by, created_at, deleted_at)
VALUES ('${m.id}', '${m.bucket_path}', '${m.filename}', '${m.mimetype}', ${m.size}, ${m.width}, ${m.height}, '${m.alt_text}', '${m.uploaded_by}', '${m.created_at}', ${m.deleted_at});
`;
  });

  // Pages inserts
  sql += `\n-- ==================== PAGES INSERTS ====================\n`;
  data.pages.forEach((p) => {
    const dataStr = JSON.stringify(p.data).replace(/'/g, "''");
    sql += `INSERT INTO pages (id, slug, title, description, data, published, published_at, created_by, updated_by, created_at, updated_at, deleted_at)
VALUES ('${p.id}', '${p.slug}', '${p.title.replace(/'/g, "''")}', '${(
      p.description || ""
    ).replace(/'/g, "''")}', '${dataStr}', ${p.published}, ${
      p.published_at ? `'${p.published_at}'` : "NULL"
    }, '${p.created_by}', '${p.updated_by}', '${p.created_at}', '${p.updated_at}', ${
      p.deleted_at ? `'${p.deleted_at}'` : "NULL"
    });
`;
  });

  // Page versions inserts
  sql += `\n-- ==================== PAGE VERSIONS INSERTS ====================\n`;
  data.pageVersions.forEach((pv) => {
    const dataStr = JSON.stringify(pv.data).replace(/'/g, "''");
    sql += `INSERT INTO page_versions (id, page_id, data, label, created_by, created_at)
VALUES ('${pv.id}', '${pv.page_id}', '${dataStr}', '${pv.label}', '${pv.created_by}', '${pv.created_at}');
`;
  });

  // Audit logs inserts
  sql += `\n-- ==================== AUDIT LOGS INSERTS ====================\n`;
  data.auditLogs.forEach((al) => {
    const changesStr = JSON.stringify(al.changes).replace(/'/g, "''");
    sql += `INSERT INTO audit_logs (id, action, entity_type, entity_id, user_id, changes, created_at)
VALUES ('${al.id}', '${al.action}', '${al.entity_type}', '${al.entity_id}', '${al.user_id}', '${changesStr}', '${al.created_at}');
`;
  });

  sql += `\n-- Re-enable triggers\nSET session_replication_role = DEFAULT;\n`;

  return sql;
}

// ============================================================================
// 🚀 CLI EXECUTION
// ============================================================================

if (require.main === module) {
  const data = generateSeedData();

  console.log("📊 AI Page Builder V2 — Seed Data Generated\n");
  console.log(`✅ Pages: ${data.pages.length}`);
  console.log(`✅ Versions: ${data.pageVersions.length}`);
  console.log(`✅ Audit Logs: ${data.auditLogs.length}`);
  console.log(`✅ Media: ${data.media.length}`);
  console.log(`\n🧩 Block Types Used:\n${data.stats.blockTypesUsed.map((b) => `   - ${b}`).join("\n")}`);

  // Save SQL to file
  const fs = require("fs");
  const sqlContent = generateSQLInserts();
  fs.writeFileSync(
    __dirname + "/../sql/seed-inserts.sql",
    sqlContent,
    "utf-8"
  );
  console.log(`\n💾 SQL inserts saved to: sql/seed-inserts.sql`);

  // Save TypeScript to file
  const tsContent = generateTypeScriptExport();
  fs.writeFileSync(
    __dirname + "/../lib/seed-data.ts",
    tsContent,
    "utf-8"
  );
  console.log(`💾 TypeScript export saved to: lib/seed-data.ts`);

  console.log(`\n🎉 Seed data generation complete!`);
  console.log(`\nTo apply SQL inserts to Supabase:`);
  console.log(`  1. Open Supabase dashboard`);
  console.log(`  2. Go to SQL Editor`);
  console.log(`  3. Copy and paste content from sql/seed-inserts.sql`);
  console.log(`  4. Execute`);
}

export default generateSeedData;
