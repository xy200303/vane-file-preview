/**
 * JSON 树视图预览插件
 * 支持折叠/展开、搜索、路径复制、大 JSON 流式加载
 */

import {
  FileInfo,
  softControlBarStyle,
  softFieldGroupStyle,
  softInputStyle,
  softLabelStyle,
  softMetaPillStyle,
  softSelectStyle,
  ToolbarButton,
  ToolbarContainer,
  ToolbarSeparator,
} from "./shared/ToolbarComponents";
import type { FilePreviewPlugin, PluginContext } from "../plugins/types";
import React, { useEffect, useMemo, useState } from "react";

import JsonView from "@uiw/react-json-view";
import { basicTheme } from "@uiw/react-json-view/basic";
import { darkTheme } from "@uiw/react-json-view/dark";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { githubLightTheme } from "@uiw/react-json-view/githubLight";
import { gruvboxTheme } from "@uiw/react-json-view/gruvbox";
import { lightTheme } from "@uiw/react-json-view/light";
import { monokaiTheme } from "@uiw/react-json-view/monokai";
import { nordTheme } from "@uiw/react-json-view/nord";
import { vscodeTheme } from "@uiw/react-json-view/vscode";

export interface JsonPreviewConfig {
  maxFileSize?: number; // 最大文件大小（字节）
  enableSearch?: boolean;
  enableCopy?: boolean;
  theme?:
    | "auto"
    | "light"
    | "dark"
    | "nord"
    | "githubLight"
    | "githubDark"
    | "vscode"
    | "gruvbox"
    | "monokai"
    | "basic";
  collapsed?: number; // 默认折叠层级，0表示全部展开
}

const searchResultsPanelStyle: React.CSSProperties = {
  background: "#f5f7fb",
  borderBottom: "1px solid #e8edf5",
  padding: "8px 16px",
  maxHeight: 220,
  overflowY: "auto",
};

const resultCardStyle: React.CSSProperties = {
  padding: "10px 14px",
  margin: "0 0 8px",
  background: "#ffffff",
  borderRadius: 16,
  fontSize: 11,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  boxShadow: "0 10px 30px rgba(148, 163, 184, 0.16)",
};

const compactActionButtonStyle: React.CSSProperties = {
  ...softInputStyle,
  minWidth: "auto",
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 600,
};

const JsonPreviewComponent: React.FC<{
  context: PluginContext;
  config?: JsonPreviewConfig;
}> = ({ context, config = {} }) => {
  const { file, state } = context;
  const {
    maxFileSize = 5 * 1024 * 1024, // 5MB
    enableSearch = true,
    enableCopy = true,
    theme = "light",
    collapsed = 0, // 默认全部展开
  } = config;

  const [jsonData, setJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  // 检测系统主题
  const getSystemTheme = () => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  };

  const [currentTheme, setCurrentTheme] = useState(
    theme === "auto" ? getSystemTheme() : theme
  );
  const [isValidJson, setIsValidJson] = useState(true);

  useEffect(() => {
    context.sharedData?.set("jsonPreviewData", jsonData);
  }, [context.sharedData, jsonData]);

  // 解析 JSON 数据
  useEffect(() => {
    if (state.state !== "loaded" || !file.url) return;

    const parseJson = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("📄 开始解析 JSON 文件:", file.url);
        console.log("📄 文件信息:", {
          name: file.name,
          size: file.size,
          type: file.type,
        });

        // 检查文件大小
        if (file.size && file.size > maxFileSize) {
          setError(
            `文件过大 (${(file.size / 1024 / 1024).toFixed(1)}MB)，超过限制 (${(
              maxFileSize /
              1024 /
              1024
            ).toFixed(1)}MB)`
          );
          return;
        }

        // 获取文件内容，添加更详细的错误处理
        console.log("📄 正在发起 fetch 请求...");
        const response = await fetch(file.url, {
          method: "GET",
          headers: {
            Accept: "application/json,text/plain,*/*",
          },
          cache: "no-cache",
        });

        console.log("📄 fetch 响应状态:", response.status, response.statusText);
        console.log(
          "📄 响应头:",
          Object.fromEntries(response.headers.entries())
        );

        if (!response.ok) {
          const errorText = await response
            .text()
            .catch(() => "无法读取错误信息");
          throw new Error(
            `HTTP ${response.status} ${response.statusText}: ${errorText}`
          );
        }

        const text = await response.text();
        console.log("📄 文件内容长度:", text.length);
        console.log(
          "📄 文件内容预览:",
          text.substring(0, 200) + (text.length > 200 ? "..." : "")
        );

        // 解析 JSON
        let parsedData;
        try {
          parsedData = JSON.parse(text);
          setIsValidJson(true);
        } catch (parseError: any) {
          console.error("❌ JSON 解析错误:", parseError);
          setError(`JSON 格式错误: ${parseError.message}`);
          setIsValidJson(false);
          return;
        }

        console.log("✅ JSON 解析完成:", {
          type: typeof parsedData,
          isArray: Array.isArray(parsedData),
          keys:
            typeof parsedData === "object" && parsedData !== null
              ? Object.keys(parsedData).length
              : 0,
        });

        setJsonData(parsedData);
      } catch (err: any) {
        console.error("❌ 文件加载错误:", err);
        setError(`文件加载失败: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    parseJson();
  }, [file.url, state.state, file.size, maxFileSize]);

  // 搜索功能
  const searchInJson = (data: any, term: string, path: string = ""): any[] => {
    const results: any[] = [];

    if (!term) return results;

    const searchRecursive = (obj: any, currentPath: string) => {
      if (
        typeof obj === "string" &&
        obj.toLowerCase().includes(term.toLowerCase())
      ) {
        results.push({
          path: currentPath,
          value: obj,
          type: "string",
        });
      } else if (typeof obj === "number" && obj.toString().includes(term)) {
        results.push({
          path: currentPath,
          value: obj,
          type: "number",
        });
      } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          searchRecursive(item, `${currentPath}[${index}]`);
        });
      } else if (obj && typeof obj === "object") {
        Object.keys(obj).forEach((key) => {
          if (key.toLowerCase().includes(term.toLowerCase())) {
            results.push({
              path: `${currentPath}.${key}`,
              value: key,
              type: "key",
            });
          }
          searchRecursive(
            obj[key],
            currentPath ? `${currentPath}.${key}` : key
          );
        });
      }
    };

    searchRecursive(data, path);
    return results;
  };

  // 搜索处理
  useEffect(() => {
    if (jsonData && searchTerm) {
      const results = searchInJson(jsonData, searchTerm);
      setSearchResults(results);
      console.log("🔍 搜索结果:", results);
    } else {
      setSearchResults([]);
    }
  }, [jsonData, searchTerm]);

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("📋 已复制到剪贴板:", text);
      })
      .catch((err) => {
        console.error("❌ 复制失败:", err);
      });
  };

  // 复制路径
  const copyPath = (path: string) => {
    copyToClipboard(path);
  };

  // 复制值
  const copyValue = (value: any) => {
    copyToClipboard(JSON.stringify(value, null, 2));
  };

  // 导出 JSON
  const exportJson = () => {
    if (!jsonData) return;

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = file.name.replace(/\.[^/.]+$/, ".json");
    link.click();
  };

  // 主题映射
  const getThemeStyle = (themeName: string) => {
    switch (themeName) {
      case "light":
        return lightTheme;
      case "dark":
        return darkTheme;
      case "nord":
        return nordTheme;
      case "githubLight":
        return githubLightTheme;
      case "githubDark":
        return githubDarkTheme;
      case "vscode":
        return vscodeTheme;
      case "gruvbox":
        return gruvboxTheme;
      case "monokai":
        return monokaiTheme;
      case "basic":
        return basicTheme;
      default:
        return lightTheme;
    }
  };

  // 主题切换
  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // 主题选择处理
  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTheme = event.target.value as any;
    if (selectedTheme === "auto") {
      setCurrentTheme(getSystemTheme());
    } else {
      setCurrentTheme(selectedTheme);
    }
  };

  // 获取主题显示名称
  const getThemeDisplayName = (themeName: string) => {
    const themeNames: Record<string, string> = {
      auto: "自动",
      light: "浅色",
      dark: "深色",
      nord: "Nord",
      githubLight: "GitHub 浅色",
      githubDark: "GitHub 深色",
      vscode: "VS Code",
      gruvbox: "Gruvbox",
      monokai: "Monokai",
      basic: "基础",
    };
    return themeNames[themeName] || themeName;
  };

  if (loading) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
          color: "#6c757d",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
          <div>Loading JSON...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
          color: "#dc3545",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
          <div>Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!jsonData) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
          color: "#6c757d",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
          <div>No JSON data available</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* 工具栏 */}
      <div
        style={{
          ...softControlBarStyle,
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            minWidth: 0,
            flex: "1 1 420px",
          }}
        >
          {enableSearch && (
            <div style={softFieldGroupStyle}>
              <input
                type="text"
                placeholder="搜索 JSON..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  ...softInputStyle,
                  width: 220,
                }}
              />
              {searchResults.length > 0 && (
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  {searchResults.length} 个结果
                </span>
              )}
            </div>
          )}

          <div style={softFieldGroupStyle}>
            <label htmlFor="theme-select" style={softLabelStyle}>
              主题
            </label>
            <select
              id="theme-select"
              value={currentTheme}
              onChange={handleThemeChange}
              style={{
                ...softSelectStyle,
                minWidth: 112,
              }}
            >
              <option value="auto">{getThemeDisplayName("auto")}</option>
              <option value="light">{getThemeDisplayName("light")}</option>
              <option value="dark">{getThemeDisplayName("dark")}</option>
              <option value="nord">{getThemeDisplayName("nord")}</option>
              <option value="githubLight">
                {getThemeDisplayName("githubLight")}
              </option>
              <option value="githubDark">
                {getThemeDisplayName("githubDark")}
              </option>
              <option value="vscode">{getThemeDisplayName("vscode")}</option>
              <option value="gruvbox">{getThemeDisplayName("gruvbox")}</option>
              <option value="monokai">{getThemeDisplayName("monokai")}</option>
              <option value="basic">{getThemeDisplayName("basic")}</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <div style={softMetaPillStyle}>
            {typeof jsonData === "object" && jsonData !== null
              ? Array.isArray(jsonData)
                ? `数组 (${jsonData.length} 项)`
                : `对象 (${Object.keys(jsonData).length} 属性)`
              : typeof jsonData}
          </div>
          <ToolbarButton
            onClick={exportJson}
            icon="📥"
            title="导出 JSON"
            variant="soft"
          >
            导出 JSON
          </ToolbarButton>
        </div>
      </div>

      {/* 搜索结果 */}
      {searchResults.length > 0 && (
        <div style={searchResultsPanelStyle}>
          <div
            style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#52607a" }}
          >
            搜索结果 ({searchResults.length}):
          </div>
          {searchResults.slice(0, 10).map((result, index) => (
            <div key={index} style={resultCardStyle}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontWeight: "500" }}>{result.path}</span>
                <span style={{ color: "#64748b", marginLeft: "8px" }}>
                  ({result.type})
                </span>
              </div>
              {enableCopy && (
                <button
                  onClick={() => copyPath(result.path)}
                  style={compactActionButtonStyle}
                >
                  复制路径
                </button>
              )}
            </div>
          ))}
          {searchResults.length > 10 && (
            <div
              style={{
                fontSize: 11,
                color: "#64748b",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              显示前 10 个结果，共 {searchResults.length} 个
            </div>
          )}
        </div>
      )}

      {/* JSON 查看器 */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          background: currentTheme === "dark" ? "#1a202c" : "white",
        }}
      >
        <div style={{ padding: "16px" }}>
          <JsonView
            value={jsonData}
            style={getThemeStyle(currentTheme)}
            displayDataTypes={false}
            displayObjectSize={true}
            enableClipboard={enableCopy}
            collapsed={false}
          />
        </div>
      </div>
    </div>
  );
};

export function createJsonPreviewPlugin(
  config?: JsonPreviewConfig
): FilePreviewPlugin {
  return {
    name: "JsonPreviewPlugin",
    version: "1.0.0",
    description: "JSON 树视图预览插件，支持折叠/展开、搜索、路径复制",
    supportedTypes: ["application/json", "text/json", "application/ld+json"],
    supportedExtensions: [".json", ".jsonld"],
    hooks: {
      getPriority: () => 6,
      render: (context) => {
        return <JsonPreviewComponent context={context} config={config} />;
      },
      getActions: (context) => ({
        download: () => {
          const link = document.createElement("a");
          link.href = context.file.url;
          link.download = context.file.name;
          link.click();
        },
        save: () => {
          const jsonValue = context.sharedData?.get("jsonPreviewData");

          if (jsonValue === undefined || jsonValue === null) {
            const link = document.createElement("a");
            link.href = context.file.url;
            link.download = context.file.name;
            link.click();
            return;
          }

          const jsonString = JSON.stringify(jsonValue, null, 2);
          const blob = new Blob([jsonString], { type: "application/json" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = context.file.name.replace(/\.[^/.]+$/, ".json");
          link.click();
        },
      }),
      renderToolbar: (context) => {
        const handleDownload = () => {
          const link = document.createElement("a");
          link.href = context.file.url;
          link.download = context.file.name;
          link.click();
        };

        return (
          <ToolbarContainer>
            <FileInfo
              name={context.file.name}
              size={context.file.size}
              type="JSON"
              icon="📄"
            />
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
