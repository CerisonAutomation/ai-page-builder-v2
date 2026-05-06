/**
 * Root Layout
 * Minimal layout that passes through to the locale-specific layout
 * All i18n handling is done in app/[locale]/layout.tsx
 */

export const metadata = {
  // Metadata is handled in app/[locale]/layout.tsx
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
