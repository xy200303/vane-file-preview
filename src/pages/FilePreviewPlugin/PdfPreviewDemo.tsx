/**
 * PDF预览示例
 * 展示PDF文件的预览功能
 */

import React, { useState } from "react";
import DemoPage from "./_layout/DemoPage";
import {
  FilePreviewCore,
  withPlugins,
  createPdfPreviewPlugin,
  type FileInfo,
} from "vane-file-preview";

// 示例PDF文件列表
const pdfFiles: FileInfo[] = [
  {
    name: "白屏问题的处理",
    size: 107 * 1024,
    type: "application/pdf",
    extension: ".pdf",
    url: "./white-screen.pdf",
  },
  {
    name: "弹幕操作",
    size: 241 * 1024,
    type: "application/pdf",
    extension: ".pdf",
    url: "./danmu.pdf", // 使用现有PDF作为示例
  },
  {
    name: "STAR法则",
    size: 101 * 1024,
    type: "application/pdf",
    extension: ".pdf",
    url: "./star.pdf", // 使用现有PDF作为示例
  },
];

export default function PdfPreviewDemo() {
  const [selectedFile, setSelectedFile] = useState<FileInfo>(pdfFiles[0]);

  // 创建PDF预览组件
  const Preview = withPlugins(FilePreviewCore, [
    createPdfPreviewPlugin({
      // 可以配置PDF预览的选项
      useIframe: true,
      enableToolbar: true,
    }),
  ]);

  return (
    <DemoPage
      title="PDF预览"
      description="展示PDF文件的预览功能，支持工具栏、下载、打印、全屏等功能"
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
        {/* PDF文件列表 */}
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
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>PDF文件</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pdfFiles.map((file, index) => (
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
