/**
 * Office 文档预览插件
 * 使用 Microsoft Office Online Viewer 或 Google Docs Viewer
 */

import type { FilePreviewPlugin, PluginContext } from "../plugins/types";
import React, { useState } from "react";
import { createIsolatedContainer } from "./styles/isolatedStyles";

export interface OfficePreviewPluginConfig {
  viewer?: "microsoft" | "google" | "auto";
  showToolbar?: boolean;
  // Prefer to handle DOCX via online viewer instead of offline mammoth
  preferDocxOnline?: boolean;
}

// 独立的 React 组件，避免在 render 钩子中使用 useState
const OfficePreviewComponent: React.FC<{
  context: PluginContext;
  config: OfficePreviewPluginConfig;
}> = ({ context, config }) => {
  const { file, state } = context;
  const [error, setError] = useState<string | null>(null);
  const [currentViewer, setCurrentViewer] = useState<"microsoft" | "google">(
    "microsoft"
  );

  if (state.state !== "loaded" && state.state !== "loading") {
    return null;
  }

  // 生成预览 URL（确保为绝对地址）
  const getPreviewUrl = () => {
    // 将相对路径转换为绝对 URL（在线查看器无法解析相对路径）
    let absoluteUrl: string;
    try {
      absoluteUrl = new URL(file.url, window.location.origin).toString();
    } catch {
      absoluteUrl = file.url; // 兜底
    }

    const encodedUrl = encodeURIComponent(absoluteUrl);

    // Microsoft Office Online Viewer
    const microsoftUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;

    // Google Docs Viewer（备用）
    const googleUrl = `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;

    // 根据配置和当前状态选择查看器，添加默认值处理
    const viewer = config?.viewer || "auto";
    if (viewer === "google") {
      return googleUrl;
    } else if (viewer === "microsoft") {
      return microsoftUrl;
    } else {
      // auto 模式：优先使用 Microsoft，失败时切换到 Google
      return currentViewer === "microsoft" ? microsoftUrl : googleUrl;
    }
  };

  const handleError = () => {
    // 如果是 auto 模式且当前使用 Microsoft，尝试切换到 Google
    const viewer = config?.viewer || "auto";
    if (viewer === "auto" && currentViewer === "microsoft") {
      setCurrentViewer("google");
      setError(null);
    } else if (viewer === "microsoft") {
      // 如果明确指定使用 Microsoft 但失败，提供切换到 Google 的选项
      setError(
        "Microsoft Office Online Viewer is not available. Please try Google Docs Viewer instead."
      );
    } else {
      setError("Failed to load document preview");
    }
  };

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
          color: "#d32f2f",
        }}
      >
        <div style={{ fontSize: 24 }}>📄</div>
        <div>Error: {error}</div>
        <div style={{ fontSize: 12, color: "#666" }}>
          若在本地开发（localhost/127.0.0.1），在线查看器无法访问你的文件。
          请使用可公开访问的
          URL，或通过隧道工具（ngrok/localtunnel）暴露本地地址。
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setError(null)}
            style={{
              padding: "8px 16px",
              background: "#2196f3",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
          {(config?.viewer || "auto") === "auto" &&
            currentViewer === "microsoft" && (
              <button
                onClick={() => {
                  setCurrentViewer("google");
                  setError(null);
                }}
                style={{
                  padding: "8px 16px",
                  background: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Try Google Viewer
              </button>
            )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={createIsolatedContainer({
        background: "#f5f5f5",
      })}
    >
      {/* 当在本地开发时给出提示（绝对定位叠加，不参与布局） */}
      {(() => {
        const host = window.location.hostname;
        const isLocal = host === "localhost" || host === "127.0.0.1";
        if (!isLocal) return null;
        return (
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              zIndex: 2,
              padding: "8px 12px",
              background: "#fff3cd",
              color: "#8a6d3b",
              border: "1px solid #ffeeba",
              borderRadius: 4,
              fontSize: 12,
              pointerEvents: "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            提示：在线 Office 查看器无法读取本地地址（localhost）。
            如需预览，请将文件放到可公网访问的地址，或使用隧道工具暴露本地服务。
          </div>
        );
      })()}
      <iframe
        src={getPreviewUrl()}
        width="100%"
        height="100%"
        style={{ border: "none" }}
        onError={handleError}
        title={`Preview of ${file.name}`}
      />
    </div>
  );
};

export function createOfficePreviewPlugin(
  config: OfficePreviewPluginConfig = {}
): FilePreviewPlugin {
  const { viewer = "auto", showToolbar = true } = config;

  return {
    name: "OfficePreviewPlugin",
    version: "1.0.0",
    description: "Office documents preview via online viewers",
    supportedTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
      "application/msword", // .doc
      "application/vnd.ms-excel", // .xls
      "application/vnd.ms-powerpoint", // .ppt
    ],
    supportedExtensions: [".docx", ".xlsx", ".pptx", ".doc", ".xls", ".ppt"],
    config,

    hooks: {
      // If preferring DOCX online, increase priority for docx files
      getPriority: (file) => {
        const isDocx =
          file.extension.toLowerCase() === ".docx" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (config.preferDocxOnline && isDocx) return 9; // higher than DocxPreviewPlugin(8)
        return 7;
      },

      render: (context) => {
        return <OfficePreviewComponent context={context} config={config} />;
      },

      renderToolbar: (context) => {
        const handleDownload = () => {
          const link = document.createElement("a");
          link.href = context.file.url;
          link.download = context.file.name;
          link.click();
        };

        const getFileTypeIcon = (extension: string) => {
          if (extension.includes("doc")) return "📝";
          if (extension.includes("xls")) return "📊";
          if (extension.includes("ppt")) return "📽️";
          return "📄";
        };

        return (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#666", padding: "4px 8px" }}>
              {getFileTypeIcon(context.file.extension)} {context.file.name}
            </span>
            <button onClick={handleDownload} style={toolbarButtonStyle}>
              📥 Download
            </button>
          </div>
        );
      },
    },
  };
}

const toolbarButtonStyle: React.CSSProperties = {
  padding: "4px 12px",
  border: "1px solid #ddd",
  borderRadius: 4,
  background: "#fff",
  cursor: "pointer",
  fontSize: 14,
};
