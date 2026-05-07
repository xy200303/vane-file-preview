/**
 * Mammoth DOCX 离线预览插件
 * 使用 mammoth 在浏览器中将 .docx 转换为 HTML
 */

import {
  FileInfo,
  ToolbarButton,
  ToolbarContainer,
  ToolbarSeparator,
} from "./shared/ToolbarComponents";
import type { FilePreviewPlugin, PluginContext } from "../plugins/types";
import React, { useEffect, useMemo, useState } from "react";

import mammoth from "mammoth/mammoth.browser";

// mammoth 官方提供了浏览器构建版本
// 在打包环境中建议使用 mammoth/mammoth.browser
// 类型声明可能缺失，运行时正常
// 类型声明文件在本项目中补充，防止 TS 报错

export interface MammothDocxPluginConfig {
  withDefaultStyle?: boolean;
  // Enable or disable this plugin entirely (use Office online viewer instead)
  enabled?: boolean;
}

const MammothDocxComponent: React.FC<{
  context: PluginContext;
  config: MammothDocxPluginConfig;
}> = ({ context, config }) => {
  const { file, state } = context;
  const [html, setHtml] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let aborted = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setMessages([]);

        const res = await fetch(file.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const arrayBuffer = await res.arrayBuffer();

        if (aborted) return;

        // Mammoth 模式
        const result = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            styleMap: [
              // 可根据需要追加样式映射
            ],
            includeDefaultStyleMap: config.withDefaultStyle !== false,
          }
        );

        if (aborted) return;
        setHtml(result.value || "");
        setMessages(
          (result.messages || []).map((m: any) =>
            String(m.message || m.value || m)
          )
        );
      } catch (e: any) {
        if (aborted) return;
        setError(e instanceof Error ? e.message : String(e));
        setHtml("");
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    load();
    return () => {
      aborted = true;
    };
  }, [file.url, config.withDefaultStyle]);

  const contentStyle = useMemo<React.CSSProperties>(
    () => ({
      padding: 16,
      background: "#fff",
      color: "#222",
      lineHeight: 1.7,
      fontSize: 14,
    }),
    []
  );

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
          gap: 12,
        }}
      >
        <div style={{ fontSize: 22 }}>📄</div>
        <div>Loading DOCX (Mammoth)...</div>
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
          gap: 12,
          color: "#d32f2f",
        }}
      >
        <div style={{ fontSize: 22 }}>❌</div>
        <div>Error loading DOCX: {error}</div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      {/* 预览模式指示器 */}
      <div
        style={{
          padding: "8px 16px",
          background: "#e8f5e8",
          fontSize: 12,
          color: "#555",
          borderBottom: "1px solid #eee",
        }}
      >
        📄 Mammoth 模式
      </div>

      {/* Mammoth 模式的样式 */}
      <style>
        {`
          .docx-content h1 { font-size: 24px; margin: 16px 0; }
          .docx-content h2 { font-size: 20px; margin: 14px 0; }
          .docx-content h3 { font-size: 18px; margin: 12px 0; }
          .docx-content p { margin: 8px 0; }
          .docx-content table { border-collapse: collapse; width: 100%; margin: 12px 0; }
          .docx-content th, .docx-content td { border: 1px solid #ddd; padding: 6px 8px; }
          .docx-content img { max-width: 100%; height: auto; }
          .docx-content ul, .docx-content ol { padding-left: 1.25em; }
        `}
      </style>
      <div
        className="docx-content"
        style={contentStyle}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {messages.length > 0 && (
        <div style={{ padding: 16, color: "#666", fontSize: 12 }}>
          <div style={{ marginBottom: 6 }}>Messages:</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {messages.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export function createMammothDocxPlugin(
  config: MammothDocxPluginConfig = {}
): FilePreviewPlugin {
  return {
    name: "MammothDocxPlugin",
    version: "1.0.0",
    description: "Offline DOCX preview via mammoth",
    supportedTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    supportedExtensions: [".docx"],
    config,
    hooks: {
      // Allow turning off this plugin when preferring online viewer
      canHandle: (file) => {
        if (config.enabled === false) return false;
        const isDocxExt = file.extension.toLowerCase() === ".docx";
        const isDocxMime =
          file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        return isDocxExt || isDocxMime;
      },
      getPriority: () => 8, // 高于在线 Office 预览
      render: (context) => {
        return <MammothDocxComponent context={context} config={config} />;
      },
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
              type="DOCX (Mammoth)"
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
