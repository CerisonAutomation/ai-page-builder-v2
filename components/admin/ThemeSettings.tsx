/**
 * Theme Settings Section
 * Allows users to select and preview themes
 */

import ThemeSwitcher from './ThemeSwitcher';

export default function ThemeSettings() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Theme Settings</h2>
        <p className="text-gray-600 mt-1">
          Choose a theme to customize the visual appearance of your pages.
        </p>
      </div>

      <ThemeSwitcher />
    </div>
  );
}
