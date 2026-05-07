/**
 * EPUB预览示例
 * 展示EPUB电子书的预览功能
 */

import React, { useState } from "react";
import DemoPage from "./_layout/DemoPage";
import {
  FilePreviewCore,
  withPlugins,
  createSimpleReactReaderEpubPlugin,
  type FileInfo,
} from "vane-file-preview";

// 示例EPUB文件列表
const epubFiles: FileInfo[] = [
  {
    name: "sample.epub",
    size: 185 * 1024,
    type: "application/epub+zip",
    extension: ".epub",
    url: "./sample.epub",
  },
];

export default function EpubPreviewDemo() {
  const [selectedFile, setSelectedFile] = useState<FileInfo>(epubFiles[0]);

  // 创建EPUB预览组件
  const Preview = withPlugins(FilePreviewCore, [
    createSimpleReactReaderEpubPlugin(),
  ]);

  return (
    <DemoPage
      title="EPUB预览"
      description="展示EPUB电子书的预览功能，支持电子书阅读、目录导航等功能"
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
        {/* EPUB文件列表 */}
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
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>EPUB文件</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {epubFiles.map((file, index) => (
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
