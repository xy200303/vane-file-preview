/**
 * Docx 离线预览插件
 * 使用 docx-preview 库在浏览器中直接渲染 .docx 文件
 */

import * as docxPreview from "docx-preview";

import {
  FileInfo,
  ToolbarButton,
  ToolbarContainer,
  ToolbarSeparator,
} from "./shared/ToolbarComponents";
import type { FilePreviewPlugin, PluginContext } from "../plugins/types";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// docx-preview 组件
const DocxPreviewRenderer: React.FC<{
  arrayBuffer: ArrayBuffer;
  onError: (error: string) => void;
}> = ({ arrayBuffer, onError }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const renderDocx = async () => {
      if (!containerRef.current) return;

      try {
        // 清空容器
        containerRef.current.innerHTML = "";

        // 使用 docx-preview 渲染
        await docxPreview.renderAsync(arrayBuffer, containerRef.current);

        console.log("docx-preview rendered successfully");
      } catch (error) {
        console.error("docx-preview render error:", error);
        onError(error instanceof Error ? error.message : String(error));
      }
    };

    renderDocx();
  }, [arrayBuffer, onError]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        overflow: "auto",
        minHeight: "200px",
        background: "#f5f5f5",
      }}
    />
  );
};

export interface DocxPreviewPluginConfig {
  // Enable or disable this plugin entirely (use Office online viewer instead)
  enabled?: boolean;
}

const DocxPreviewComponent: React.FC<{
  context: PluginContext;
  config: DocxPreviewPluginConfig;
}> = ({ context, config }) => {
  const { file, state } = context;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);

  useEffect(() => {
    let aborted = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(file.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const arrayBuffer = await res.arrayBuffer();

        if (aborted) return;

        // docx-preview 模式 - 只存储 arrayBuffer，渲染由组件处理
        setArrayBuffer(arrayBuffer);
      } catch (e: any) {
        if (aborted) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    load();
    return () => {
      aborted = true;
    };
  }, [file.url]);

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
        <div>Loading DOCX (docx-preview)...</div>
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
          background: "#e3f2fd",
          fontSize: 12,
          color: "#555",
          borderBottom: "1px solid #eee",
        }}
      >
        📄 docx-preview 模式
      </div>

      {/* docx-preview 模式的样式 */}
      <style>
        {`
          /* docx-preview 基本样式 */
          .docx-preview-container {
            padding: 16px;
            background: #fff;
            color: #222;
            line-height: 1.7;
            font-size: 14px;
            min-height: 200px;
            font-family: Arial, sans-serif;
          }

          /* 确保所有元素可见 */
          .docx-preview-container * {
            box-sizing: border-box;
            visibility: visible !important;
            display: block !important;
          }

          /* 段落样式 */
          .docx-preview-container p {
            margin: 8px 0;
            display: block;
          }

          /* 标题样式 */
          .docx-preview-container h1,
          .docx-preview-container h2,
          .docx-preview-container h3 {
            margin: 16px 0 8px 0;
            font-weight: bold;
            display: block;
          }

          /* 表格样式 */
          .docx-preview-container table {
            border-collapse: collapse;
            width: 100%;
            margin: 12px 0;
            display: table;
          }

          .docx-preview-container td,
          .docx-preview-container th {
            border: 1px solid #ddd;
            padding: 6px 8px;
            display: table-cell;
          }
        `}
      </style>
      {arrayBuffer ? (
        <DocxPreviewRenderer
          arrayBuffer={arrayBuffer}
          onError={(error) => setError(error)}
        />
      ) : (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
          }}
        >
          No data available
        </div>
      )}
    </div>
  );
};

export function createDocxPreviewPlugin(
  config: DocxPreviewPluginConfig = {}
): FilePreviewPlugin {
  return {
    name: "DocxPreviewPlugin",
    version: "1.0.0",
    description: "Offline DOCX preview via docx-preview",
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
      getPriority: () => 7, // 低于 Mammoth 插件，高于在线 Office 预览
      render: (context) => {
        return <DocxPreviewComponent context={context} config={config} />;
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
              type="DOCX (docx-preview)"
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
