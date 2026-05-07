/**
 * 压缩包预览插件
 * 显示压缩包内的文件列表
 */

import type { FilePreviewPlugin, PluginContext } from "../plugins/types";
import React, { useEffect, useMemo, useState } from "react";

import JSZip from "jszip";

export interface ZipPreviewPluginConfig {
  showFileSize?: boolean;
  maxFiles?: number;
}

interface ZipEntry {
  name: string;
  isDirectory: boolean;
  size: number;
}

// 独立的 React 组件，避免在 render 钩子中使用 useState
const ZipPreviewComponent: React.FC<{ context: PluginContext }> = ({
  context,
}) => {
  const { file, state } = context;
  const [entries, setEntries] = useState<ZipEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadZipEntries = async () => {
      try {
        setLoading(true);
        setError(null);

        // 拉取 zip 二进制数据
        const res = await fetch(file.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = await res.arrayBuffer();

        // 使用 JSZip 解析内容
        const zip = await JSZip.loadAsync(buf);

        const list: ZipEntry[] = Object.values(zip.files).map((f: any) => {
          // 尝试读取未压缩大小（JSZip 没有公开 API，只能做兼容处理）
          const size =
            (f?._data?.uncompressedSize as number | undefined) ??
            (f?._data?.compressedSize as number | undefined) ??
            0;
          return {
            name: f.name as string,
            isDirectory: !!f.dir,
            size,
          };
        });

        // 排序：目录在前，随后按名称
        list.sort((a, b) => {
          if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
          return a.name.localeCompare(b.name);
        });

        setEntries(list);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load zip");
      } finally {
        setLoading(false);
      }
    };

    loadZipEntries();
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
          gap: 16,
        }}
      >
        <div style={{ fontSize: 24 }}>📦</div>
        <div>Loading zip contents...</div>
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
          color: "#d32f2f",
        }}
      >
        <div style={{ fontSize: 24 }}>❌</div>
        <div>Error: {error}</div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 16,
        height: "100%",
        background: "#fafafa",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 16,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#333" }}>
          📦 {file.name}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map((entry, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                background: entry.isDirectory ? "#f0f0f0" : "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: 4,
                fontSize: 14,
              }}
            >
              <span style={{ marginRight: 8 }}>
                {entry.isDirectory ? "📁" : "📄"}
              </span>
              <span style={{ flex: 1, wordBreak: "break-all" }}>
                {entry.name}
              </span>
              {!entry.isDirectory && (
                <span style={{ color: "#666", fontSize: 12 }}>
                  {entry.size > 0
                    ? `${(entry.size / 1024).toFixed(1)} KB`
                    : "—"}
                </span>
              )}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#f5f5f5",
            borderRadius: 4,
            fontSize: 12,
            color: "#666",
          }}
        >
          说明：当前展示为 zip
          内容列表。若需要在线预览某些文本文件，可在此基础上按需增加点击后解析小文件的预览逻辑。
        </div>
      </div>
    </div>
  );
};

export function createZipPreviewPlugin(
  config: ZipPreviewPluginConfig = {}
): FilePreviewPlugin {
  const { showFileSize = true, maxFiles = 100 } = config;

  return {
    name: "ZipPreviewPlugin",
    version: "1.0.0",
    description: "Zip archive preview with file listing",
    supportedTypes: ["application/zip", "application/x-zip-compressed"],
    supportedExtensions: [".zip", ".rar", ".7z"],
    config,

    hooks: {
      getPriority: () => 8,

      render: (context) => {
        return <ZipPreviewComponent context={context} />;
      },

      renderToolbar: (context) => {
        const handleDownload = () => {
          const link = document.createElement("a");
          link.href = context.file.url;
          link.download = context.file.name;
          link.click();
        };

        return (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#666", padding: "4px 8px" }}>
              📦 {context.file.name}
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
