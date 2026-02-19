export const THEME_PREFERENCE = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark'
} as const;

export type ThemePreference = (typeof THEME_PREFERENCE)[keyof typeof THEME_PREFERENCE];

export const THEME_STORAGE_KEY = 'novel-task-tracker/theme';

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?: (key: string) => void;
}

export interface LoadThemePreferenceResult {
  preference: ThemePreference;
  skipInitialPersist: boolean;
}

function resolveStorage(storage?: StorageLike | null): StorageLike | null {
  if (storage !== undefined) {
    return storage;
  }

  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === THEME_PREFERENCE.SYSTEM || value === THEME_PREFERENCE.LIGHT || value === THEME_PREFERENCE.DARK;
}

export function loadThemePreferenceResult(storage?: StorageLike | null): LoadThemePreferenceResult {
  const resolvedStorage = resolveStorage(storage);

  if (!resolvedStorage || typeof resolvedStorage.getItem !== 'function') {
    return {
      preference: THEME_PREFERENCE.SYSTEM,
      skipInitialPersist: true
    };
  }

  try {
    const raw = resolvedStorage.getItem(THEME_STORAGE_KEY);

    if (raw === null) {
      return {
        preference: THEME_PREFERENCE.SYSTEM,
        skipInitialPersist: true
      };
    }

    if (isThemePreference(raw)) {
      return {
        preference: raw,
        skipInitialPersist: true
      };
    }
  } catch {
    return {
      preference: THEME_PREFERENCE.SYSTEM,
      skipInitialPersist: true
    };
  }

  return {
    preference: THEME_PREFERENCE.SYSTEM,
    skipInitialPersist: false
  };
}

export function persistThemePreference(preference: ThemePreference, storage?: StorageLike | null): void {
  const resolvedStorage = resolveStorage(storage);

  if (!resolvedStorage || typeof resolvedStorage.setItem !== 'function') {
    return;
  }

  try {
    resolvedStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // localStorage quota/security failures should not crash the app
  }
}

export function clearThemePreference(storage?: StorageLike | null): void {
  const resolvedStorage = resolveStorage(storage);

  if (!resolvedStorage || typeof resolvedStorage.removeItem !== 'function') {
    return;
  }

  try {
    resolvedStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    // localStorage quota/security failures should not crash the app
  }
}

export function applyThemePreference(preference: ThemePreference, root: HTMLElement = document.documentElement): void {
  if (preference === THEME_PREFERENCE.SYSTEM) {
    root.removeAttribute('data-theme');
    return;
  }

  root.setAttribute('data-theme', preference);
}
