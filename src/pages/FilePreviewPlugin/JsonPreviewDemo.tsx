/**
 * JSON预览示例
 * 展示JSON文件的预览功能
 */

import React, { useState } from "react";
import DemoPage from "./_layout/DemoPage";
import {
  FilePreviewCore,
  withPlugins,
  createJsonPreviewPlugin,
  type FileInfo,
} from "vane-file-preview";

// 示例JSON文件列表
const jsonFiles: FileInfo[] = [
  {
    name: "sample.json",
    size: 2 * 1024,
    type: "application/json",
    extension: ".json",
    url: "./sample.json",
  },
  {
    name: "package.json",
    size: 1 * 1024,
    type: "application/json",
    extension: ".json",
    url: "./package.json",
  },
];

export default function JsonPreviewDemo() {
  const [selectedFile, setSelectedFile] = useState<FileInfo>(jsonFiles[0]);

  // 创建JSON预览组件
  const Preview = withPlugins(FilePreviewCore, [
    createJsonPreviewPlugin({
      // 可以配置JSON预览的选项
      maxFileSize: 10 * 1024 * 1024, // 10MB
      enableSearch: true,
      enableCopy: true,
      theme: "light",
      collapsed: 2,
    }),
  ]);

  return (
    <DemoPage
      title="JSON预览"
      description="展示JSON文件的预览功能，支持语法高亮、搜索、复制、下载、折叠等功能"
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
        {/* JSON文件列表 */}
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
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>JSON文件</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {jsonFiles.map((file, index) => (
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
