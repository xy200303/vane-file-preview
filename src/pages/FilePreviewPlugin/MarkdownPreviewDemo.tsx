/**
 * Markdown预览示例
 * 展示Markdown文件的预览功能
 */

import React, { useState } from "react";
import DemoPage from "./_layout/DemoPage";
import {
  FilePreviewCore,
  withPlugins,
  createMarkdownPreviewPlugin,
  type FileInfo,
} from "vane-file-preview";

// 示例Markdown文件列表
const markdownFiles: FileInfo[] = [
  {
    name: "sample.md",
    size: 188 * 1024,
    type: "text/markdown",
    extension: ".md",
    url: "./sample.md",
  },
];

export default function MarkdownPreviewDemo() {
  const [selectedFile, setSelectedFile] = useState<FileInfo>(markdownFiles[0]);

  // 创建Markdown预览组件
  const Preview = withPlugins(FilePreviewCore, [
    createMarkdownPreviewPlugin({
      // 可以配置Markdown预览的选项
      showRaw: false,
      enableGfm: true,
      enableMath: true,
      enableSyntaxHighlight: true,
      enableBreaks: true,
      theme: "light",
    }),
  ]);

  return (
    <DemoPage
      title="Markdown预览"
      description="展示Markdown文件的预览功能，支持GitHub风格语法、数学公式、代码高亮等功能"
    >
      <div
        style={{
          display: "flex",
          height: "600px",
          gap: 16,
          padding: 16,
          boxSizing: "border-box",
        }}
      >
        {/* Markdown文件列表 */}
        <div
          style={{
            width: 240,
            background: "#f5f5f5",
            borderRadius: 8,
            padding: 16,
            overflow: "auto",
            flexShrink: 0,
          }}
        >
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Markdown文件</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {markdownFiles.map((file, index) => (
              <button
                key={index}
                onClick={() => setSelectedFile(file)}
                style={{
                  padding: "12px 16px",
                  background:
                    selectedFile.name === file.name ? "#2196f3" : "#fff",
                  color: selectedFile.name === file.name ? "#fff" : "#333",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontSize: 14,
                }}
              >
                <div style={{ fontWeight: 500 }}>{file.name}</div>
                <div
                  style={{
                    fontSize: 12,
                    marginTop: 4,
                    opacity: 0.8,
                  }}
                >
                  {file.extension} • {(file.size / 1024).toFixed(0)} KB
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 预览区域 */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Preview file={selectedFile} />
        </div>
      </div>
    </DemoPage>
  );
}
