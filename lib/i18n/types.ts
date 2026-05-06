/**
 * i18n TypeScript Types
 */

import type { Locale } from './config';

export type { Locale };

export interface Dictionary {
  // Navigation
  nav: {
    dashboard: string;
    pages: string;
    media: string;
    plugins: string;
    settings: string;
    pageBuilder: string;
  };

  // Admin Pages
  admin: {
    dashboard: {
      title: string;
      welcome: string;
      description: string;
    };
    pages: {
      title: string;
      description: string;
      createPage: string;
      editPage: string;
      deletePage: string;
      searchPages: string;
      noPages: string;
      pageTitle: string;
      slug: string;
      status: string;
      actions: string;
      draft: string;
      published: string;
      view: string;
      lastModified: string;
    };
    media: {
      title: string;
      description: string;
      upload: string;
      dragDrop: string;
      searchMedia: string;
      noMedia: string;
      delete: string;
      preview: string;
    };
    plugins: {
      title: string;
      description: string;
      installed: string;
      available: string;
      install: string;
      uninstall: string;
      configure: string;
    };
    settings: {
      title: string;
      description: string;
      general: string;
      seo: string;
      save: string;
      saved: string;
    };
  };

  // Editor
  editor: {
    title: string;
    untitled: string;
    saving: string;
    saved: string;
    publish: string;
    pageUpdated: string;
    pageCreated: string;
    pageTitleRequired: string;
    saveFailed: string;
    invalidResponse: string;
    failedToSave: string;
  };

  // AI Panel
  ai: {
    title: string;
    generatePage: string;
    generateBlock: string;
    refineText: string;
    promptPlaceholder: string;
    generating: string;
    generated: string;
    error: string;
    refine: string;
    cancel: string;
  };

  // Common
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    view: string;
    search: string;
    close: string;
    open: string;
    yes: string;
    no: string;
    confirm: string;
    back: string;
    next: string;
    submit: string;
    success: string;
    error: string;
    required: string;
    optional: string;
  };

  // Language Switcher
  language: {
    switchToEnglish: string;
    switchToSpanish: string;
    currentLanguage: string;
  };
}

export type DictionaryKey = keyof Dictionary;
