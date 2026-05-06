import type { AllBlockProps } from "../types";

export const footerBlockFields = {
  logo: { type: "text", label: "Logo Image URL" },
  logoAlt: { type: "text", label: "Logo Alt Text" },
  columns: {
    type: "array",
    label: "Footer Columns",
    arrayFields: {
      title: { type: "text", label: "Column Title" },
      links: {
        type: "array",
        label: "Links",
        arrayFields: {
          label: { type: "text", label: "Link Label" },
          href: { type: "text", label: "Link URL" },
        },
      },
    },
  },
  copyright: { type: "text", label: "Copyright Text" },
  socialLinks: {
    type: "array",
    label: "Social Media Links",
    arrayFields: {
      platform: { type: "text", label: "Platform Name" },
      url: { type: "text", label: "Profile URL" },
    },
  },
  newsletterCta: { type: "select", label: "Show Newsletter Signup", options: [{ label: "No", value: "false" }, { label: "Yes", value: "true" }] },
  newsletterPlaceholder: { type: "text", label: "Newsletter Input Placeholder" },
};

export const footerBlockDefaultProps: AllBlockProps["FooterBlock"] = {
  columns: [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ],
  socialLinks: [
    { platform: "Twitter", url: "https://twitter.com" },
    { platform: "LinkedIn", url: "https://linkedin.com" },
  ],
  newsletterCta: false,
  newsletterPlaceholder: "Enter your email",
};
