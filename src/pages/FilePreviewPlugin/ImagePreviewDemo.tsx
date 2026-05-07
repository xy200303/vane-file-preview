/**
 * 图片预览示例
 * 展示各种图片格式的预览功能
 */

import React, { useState } from "react";
import DemoPage from "./_layout/DemoPage";
import {
  FilePreviewCore,
  withPlugins,
  createImagePreviewPlugin,
  type FileInfo,
} from "vane-file-preview";

// 示例图片文件列表
const imageFiles: FileInfo[] = [
  {
    name: "sample.svg",
    size: 2 * 1024,
    type: "image/svg+xml",
    extension: ".svg",
    url: "./sample.svg",
  },
  {
    name: "sample.jpg",
    size: 44 * 1024,
    type: "image/jpeg",
    extension: ".jpg",
    url: "./sample.jpg",
  },
  {
    name: "sample.png",
    size: 132 * 1024,
    type: "image/png",
    extension: ".png",
    url: "./sample.png", // 使用现有图片作为示例
  },
  {
    name: "sample.gif",
    size: 102 * 1024,
    type: "image/gif",
    extension: ".gif",
    url: "./sample.gif", // 使用现有图片作为示例
  },
  {
    name: "sample.webp",
    size: 3 * 1024,
    type: "image/webp",
    extension: ".webp",
    url: "./sample.webp", // 使用现有图片作为示例
  },
];

export default function ImagePreviewDemo() {
  const [selectedFile, setSelectedFile] = useState<FileInfo>(imageFiles[0]);

  // 创建图片预览组件
  const Preview = withPlugins(FilePreviewCore, [
    createImagePreviewPlugin({
      // 可以配置图片预览的选项
      enableZoom: true,
      enableRotate: true,
      maxZoom: 3,
      minZoom: 0.5,
    }),
  ]);

  return (
    <DemoPage
      title="图片预览"
      description="展示各种图片格式的预览功能，支持 SVG、JPG、PNG、GIF、WebP 等格式"
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
        {/* 图片文件列表 */}
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
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>图片文件</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {imageFiles.map((file, index) => (
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
