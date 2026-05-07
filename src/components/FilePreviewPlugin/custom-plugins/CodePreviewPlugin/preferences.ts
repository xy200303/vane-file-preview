/**
 * 用户偏好设置管理
 * 使用 localStorage 持久化存储用户的主题、显示选项等设置
 */

// 用户偏好设置存储键
const PREFS_STORAGE_KEY = "codePreviewPlugin_preferences";

// 用户偏好设置接口
export interface UserPreferences {
  theme?: string;
  showLineNumbers?: boolean;
  wrapLongLines?: boolean;
  language?: string;
}

/**
 * 保存用户偏好设置
 */
export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    const existing = getUserPreferences();
    const updated = { ...existing, ...prefs };
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn("Failed to save user preferences:", error);
  }
}

/**
 * 获取用户偏好设置
 */
export function getUserPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(PREFS_STORAGE_KEY);
    const result = stored ? JSON.parse(stored) : {};
    return result;
  } catch (error) {
    console.warn("Failed to load user preferences:", error);
    return {};
  }
}

/**
 * 语言偏好（按文件）
 * 使用 localStorage 在刷新后保持每个文件的语言选择
 */
const LANGUAGE_PREF_PREFIX = `${PREFS_STORAGE_KEY}_language_`;

export function setLanguagePreference(
  fileName: string,
  language: string
): void {
  try {
    localStorage.setItem(`${LANGUAGE_PREF_PREFIX}${fileName}`, language);
  } catch (error) {
    console.warn("Failed to save language preference:", error);
  }
}

export function getLanguagePreference(fileName: string): string | undefined {
  try {
    const value = localStorage.getItem(`${LANGUAGE_PREF_PREFIX}${fileName}`);
    return value || undefined;
  } catch (error) {
    console.warn("Failed to load language preference:", error);
    return undefined;
  }
}
