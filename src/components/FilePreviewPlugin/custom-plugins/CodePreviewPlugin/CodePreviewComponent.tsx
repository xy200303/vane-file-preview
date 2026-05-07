/**
 * 代码预览组件
 * 负责渲染代码内容和语法高亮
 */

import React, { memo, useEffect, useState } from "react";
import {
  detectLanguageFromFilename,
  getLanguageFromExtension,
} from "./languages";
import {
  getLanguagePreference,
  getUserPreferences,
  saveUserPreferences,
} from "./preferences";

import type { PluginContext } from "../../plugins/types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { getTheme } from "./themes";

interface CodePreviewComponentProps {
  context: PluginContext;
}

export const CodePreviewComponent: React.FC<CodePreviewComponentProps> = memo(
  ({ context }) => {
    const { file, state } = context;
    const [code, setCode] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState<string>("");
    const [selectedTheme, setSelectedTheme] = useState<string>("vs");
    const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
    const [wrapLongLines, setWrapLongLines] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    const lineCount = React.useMemo(
      () => (code ? code.split("\n").length : 0),
      [code]
    );

    // 加载代码文件
    useEffect(() => {
      const loadCode = async () => {
        try {
          const response = await fetch(file.url);
          const text = await response.text();
          setCode(text);
        } catch (error) {
          console.error("Failed to load code:", error);
          setCode("// Failed to load code file");
        } finally {
          setLoading(false);
        }
      };

      loadCode();
    }, [file.url]);

    // 初始化语言和主题（从用户偏好设置加载）- 只执行一次
    useEffect(() => {
      if (isInitialized) return; // 防止重复初始化

      const userPrefs = getUserPreferences();

      // 智能检测语言：优先使用文件名检测，然后扩展名
      let detectedLanguage = "";

      // 1. 尝试从完整文件名检测（如 Dockerfile, Makefile 等）
      const filenameDetected = detectLanguageFromFilename(file.name);
      if (filenameDetected) {
        detectedLanguage = filenameDetected;
      } else {
        // 2. 从扩展名检测
        detectedLanguage = getLanguageFromExtension(file.extension);
      }

      // 3. 自动检测优先，只有当前文件没有保存过语言偏好时才使用自动检测
      // 如果用户手动选择过语言，则使用用户选择的语言
      const savedLanguageForFile = getLanguagePreference(file.name);
      const finalLanguage = savedLanguageForFile || detectedLanguage;

      setSelectedLanguage(finalLanguage);

      // 加载主题偏好 - 优先使用 localStorage 中的用户偏好
      const storedTheme =
        userPrefs.theme ||
        (context.sharedData?.get("selectedSyntaxTheme") as string) ||
        "vs";

      setSelectedTheme(storedTheme);

      // 加载显示偏好
      const prefShowLineNumbers =
        userPrefs.showLineNumbers !== undefined
          ? userPrefs.showLineNumbers
          : true;
      const prefWrapLongLines =
        userPrefs.wrapLongLines !== undefined ? userPrefs.wrapLongLines : false;

      setShowLineNumbers(prefShowLineNumbers);
      setWrapLongLines(prefWrapLongLines);

      // 初始化共享数据 - 只设置一次，不重复 emit
      if (context.sharedData) {
        // 批量设置 sharedData，避免多次 emit
        const updates: Array<{ key: string; value: any; event?: string }> = [];

        if (context.sharedData.get("showLineNumbers") === undefined) {
          context.sharedData.set("showLineNumbers", prefShowLineNumbers);
          updates.push({ key: "showLineNumbers", value: prefShowLineNumbers });
        }
        if (context.sharedData.get("wrapLongLines") === undefined) {
          context.sharedData.set("wrapLongLines", prefWrapLongLines);
          updates.push({ key: "wrapLongLines", value: prefWrapLongLines });
        }
        if (context.sharedData.get("selectedSyntaxTheme") === undefined) {
          context.sharedData.set("selectedSyntaxTheme", storedTheme);
          updates.push({
            key: "selectedSyntaxTheme",
            value: storedTheme,
            event: "syntaxThemeChange",
          });
        }
        if (context.sharedData.get("selectedLanguage") === undefined) {
          context.sharedData.set("selectedLanguage", finalLanguage);
          updates.push({
            key: "selectedLanguage",
            value: finalLanguage,
            event: "languageChange",
          });
        }

        // 批量 emit 事件
        updates.forEach(({ key, value, event }) => {
          context.bus?.emit("sharedDataChanged", { key, value });
          if (event) {
            context.bus?.emit(event, {
              [key.replace("selected", "").toLowerCase()]: value,
            });
          }
        });
      }

      setIsInitialized(true); // 标记为已初始化
    }, [file.extension, file.name, isInitialized]);

    // 监听语言和主题变化事件
    useEffect(() => {
      const handleLanguageChange = (data: { language: string }) => {
        setSelectedLanguage(data.language);
      };

      const handleSyntaxThemeChange = (data: { syntaxTheme: string }) => {
        setSelectedTheme(data.syntaxTheme);
      };

      const handleToggleLineNumbers = (data: { showLineNumbers: boolean }) => {
        setShowLineNumbers(data.showLineNumbers);
      };

      const handleToggleWrapLongLines = (data: { wrapLongLines: boolean }) => {
        setWrapLongLines(data.wrapLongLines);
      };

      const unsubscribeLanguage = context.bus?.on(
        "languageChange",
        handleLanguageChange
      );
      const unsubscribeSyntaxTheme = context.bus?.on(
        "syntaxThemeChange",
        handleSyntaxThemeChange
      );
      const unsubscribeToggleLineNumbers = context.bus?.on(
        "toggleLineNumbers",
        handleToggleLineNumbers
      );
      const unsubscribeToggleWrapLongLines = context.bus?.on(
        "toggleWrapLongLines",
        handleToggleWrapLongLines
      );

      return () => {
        unsubscribeLanguage?.();
        unsubscribeSyntaxTheme?.();
        unsubscribeToggleLineNumbers?.();
        unsubscribeToggleWrapLongLines?.();
      };
    }, [context.bus]);

    // 同步状态到 sharedData（只在用户主动更改时保存）
    useEffect(() => {
      if (!isInitialized) return; // 初始化期间不保存

      if (selectedLanguage) {
        context.sharedData?.set("selectedLanguage", selectedLanguage);
        // 只在用户主动更改语言时保存，避免自动检测覆盖用户偏好
        saveUserPreferences({ language: selectedLanguage });
      }
    }, [selectedLanguage, isInitialized]);

    // 同步主题到 sharedData 并保存用户偏好
    useEffect(() => {
      if (!isInitialized) return; // 初始化期间不保存

      if (selectedTheme) {
        context.sharedData?.set("selectedSyntaxTheme", selectedTheme);
        saveUserPreferences({ theme: selectedTheme });
      }
    }, [selectedTheme, isInitialized]);

    // 同步显示选项到 sharedData 并保存用户偏好
    useEffect(() => {
      if (!isInitialized) return; // 初始化期间不保存

      context.sharedData?.set("showLineNumbers", showLineNumbers);
      saveUserPreferences({ showLineNumbers });
    }, [showLineNumbers, isInitialized]);

    useEffect(() => {
      if (!isInitialized) return; // 初始化期间不保存

      context.sharedData?.set("wrapLongLines", wrapLongLines);
      saveUserPreferences({ wrapLongLines });
    }, [wrapLongLines, isInitialized]);

    if (state.state !== "loaded" && state.state !== "loading") {
      return null;
    }

    if (loading) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 24 }}>💻</div>
          <div>Loading code...</div>
        </div>
      );
    }

    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          overflow: "auto",
          backgroundColor: "#f8f9fa",
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
        }}
      >
        <div
          style={{
            borderRadius: 6,
            margin: 8,
            overflow: "hidden",
            backgroundColor: "#fff",
            border: "1px solid #e1e4e8",
          }}
        >
          <div
            style={{
              padding: "8px 16px",
              fontSize: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f6f8fa",
              color: "#586069",
              borderBottom: "1px solid #e1e4e8",
            }}
          >
            <span>
              📝 {file.name} • {selectedLanguage}
            </span>
            <span>{lineCount} lines</span>
          </div>
          <div style={{ padding: 0, width: "100%" }}>
            <SyntaxHighlighter
              language={selectedLanguage}
              style={getTheme(selectedTheme)}
              showLineNumbers={showLineNumbers}
              wrapLines={wrapLongLines}
              wrapLongLines={wrapLongLines}
              customStyle={{
                margin: 0,
                padding: "16px",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 自定义比较函数：只比较关键属性，忽略 sharedData 的变化
    const prevContext = prevProps.context;
    const nextContext = nextProps.context;

    // 比较 file 对象
    if (
      prevContext.file.name !== nextContext.file.name ||
      prevContext.file.extension !== nextContext.file.extension ||
      prevContext.file.url !== nextContext.file.url ||
      prevContext.file.size !== nextContext.file.size
    ) {
      return false; // 文件变化，需要重新渲染
    }

    // 比较 state 对象
    if (prevContext.state.state !== nextContext.state.state) {
      return false; // 状态变化，需要重新渲染
    }

    // 忽略 sharedData 的变化，避免不必要的重新渲染
    return true; // 不需要重新渲染
  }
);
