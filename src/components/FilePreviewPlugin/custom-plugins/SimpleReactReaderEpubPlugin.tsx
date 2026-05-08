/**
 * 简化版 React Reader EPUB 预览插件
 * 使用最基本的配置来确保功能正常
 */

import {
  FileInfo,
  ToolbarButton,
  ToolbarContainer,
  ToolbarSeparator,
} from "./shared/ToolbarComponents";
import type { FilePreviewPlugin, PluginContext } from "../plugins/types";
import React, { useEffect, useState } from "react";

import { ReactReader } from "react-reader";

const SimpleReactReaderEpubComponent: React.FC<{
  context: PluginContext;
}> = ({ context }) => {
  const { file, state } = context;
  const [location, setLocation] = useState<string | number>(0);
  const [toc, setToc] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 监听文件变化
  useEffect(() => {
    if (state.state === "loaded" && file.url) {
      setLoading(false);
      setError(null);
      console.log("📚 简化版 React Reader 开始加载 EPUB:", file.url);
    } else if (state.state === "error") {
      setError("文件加载失败");
      setLoading(false);
    }
  }, [file.url, state.state]);

  // 处理位置变化
  const handleLocationChanged = (epubcfi: string) => {
    console.log("📍 阅读位置变化:", epubcfi);
    setLocation(epubcfi);
  };

  // 处理目录变化
  const handleTocChanged = (tocData: any[]) => {
    console.log("📑 目录更新:", tocData);
    setToc(tocData || []);
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
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
          <div>Loading EPUB...</div>
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

  if (!file.url) {
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
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
          <div>No EPUB file selected</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* 工具栏 */}
      <div
        style={{
          background: "#f8f9fa",
          borderBottom: "1px solid #dee2e6",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontWeight: "500", color: "#495057" }}>
          📚 {file.name}
        </span>
        <div style={{ flex: 1 }} />
        {toc.length > 0 && (
          <span style={{ fontSize: "14px", color: "#6c757d" }}>
            {toc.length} 章节
          </span>
        )}
      </div>

      {/* 阅读器 */}
      <div style={{ flex: 1, position: "relative" }}>
        <ReactReader
          url={file.url}
          location={location}
          locationChanged={handleLocationChanged}
          tocChanged={handleTocChanged}
          showToc={true}
          title={file.name}
        />
      </div>
    </div>
  );
};

export function createSimpleReactReaderEpubPlugin(): FilePreviewPlugin {
  return {
    name: "SimpleReactReaderEpubPlugin",
    version: "1.0.0",
    description: "简化版基于 react-reader 的 EPUB 电子书预览插件",
    supportedTypes: ["application/epub+zip", "application/x-epub+zip"],
    supportedExtensions: [".epub"],
    hooks: {
      getPriority: () => 8,
      render: (context) => {
        return <SimpleReactReaderEpubComponent context={context} />;
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
              type="EPUB"
              icon="📚"
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
