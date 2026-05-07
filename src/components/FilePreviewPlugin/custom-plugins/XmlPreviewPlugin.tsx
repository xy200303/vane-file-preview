import {
  FileInfo,
  ToolbarButton,
  ToolbarContainer,
  ToolbarSeparator,
} from "./shared/ToolbarComponents";
import { FilePreviewPlugin, PluginContext } from "../../plugins/types";
import React, { useEffect, useMemo, useState } from "react";

import XmlViewer from "react-xml-viewer";

export interface XmlPreviewConfig {
  maxFileSize?: number; // 最大文件大小 (bytes)
  enableSearch?: boolean; // 是否启用搜索
  enableCopy?: boolean; // 是否启用复制
  enableFormat?: boolean; // 是否启用格式化
  enableValidation?: boolean; // 是否启用验证
  theme?: "light" | "dark" | "auto"; // 主题
  collapsedLevels?: number; // 默认折叠层级
  showAttributes?: boolean; // 是否显示属性
  showComments?: boolean; // 是否显示注释
  showProcessingInstructions?: boolean; // 是否显示处理指令
}

const defaultConfig: Required<XmlPreviewConfig> = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  enableSearch: true,
  enableCopy: true,
  enableFormat: true,
  enableValidation: true,
  theme: "auto",
  collapsedLevels: 2,
  showAttributes: true,
  showComments: true,
  showProcessingInstructions: true,
};

const XmlPreviewComponent: React.FC<{
  context: PluginContext;
  config: XmlPreviewConfig;
}> = ({ context, config }) => {
  const [xmlContent, setXmlContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  const mergedConfig = useMemo(
    () => ({ ...defaultConfig, ...config }),
    [config]
  );

  // 检测主题
  useEffect(() => {
    const detectTheme = () => {
      if (mergedConfig.theme === "auto") {
        const isDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setCurrentTheme(isDark ? "dark" : "light");
      } else {
        setCurrentTheme(mergedConfig.theme);
      }
    };

    detectTheme();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", detectTheme);
    return () => mediaQuery.removeEventListener("change", detectTheme);
  }, [mergedConfig.theme]);

  // 加载文件内容
  useEffect(() => {
    const loadFile = async () => {
      if (!context.file) return;

      setLoading(true);
      setError(null);

      try {
        // 检查文件大小
        if (context.file.size > mergedConfig.maxFileSize) {
          throw new Error(
            `文件过大，超过 ${Math.round(
              mergedConfig.maxFileSize / 1024 / 1024
            )}MB 限制`
          );
        }

        const response = await fetch(context.file.url);
        if (!response.ok) {
          throw new Error(`加载文件失败: ${response.statusText}`);
        }

        const content = await response.text();
        setXmlContent(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载文件失败");
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [context.file, mergedConfig.maxFileSize]);

  // 搜索功能
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const lines = xmlContent.split("\n");
    const results: number[] = [];
    const lowerTerm = term.toLowerCase();

    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(lowerTerm)) {
        results.push(index);
      }
    });

    setSearchResults(results);
  };

  // 复制到剪贴板
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      // 这里可以添加成功提示
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  // 格式化 XML
  const formatXml = () => {
    try {
      // 简单的 XML 格式化
      const formatted = xmlContent
        .replace(/></g, ">\n<")
        .replace(/^\s+|\s+$/g, "")
        .split("\n")
        .map((line, index, array) => {
          const trimmed = line.trim();
          if (!trimmed) return "";

          const depth = (line.match(/^\s*/)?.[0]?.length || 0) / 2;
          const indent = "  ".repeat(Math.max(0, depth));

          // 处理闭合标签的缩进
          if (trimmed.startsWith("</")) {
            const openTag = array
              .slice(0, index)
              .reverse()
              .find((l) => {
                const t = l.trim();
                return (
                  t.startsWith("<") &&
                  !t.startsWith("</") &&
                  !t.endsWith("/>") &&
                  !t.includes("?>") &&
                  !t.includes("<!--")
                );
              });
            if (openTag) {
              const openDepth = (openTag.match(/^\s*/)?.[0]?.length || 0) / 2;
              return "  ".repeat(Math.max(0, openDepth)) + trimmed;
            }
          }

          return indent + trimmed;
        })
        .join("\n");

      setXmlContent(formatted);
    } catch (err) {
      console.error("格式化失败:", err);
    }
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          color: currentTheme === "dark" ? "#7d8590" : "#586069",
        }}
      >
        加载中...
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          color: currentTheme === "dark" ? "#f85149" : "#d1242f",
          textAlign: "center",
          padding: "20px",
        }}
      >
        {error}
      </div>
    );
  }

  // 渲染空状态
  if (!xmlContent) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          color: currentTheme === "dark" ? "#7d8590" : "#586069",
        }}
      >
        无 XML 内容
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: currentTheme === "dark" ? "#0d1117" : "#ffffff",
      }}
    >
      {/* 搜索和操作栏 */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${
            currentTheme === "dark" ? "#30363d" : "#d0d7de"
          }`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: currentTheme === "dark" ? "#161b22" : "#f6f8fa",
        }}
      >
        {mergedConfig.enableSearch && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="text"
              placeholder="搜索 XML 内容..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                padding: "6px 12px",
                border: `1px solid ${
                  currentTheme === "dark" ? "#30363d" : "#d0d7de"
                }`,
                borderRadius: "6px",
                background: currentTheme === "dark" ? "#0d1117" : "#ffffff",
                color: currentTheme === "dark" ? "#e6edf3" : "#24292f",
                fontSize: "13px",
                width: "200px",
              }}
            />
            {searchResults.length > 0 && (
              <span
                style={{
                  fontSize: "12px",
                  color: currentTheme === "dark" ? "#7d8590" : "#586069",
                }}
              >
                找到 {searchResults.length} 个结果
              </span>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          {mergedConfig.enableFormat && (
            <button
              onClick={formatXml}
              title="格式化 XML"
              style={{
                padding: "6px 12px",
                border: `1px solid ${
                  currentTheme === "dark" ? "#30363d" : "#d0d7de"
                }`,
                borderRadius: "6px",
                background: currentTheme === "dark" ? "#21262d" : "#ffffff",
                color: currentTheme === "dark" ? "#e6edf3" : "#24292f",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              🎨 格式化
            </button>
          )}

          {mergedConfig.enableCopy && (
            <button
              onClick={copyToClipboard}
              title="复制 XML 内容"
              style={{
                padding: "6px 12px",
                border: `1px solid ${
                  currentTheme === "dark" ? "#30363d" : "#d0d7de"
                }`,
                borderRadius: "6px",
                background: currentTheme === "dark" ? "#21262d" : "#ffffff",
                color: currentTheme === "dark" ? "#e6edf3" : "#24292f",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              📋 复制
            </button>
          )}
        </div>
      </div>

      {/* XML 查看器 */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
        <XmlViewer
          xml={xmlContent}
          collapsible={true}
          indentSize={2}
          showLineNumbers={true}
          initialCollapsedDepth={undefined}
          theme={{
            // 标签名颜色
            tagColor: currentTheme === "dark" ? "#79c0ff" : "#0969da",
            // 属性名颜色
            attributeKeyColor: currentTheme === "dark" ? "#ffa657" : "#d73a49",
            // 属性值颜色
            attributeValueColor:
              currentTheme === "dark" ? "#a5d6ff" : "#032f62",
            // 文本内容颜色
            textColor: currentTheme === "dark" ? "#e6edf3" : "#24292f",
            // 注释颜色
            commentColor: currentTheme === "dark" ? "#7d8590" : "#6a737d",
            // CDATA 颜色
            cdataColor: currentTheme === "dark" ? "#7ee787" : "#28a745",
            // 分隔符颜色
            separatorColor: currentTheme === "dark" ? "#8b949e" : "#586069",
            // 字体
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
            // 行号背景色
            lineNumberBackground:
              currentTheme === "dark" ? "#161b22" : "#f6f8fa",
            // 行号颜色
            lineNumberColor: currentTheme === "dark" ? "#7d8590" : "#6a737d",
          }}
          style={{
            fontSize: "14px",
            lineHeight: "1.5",
            background: currentTheme === "dark" ? "#0d1117" : "#ffffff",
            borderRadius: "6px",
            border: `1px solid ${
              currentTheme === "dark" ? "#30363d" : "#d0d7de"
            }`,
          }}
        />
      </div>
    </div>
  );
};

export function createXmlPreviewPlugin(
  config: XmlPreviewConfig = {}
): FilePreviewPlugin {
  return {
    name: "xml-preview",
    supportedTypes: ["text/xml", "application/xml"],
    supportedExtensions: [".xml", ".rss", ".atom", ".svg", ".kml", ".gpx"],
    hooks: {
      render: (context: PluginContext) => (
        <XmlPreviewComponent context={context} config={config} />
      ),
      toolbar: (context: PluginContext) => {
        const { file } = context;
        const handleDownload = () => {
          const link = document.createElement("a");
          link.href = file.url;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        return (
          <ToolbarContainer>
            <FileInfo name={file.name} size={file.size} type="XML" icon="📄" />
            <ToolbarSeparator />
            <ToolbarButton onClick={handleDownload} icon="📥" title="Download">
              Download
            </ToolbarButton>
          </ToolbarContainer>
        );
      },
    },
  };
}
