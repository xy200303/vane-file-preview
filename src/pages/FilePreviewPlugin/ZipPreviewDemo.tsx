/**
 * ZIP预览示例
 * 展示ZIP文件的预览功能
 */

import React, { useState } from "react";
import DemoPage from "./_layout/DemoPage";
import {
  FilePreviewCore,
  withPlugins,
  createZipPreviewPlugin,
  type FileInfo,
} from "vane-file-preview";

// 示例ZIP文件列表
const zipFiles: FileInfo[] = [
  {
    name: "sample.zip",
    size: 96 * 1024,
    type: "application/zip",
    extension: ".zip",
    url: "./sample.zip",
  },
];

export default function ZipPreviewDemo() {
  const [selectedFile, setSelectedFile] = useState<FileInfo>(zipFiles[0]);

  // 创建ZIP预览组件
  const Preview = withPlugins(FilePreviewCore, [
    createZipPreviewPlugin({
      // 可以配置ZIP预览的选项
      showFileSize: true,
      maxFiles: 100,
    }),
  ]);

  return (
    <DemoPage
      title="ZIP预览"
      description="展示ZIP文件的预览功能，支持文件列表浏览、文件大小显示等功能"
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
        {/* ZIP文件列表 */}
        <div
          style={{
            width: 240,
            background: "#f5f5f5",
            borderRadius: 8,
            padding: 16,
            flexShrink: 0,
          }}
        >
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>ZIP文件</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {zipFiles.map((file, index) => (
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
                  {file.extension} • {(file.size / 1024 / 1024).toFixed(2)} MB
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
