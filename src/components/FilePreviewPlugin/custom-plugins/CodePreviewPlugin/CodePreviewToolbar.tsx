/**
 * 代码预览工具栏组件
 * 提供语言选择、主题选择、显示选项等功能
 */

import { AVAILABLE_LANGUAGES, getLanguageDisplayName } from "./languages";
import {
  FileInfo,
  ToolbarButton,
  ToolbarContainer,
  ToolbarSeparator,
} from "../shared/ToolbarComponents";
import React, { useEffect, useState } from "react";
import {
  getUserPreferences,
  saveUserPreferences,
  setLanguagePreference,
} from "./preferences";

import { AVAILABLE_THEMES } from "./themes";
import type { PluginContext } from "../../plugins/types";

interface CodePreviewToolbarProps {
  context: PluginContext;
  enableCopy?: boolean;
  enableLanguageSelection?: boolean;
  enableThemeSelection?: boolean;
}

export const CodePreviewToolbar: React.FC<CodePreviewToolbarProps> = ({
  context,
  enableCopy = true,
  enableLanguageSelection = true,
  enableThemeSelection = true,
}) => {
  // 从本地存储获取用户偏好作为初始值
  const userPrefs = getUserPreferences();

  // 本地状态，确保 sharedData 更新后工具栏可以即时反映
  const [copied, setCopiedLocal] = useState<boolean>(
    (context.sharedData?.get("codeCopied") as boolean) || false
  );
  const [selectedLanguage, setSelectedLanguageLocal] = useState<string>(
    (context.sharedData?.get("selectedLanguage") as string) || "javascript"
  );
  const [selectedSyntaxTheme, setSelectedSyntaxThemeLocal] = useState<string>(
    (context.sharedData?.get("selectedSyntaxTheme") as string) ||
      userPrefs.theme ||
      "vs"
  );
  const [showLineNumbers, setShowLineNumbersLocal] = useState<boolean>(
    (context.sharedData?.get("showLineNumbers") as boolean) ??
      userPrefs.showLineNumbers ??
      true
  );
  const [wrapLongLines, setWrapLongLinesLocal] = useState<boolean>(
    (context.sharedData?.get("wrapLongLines") as boolean) ??
      userPrefs.wrapLongLines ??
      false
  );

  const setCopied = (copied: boolean) => {
    context.sharedData?.set("codeCopied", copied);
    setCopiedLocal(copied);
  };

  const setLanguage = (language: string) => {
    context.sharedData?.set("selectedLanguage", language);
    setSelectedLanguageLocal(language);
    // 用户手动选择语言时，保存到 localStorage（针对当前文件）
    setLanguagePreference(context.file.name, language);
    context.bus?.emit("languageChange", { language });
    context.bus?.emit("sharedDataChanged", {
      key: "selectedLanguage",
      value: language,
    });
  };

  const setSyntaxTheme = (syntaxTheme: string) => {
    context.sharedData?.set("selectedSyntaxTheme", syntaxTheme);
    setSelectedSyntaxThemeLocal(syntaxTheme);
    context.bus?.emit("syntaxThemeChange", { syntaxTheme });
    context.bus?.emit("sharedDataChanged", {
      key: "selectedSyntaxTheme",
      value: syntaxTheme,
    });
    // 同步持久化主题偏好
    saveUserPreferences({ theme: syntaxTheme });
  };

  const setShowLineNumbers = (show: boolean) => {
    context.sharedData?.set("showLineNumbers", show);
    setShowLineNumbersLocal(show);
    context.bus?.emit("toggleLineNumbers", { showLineNumbers: show });
    context.bus?.emit("sharedDataChanged", {
      key: "showLineNumbers",
      value: show,
    });
    // 持久化显示行号偏好
    saveUserPreferences({ showLineNumbers: show });
  };

  const setWrapLongLines = (wrap: boolean) => {
    context.sharedData?.set("wrapLongLines", wrap);
    setWrapLongLinesLocal(wrap);
    context.bus?.emit("toggleWrapLongLines", { wrapLongLines: wrap });
    context.bus?.emit("sharedDataChanged", {
      key: "wrapLongLines",
      value: wrap,
    });
    // 持久化换行偏好
    saveUserPreferences({ wrapLongLines: wrap });
  };

  const handleCopy = async () => {
    try {
      const response = await fetch(context.file.url);
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = context.file.url;
    link.download = context.file.name;
    link.click();
  };

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLanguage(event.target.value);
  };

  const handleSyntaxThemeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSyntaxTheme(event.target.value);
  };

  // 监听来自组件的共享数据初始化与状态变化事件
  useEffect(() => {
    const offSharedChanged = context.bus?.on(
      "sharedDataChanged",
      (data: { key: string; value: unknown }) => {
        switch (data.key) {
          case "selectedLanguage":
            setSelectedLanguageLocal(String(data.value));
            break;
          case "selectedSyntaxTheme":
            setSelectedSyntaxThemeLocal(String(data.value));
            break;
          case "showLineNumbers":
            setShowLineNumbersLocal(Boolean(data.value));
            break;
          case "wrapLongLines":
            setWrapLongLinesLocal(Boolean(data.value));
            break;
          case "codeCopied":
            setCopiedLocal(Boolean(data.value));
            break;
          default:
            break;
        }
      }
    );

    const offLang = context.bus?.on(
      "languageChange",
      (d: { language: string }) => {
        setSelectedLanguageLocal(d.language);
      }
    );
    const offTheme = context.bus?.on(
      "syntaxThemeChange",
      (d: { syntaxTheme: string }) => {
        setSelectedSyntaxThemeLocal(d.syntaxTheme);
      }
    );
    const offLine = context.bus?.on(
      "toggleLineNumbers",
      (d: { showLineNumbers: boolean }) => {
        setShowLineNumbersLocal(d.showLineNumbers);
      }
    );
    const offWrap = context.bus?.on(
      "toggleWrapLongLines",
      (d: { wrapLongLines: boolean }) => {
        setWrapLongLinesLocal(d.wrapLongLines);
      }
    );

    return () => {
      offSharedChanged?.();
      offLang?.();
      offTheme?.();
      offLine?.();
      offWrap?.();
    };
  }, [context.bus]);

  // 首次渲染时，从本地存储加载用户偏好并同步到 sharedData
  useEffect(() => {
    const prefs = getUserPreferences();

    // 如果 sharedData 中没有值，则使用本地存储的偏好
    if (!context.sharedData?.get("selectedSyntaxTheme") && prefs.theme) {
      setSelectedSyntaxThemeLocal(prefs.theme);
      context.sharedData?.set("selectedSyntaxTheme", prefs.theme);
      context.bus?.emit("sharedDataChanged", {
        key: "selectedSyntaxTheme",
        value: prefs.theme,
      });
    }

    if (
      context.sharedData?.get("showLineNumbers") === undefined &&
      typeof prefs.showLineNumbers === "boolean"
    ) {
      setShowLineNumbersLocal(prefs.showLineNumbers);
      context.sharedData?.set("showLineNumbers", prefs.showLineNumbers);
      context.bus?.emit("sharedDataChanged", {
        key: "showLineNumbers",
        value: prefs.showLineNumbers,
      });
    }

    if (
      context.sharedData?.get("wrapLongLines") === undefined &&
      typeof prefs.wrapLongLines === "boolean"
    ) {
      setWrapLongLinesLocal(prefs.wrapLongLines);
      context.sharedData?.set("wrapLongLines", prefs.wrapLongLines);
      context.bus?.emit("sharedDataChanged", {
        key: "wrapLongLines",
        value: prefs.wrapLongLines,
      });
    }
  }, [context.sharedData, context.bus]);

  // 监听 sharedData 初始化完成事件
  useEffect(() => {
    const handleSharedDataInit = () => {
      const prefs = getUserPreferences();

      // 如果 sharedData 中有值，则使用 sharedData 的值
      const themeFromShared = context.sharedData?.get(
        "selectedSyntaxTheme"
      ) as string;
      const lineNumbersFromShared = context.sharedData?.get(
        "showLineNumbers"
      ) as boolean;
      const wrapLinesFromShared = context.sharedData?.get(
        "wrapLongLines"
      ) as boolean;

      if (themeFromShared) {
        setSelectedSyntaxThemeLocal(themeFromShared);
      } else if (prefs.theme) {
        setSelectedSyntaxThemeLocal(prefs.theme);
      }

      if (typeof lineNumbersFromShared === "boolean") {
        setShowLineNumbersLocal(lineNumbersFromShared);
      } else if (typeof prefs.showLineNumbers === "boolean") {
        setShowLineNumbersLocal(prefs.showLineNumbers);
      }

      if (typeof wrapLinesFromShared === "boolean") {
        setWrapLongLinesLocal(wrapLinesFromShared);
      } else if (typeof prefs.wrapLongLines === "boolean") {
        setWrapLongLinesLocal(prefs.wrapLongLines);
      }
    };

    // 延迟执行，确保 sharedData 已经初始化
    const timer = setTimeout(handleSharedDataInit, 100);

    return () => clearTimeout(timer);
  }, [context.sharedData, selectedSyntaxTheme, showLineNumbers, wrapLongLines]);

  return (
    <ToolbarContainer>
      <FileInfo
        name={context.file.name}
        size={context.file.size}
        type={getLanguageDisplayName(context.file.extension)}
        icon="📝"
      />

      <ToolbarSeparator />

      {enableLanguageSelection && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <label style={{ fontSize: 12, color: "#666", whiteSpace: "nowrap" }}>
            Language:
          </label>
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            style={{
              padding: "4px 8px",
              border: "1px solid #ddd",
              borderRadius: 4,
              fontSize: 12,
              background: "#fff",
              minWidth: 100,
            }}
          >
            {AVAILABLE_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {enableThemeSelection && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <label style={{ fontSize: 12, color: "#666", whiteSpace: "nowrap" }}>
            Theme:
          </label>
          <select
            value={selectedSyntaxTheme}
            onChange={handleSyntaxThemeChange}
            style={{
              padding: "4px 8px",
              border: "1px solid #ddd",
              borderRadius: 4,
              fontSize: 12,
              background: "#fff",
              minWidth: 120,
            }}
          >
            {AVAILABLE_THEMES.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <label style={{ fontSize: 12, color: "#666", whiteSpace: "nowrap" }}>
            Line Numbers:
          </label>
          <input
            type="checkbox"
            checked={showLineNumbers}
            onChange={(e) => setShowLineNumbers(e.target.checked)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <label style={{ fontSize: 12, color: "#666", whiteSpace: "nowrap" }}>
            Wrap Lines:
          </label>
          <input
            type="checkbox"
            checked={wrapLongLines}
            onChange={(e) => setWrapLongLines(e.target.checked)}
          />
        </div>
      </div>

      {enableCopy && (
        <ToolbarButton
          onClick={handleCopy}
          icon={copied ? "✓" : "📋"}
          title="Copy Code to Clipboard"
          active={copied}
        >
          {copied ? "Copied!" : "Copy"}
        </ToolbarButton>
      )}

      <ToolbarButton
        onClick={handleDownload}
        icon="📥"
        title="Download Code File"
      >
        Download
      </ToolbarButton>
    </ToolbarContainer>
  );
};
