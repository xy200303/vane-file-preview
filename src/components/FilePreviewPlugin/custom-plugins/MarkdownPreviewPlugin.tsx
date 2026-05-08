/**
 * Markdown 预览插件
 * 使用 react-markdown 和 remark-gfm 进行专业的 Markdown 解析
 */

// 移除全局 CSS 导入，避免影响整体页面样式
// import "highlight.js/styles/github.css";
// import "highlight.js/styles/github-dark.css";

import {
  FileInfo,
  softFieldGroupStyle,
  ToolbarButton,
  ToolbarContainer,
  ToolbarSeparator,
} from "./shared/ToolbarComponents";
import type { FilePreviewPlugin, PluginContext } from "../plugins/types";
import React, { useEffect, useState } from "react";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

export interface MarkdownPreviewPluginConfig {
  showRaw?: boolean;
  enableGfm?: boolean;
  enableMath?: boolean;
  enableSyntaxHighlight?: boolean;
  enableBreaks?: boolean;
  theme?: "light" | "dark";
}

// 独立的 React 组件，使用专业的 Markdown 解析库
const MarkdownPreviewComponent: React.FC<{
  context: PluginContext;
  config: MarkdownPreviewPluginConfig;
}> = ({ context, config }) => {
  const { file, state } = context;
  const [markdown, setMarkdown] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showRaw, setShowRaw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState(config.theme || "light");

  useEffect(() => {
    const loadMarkdown = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const text = await response.text();
        setMarkdown(text);
      } catch (error) {
        console.error("Failed to load markdown:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load markdown file"
        );
        setMarkdown("# Error\nFailed to load markdown file.");
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
  }, [file.url]);

  // 监听主题变化
  useEffect(() => {
    const unsubscribe = context.bus?.on("themeChange", (data: any) => {
      if (data.theme) {
        setCurrentTheme(data.theme);
      }
    });

    return unsubscribe;
  }, [context.bus]);

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
        <div style={{ fontSize: 24 }}>📝</div>
        <div>Loading markdown...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          flexDirection: "column",
          gap: 16,
          padding: 20,
        }}
      >
        <div style={{ fontSize: 24 }}>❌</div>
        <div style={{ textAlign: "center" }}>
          <h3>Error Loading Markdown</h3>
          <p style={{ color: "#666" }}>{error}</p>
        </div>
      </div>
    );
  }

  // 构建插件配置
  const remarkPlugins = [];
  const rehypePlugins = [];

  if (config.enableGfm !== false) {
    remarkPlugins.push(remarkGfm);
  }

  if (config.enableBreaks !== false) {
    remarkPlugins.push(remarkBreaks);
  }

  if (config.enableMath !== false) {
    remarkPlugins.push(remarkMath);
    rehypePlugins.push(rehypeKatex);
  }

  if (config.enableSyntaxHighlight !== false) {
    rehypePlugins.push([
      rehypeHighlight,
      {
        detect: true,
        ignoreMissing: true,
      },
    ] as any);
  }

  rehypePlugins.push(rehypeRaw);

  return (
    <div
      style={{
        padding: 16,
        background: currentTheme === "dark" ? "#1a1a1a" : "#fff",
        color: currentTheme === "dark" ? "#e0e0e0" : "#333",
      }}
    >
      {/* 动态加载代码高亮样式 */}
      <style>
        {currentTheme === "dark"
          ? `
            .hljs {
              background: #1e1e1e !important;
              color: #d4d4d4 !important;
            }
            .hljs-comment,
            .hljs-quote {
              color: #6a9955 !important;
              font-style: italic;
            }
            .hljs-keyword,
            .hljs-selector-tag,
            .hljs-subst {
              color: #569cd6 !important;
            }
            .hljs-number,
            .hljs-literal,
            .hljs-variable,
            .hljs-template-variable,
            .hljs-tag .hljs-attr {
              color: #b5cea8 !important;
            }
            .hljs-string,
            .hljs-doctag {
              color: #ce9178 !important;
            }
            .hljs-title,
            .hljs-section,
            .hljs-selector-id {
              color: #d7ba7d !important;
            }
            .hljs-subst {
              font-weight: normal;
            }
            .hljs-type,
            .hljs-class .hljs-title {
              color: #4ec9b0 !important;
            }
            .hljs-tag,
            .hljs-name,
            .hljs-attribute {
              color: #569cd6 !important;
              font-weight: normal;
            }
            .hljs-regexp,
            .hljs-link {
              color: #d16969 !important;
            }
            .hljs-symbol,
            .hljs-bullet {
              color: #d7ba7d !important;
            }
            .hljs-built_in,
            .hljs-builtin-name {
              color: #4ec9b0 !important;
            }
            .hljs-meta {
              color: #569cd6 !important;
            }
            .hljs-deletion {
              background: #fdd;
            }
            .hljs-addition {
              background: #dfd;
            }
            .hljs-emphasis {
              font-style: italic;
            }
            .hljs-strong {
              font-weight: bold;
            }
            pre {
              background: #1e1e1e !important;
              border-radius: 6px;
              padding: 16px;
              overflow-x: auto;
              margin: 16px 0;
            }
            code {
              background: #1e1e1e !important;
              color: #d4d4d4 !important;
              padding: 2px 4px;
              border-radius: 3px;
              font-size: 0.9em;
            }
          `
          : `
            .hljs {
              background: #f6f8fa !important;
              color: #24292e !important;
            }
            .hljs-comment,
            .hljs-quote {
              color: #6a737d !important;
              font-style: italic;
            }
            .hljs-keyword,
            .hljs-selector-tag,
            .hljs-subst {
              color: #d73a49 !important;
            }
            .hljs-number,
            .hljs-literal,
            .hljs-variable,
            .hljs-template-variable,
            .hljs-tag .hljs-attr {
              color: #005cc5 !important;
            }
            .hljs-string,
            .hljs-doctag {
              color: #032f62 !important;
            }
            .hljs-title,
            .hljs-section,
            .hljs-selector-id {
              color: #6f42c1 !important;
            }
            .hljs-subst {
              font-weight: normal;
            }
            .hljs-type,
            .hljs-class .hljs-title {
              color: #6f42c1 !important;
            }
            .hljs-tag,
            .hljs-name,
            .hljs-attribute {
              color: #22863a !important;
              font-weight: normal;
            }
            .hljs-regexp,
            .hljs-link {
              color: #032f62 !important;
            }
            .hljs-symbol,
            .hljs-bullet {
              color: #e36209 !important;
            }
            .hljs-built_in,
            .hljs-builtin-name {
              color: #005cc5 !important;
            }
            .hljs-meta {
              color: #6a737d !important;
            }
            .hljs-deletion {
              background: #ffeef0;
            }
            .hljs-addition {
              background: #f0fff4;
            }
            .hljs-emphasis {
              font-style: italic;
            }
            .hljs-strong {
              font-weight: bold;
            }
            pre {
              background: #f6f8fa !important;
              border-radius: 6px;
              padding: 16px;
              overflow-x: auto;
              margin: 16px 0;
            }
            code {
              background: #f6f8fa !important;
              color: #24292e !important;
              padding: 2px 4px;
              border-radius: 3px;
              font-size: 0.9em;
            }
          `}
      </style>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            ...softFieldGroupStyle,
            color: "#1f2a44",
          }}
        >
          {showRaw ? "原始内容" : "Markdown 预览"}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <ToolbarButton
            onClick={() => setShowRaw(!showRaw)}
            active={showRaw}
            variant="soft"
          >
            {showRaw ? "预览模式" : "原始内容"}
          </ToolbarButton>
        </div>
      </div>

      {showRaw ? (
        <pre
          style={{
            background: currentTheme === "dark" ? "#2a2a2a" : "#f5f5f5",
            padding: 16,
            borderRadius: 4,
            overflow: "auto",
            fontSize: 14,
            lineHeight: 1.5,
            color: currentTheme === "dark" ? "#e0e0e0" : "#333",
            border: `1px solid ${currentTheme === "dark" ? "#444" : "#ddd"}`,
          }}
        >
          {markdown}
        </pre>
      ) : (
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: currentTheme === "dark" ? "#e0e0e0" : "#333",
          }}
        >
          <ReactMarkdown
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
            components={{
              // 自定义表格样式
              table({ children, ...props }: any) {
                return (
                  <div style={{ overflowX: "auto", margin: "16px 0" }}>
                    <table
                      style={{
                        borderCollapse: "collapse",
                        width: "100%",
                        border: `1px solid ${
                          currentTheme === "dark" ? "#444" : "#ddd"
                        }`,
                      }}
                      {...props}
                    >
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children, ...props }: any) {
                return (
                  <th
                    style={{
                      border: `1px solid ${
                        currentTheme === "dark" ? "#444" : "#ddd"
                      }`,
                      padding: "8px 12px",
                      textAlign: "left",
                      backgroundColor:
                        currentTheme === "dark" ? "#333" : "#f5f5f5",
                      fontWeight: 600,
                    }}
                    {...props}
                  >
                    {children}
                  </th>
                );
              },
              td({ children, ...props }: any) {
                return (
                  <td
                    style={{
                      border: `1px solid ${
                        currentTheme === "dark" ? "#444" : "#ddd"
                      }`,
                      padding: "8px 12px",
                      textAlign: "left",
                    }}
                    {...props}
                  >
                    {children}
                  </td>
                );
              },
              // 自定义引用块样式
              blockquote({ children, ...props }: any) {
                return (
                  <blockquote
                    style={{
                      borderLeft: `4px solid ${
                        currentTheme === "dark" ? "#555" : "#ddd"
                      }`,
                      margin: "16px 0",
                      padding: "8px 16px",
                      backgroundColor:
                        currentTheme === "dark" ? "#2a2a2a" : "#f9f9f9",
                      fontStyle: "italic",
                      color: currentTheme === "dark" ? "#ccc" : "#666",
                    }}
                    {...props}
                  >
                    {children}
                  </blockquote>
                );
              },
              // 自定义链接样式
              a({ children, href, ...props }: any) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: currentTheme === "dark" ? "#4fc3f7" : "#0066cc",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = "none";
                    }}
                    {...props}
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export function createMarkdownPreviewPlugin(
  config: MarkdownPreviewPluginConfig = {}
): FilePreviewPlugin {
  const {
    showRaw = true,
    enableGfm = true,
    enableMath = true,
    enableSyntaxHighlight = true,
    enableBreaks = true,
    theme = "light",
  } = config;

  return {
    name: "MarkdownPreviewPlugin",
    version: "2.0.0",
    description:
      "Professional Markdown preview with react-markdown and remark-gfm",
    supportedTypes: ["text/markdown", "text/x-markdown"],
    supportedExtensions: [".md", ".markdown"],
    config,

    hooks: {
      getPriority: () => 9,

      render: (context) => {
        return <MarkdownPreviewComponent context={context} config={config} />;
      },

      getActions: (context) => ({
        download: () => {
          const link = document.createElement("a");
          link.href = context.file.url;
          link.download = context.file.name;
          link.click();
        },
        save: () => {
          const link = document.createElement("a");
          link.href = context.file.url;
          link.download = context.file.name;
          link.click();
        },
        toggleTheme: () => {
          const currentTheme = config.theme || "light";
          const newTheme = currentTheme === "light" ? "dark" : "light";
          config.theme = newTheme;
          context.bus?.emit("themeChange", { theme: newTheme });
        },
        setTheme: (theme: "light" | "dark") => {
          config.theme = theme;
          context.bus?.emit("themeChange", { theme });
        },
      }),

      renderToolbar: (context) => {
        const handleDownload = () => {
          const link = document.createElement("a");
          link.href = context.file.url;
          link.download = context.file.name;
          link.click();
        };

        const handleThemeToggle = () => {
          const currentTheme = config.theme || "light";
          const newTheme = currentTheme === "light" ? "dark" : "light";

          // 更新配置中的主题
          config.theme = newTheme;

          // 触发重新渲染
          context.bus?.emit("themeChange", { theme: newTheme });
        };

        const currentTheme = config.theme || "light";

        return (
          <ToolbarContainer>
            <FileInfo
              name={context.file.name}
              size={context.file.size}
              type="Markdown"
              icon="📝"
            />
            <ToolbarSeparator />
            <ToolbarButton
              onClick={handleThemeToggle}
              icon={currentTheme === "dark" ? "🌙" : "☀️"}
              title={`Switch to ${
                currentTheme === "light" ? "Dark" : "Light"
              } Theme`}
            >
              {currentTheme === "light" ? "Dark" : "Light"}
            </ToolbarButton>
            <ToolbarSeparator />
            <ToolbarButton
              onClick={handleDownload}
              icon="📥"
              title="Download Markdown File"
            >
              Download
            </ToolbarButton>
          </ToolbarContainer>
        );
      },
    },
  };
}
