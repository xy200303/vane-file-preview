/**
 * 下载插件
 * 对于无法预览的文件类型，提供下载功能
 */

import type { FilePreviewPlugin } from "../plugins/types";
import React from "react";

export interface DownloadPluginConfig {
  autoDownload?: boolean;
  showFileInfo?: boolean;
}

export function createDownloadPlugin(
  config: DownloadPluginConfig = {}
): FilePreviewPlugin {
  const { autoDownload = false, showFileInfo = true } = config;

  return {
    name: "DownloadPlugin",
    version: "1.0.0",
    description: "Fallback plugin for downloading unsupported files",
    // 最低优先级，作为兜底方案
    supportedTypes: ["*/*"],
    supportedExtensions: [".*"],
    config,

    hooks: {
      // 最低优先级
      getPriority: () => -1,

      // 可以处理所有文件
      canHandle: () => true,

      render: (context) => {
        const { file, state } = context;

        React.useEffect(() => {
          if (autoDownload && state.state === "loaded") {
            const link = document.createElement("a");
            link.href = file.url;
            link.download = file.name;
            link.click();
          }
        }, [file, state.state]);

        const formatSize = (bytes: number): string => {
          if (bytes < 1024) return bytes + " B";
          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
          if (bytes < 1024 * 1024 * 1024)
            return (bytes / (1024 * 1024)).toFixed(2) + " MB";
          return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
        };

        const getFileIcon = (ext: string): string => {
          const iconMap: Record<string, string> = {
            ".zip": "📦",
            ".rar": "📦",
            ".7z": "📦",
            ".exe": "⚙️",
            ".dmg": "💿",
            ".iso": "💿",
            ".apk": "📱",
            ".db": "🗄️",
            ".sql": "🗄️",
            ".csv": "📊",
          };
          return iconMap[ext.toLowerCase()] || "📄";
        };

        const handleDownload = () => {
          const link = document.createElement("a");
          link.href = file.url;
          link.download = file.name;
          link.click();
        };

        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
            }}
          >
            {/* 文件图标 */}
            <div style={{ fontSize: 100, opacity: 0.9 }}>
              {getFileIcon(file.extension)}
            </div>

            {/* 文件信息 */}
            {showFileInfo && (
              <div
                style={{
                  textAlign: "center",
                  maxWidth: "80%",
                }}
              >
                <h2
                  style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 500 }}
                >
                  {file.name}
                </h2>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    justifyContent: "center",
                    fontSize: 14,
                    opacity: 0.9,
                  }}
                >
                  <span>{file.type || "Unknown type"}</span>
                  <span>•</span>
                  <span>{formatSize(file.size)}</span>
                </div>
              </div>
            )}

            {/* 下载按钮 */}
            <button
              onClick={handleDownload}
              style={{
                padding: "12px 32px",
                fontSize: 16,
                fontWeight: 500,
                color: "#667eea",
                background: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(0, 0, 0, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.15)";
              }}
            >
              📥 Download File
            </button>

            {/* 提示信息 */}
            <p
              style={{
                fontSize: 12,
                opacity: 0.7,
                margin: 0,
                textAlign: "center",
              }}
            >
              This file type cannot be previewed directly.
              <br />
              Click the button above to download.
            </p>
          </div>
        );
      },

      onLoadStart: (context) => {},
    },
  };
}
