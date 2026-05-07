/**
 * 代码预览示例
 * 展示代码文件的预览功能，支持语法高亮
 */

import React, { useState } from "react";
import DemoPage from "./_layout/DemoPage";
import {
  FilePreviewCore,
  withPlugins,
  createCodePreviewPlugin,
  type FileInfo,
} from "vane-file-preview";

// 示例代码文件列表
const codeFiles: FileInfo[] = [
  {
    name: "sample.tsx",
    size: 6 * 1024,
    type: "text/typescript",
    extension: ".tsx",
    url: "./sample.tsx",
  },
  {
    name: "sample.js",
    size: 2 * 1024,
    type: "text/javascript",
    extension: ".js",
    url: "./sample.js",
  },
  {
    name: "sample.css",
    size: 2 * 1024,
    type: "text/css",
    extension: ".css",
    url: "./sample.css",
  },
  {
    name: "sample.ts",
    size: 2 * 1024,
    type: "text/typescript",
    extension: ".ts",
    url: "./sample.ts",
  },
  {
    name: "sample.html",
    size: 7 * 1024,
    type: "text/html",
    extension: ".html",
    url: "./sample.html",
  },
];

export default function CodePreviewDemo() {
  const [selectedFile, setSelectedFile] = useState<FileInfo>(codeFiles[0]);

  // 创建代码预览组件
  const Preview = withPlugins(FilePreviewCore, [
    createCodePreviewPlugin({
      // 可以配置代码预览的选项
      showLineNumbers: true,
      enableCopy: true,
    }),
  ]);

  return (
    <DemoPage
      title="代码预览"
      description="展示代码文件的预览功能，支持语法高亮、行号显示、复制、下载等功能"
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
        {/* 代码文件列表 */}
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
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>代码文件</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {codeFiles.map((file, index) => (
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
