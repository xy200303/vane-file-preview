/**
 * Office文档预览示例
 * 展示Office文档的预览功能，包括DOCX、XLSX、PPTX等
 */

import React, { useState, useMemo } from "react";
import DemoPage from "./_layout/DemoPage";
import {
  FilePreviewCore,
  withPlugins,
  createMammothDocxPlugin,
  createDocxPreviewPlugin,
  createXlsxPreviewPlugin,
  createPptxPreviewPlugin,
  createOfficePreviewPlugin,
  type FileInfo,
} from "vane-file-preview";

// 示例Office文件列表
const officeFiles: FileInfo[] = [
  {
    name: "sample-online.docx",
    size: 100 * 1024,
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extension: ".docx",
    url: "https://chinavane.netlify.app/test.docx",
    previewMode: "online", // 标记使用在线预览
  },
  {
    name: "sample-mammoth.docx",
    size: 21 * 1024,
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extension: ".docx",
    url: "./sample.docx",
    previewMode: "offline", // 标记使用离线预览
    docxMode: "mammoth", // 指定使用 mammoth 模式
  },
  {
    name: "sample-docx-preview.docx",
    size: 21 * 1024,
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extension: ".docx",
    url: "./sample.docx",
    previewMode: "offline", // 标记使用离线预览
    docxMode: "docx-preview", // 指定使用 docx-preview 模式
  },
  {
    name: "sample.xlsx",
    size: 13 * 1024,
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extension: ".xlsx",
    url: "./sample.xlsx",
  },
  {
    name: "sample.pptx",
    size: 2042 * 1024,
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    extension: ".pptx",
    url: "./sample.pptx",
  },
];

export default function OfficePreviewDemo() {
  const [selectedFile, setSelectedFile] = useState<FileInfo>(officeFiles[0]);
  const [preferOnlineDocx, setPreferOnlineDocx] = useState<boolean>(false);

  // 根据当前选择的文件决定插件配置
  const Preview = useMemo(() => {
    const isOnlineDocx = selectedFile.previewMode === "online";
    const isOfflineDocx = selectedFile.previewMode === "offline";
    const docxMode = selectedFile.docxMode || "mammoth"; // 默认使用 mammoth

    const plugins = [
      // Offline Office plugins - 根据文件类型启用/禁用
      createMammothDocxPlugin({
        enabled: isOfflineDocx && docxMode === "mammoth",
      }),
      createDocxPreviewPlugin({
        enabled: isOfflineDocx && docxMode === "docx-preview",
      }),
      createXlsxPreviewPlugin(),
      createPptxPreviewPlugin(),
      // Online Office viewer - 根据文件类型启用/禁用
      createOfficePreviewPlugin({
        preferDocxOnline: isOnlineDocx || (!isOfflineDocx && preferOnlineDocx),
        viewer: "google", // 直接使用 Google Docs Viewer，避免 Microsoft 连接问题
      }),
    ];
    return withPlugins(FilePreviewCore, plugins);
  }, [preferOnlineDocx, selectedFile]);

  return (
    <DemoPage
      title="Office文档预览"
      description="展示Office文档的预览功能，支持DOCX、XLSX、PPTX等格式，提供在线和离线两种预览模式"
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
        {/* Office文件列表 */}
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
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Office文件</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {officeFiles.map((file, index) => (
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
                {file.previewMode && (
                  <div
                    style={{
                      fontSize: 10,
                      marginTop: 2,
                      opacity: 0.7,
                      fontStyle: "italic",
                    }}
                  >
                    {file.previewMode === "online"
                      ? "在线预览"
                      : file.docxMode === "mammoth"
                      ? "离线预览 (Mammoth)"
                      : "离线预览 (docx-preview)"}
                  </div>
                )}
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
          {/* 简易切换控件 - 只在没有明确指定预览模式的 DOCX 文件时显示 */}
          {selectedFile.extension.toLowerCase() === ".docx" &&
            !selectedFile.previewMode && (
              <div style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                <label style={{ fontSize: 12, color: "#555" }}>
                  <input
                    type="checkbox"
                    checked={preferOnlineDocx}
                    onChange={(e) => setPreferOnlineDocx(e.target.checked)}
                    style={{ marginRight: 8 }}
                  />
                  Prefer online viewer for DOCX (Office Online)
                </label>
              </div>
            )}

          {/* 显示当前预览模式信息 */}
          {selectedFile.extension.toLowerCase() === ".docx" &&
            selectedFile.previewMode && (
              <div
                style={{
                  padding: 8,
                  borderBottom: "1px solid #eee",
                  background:
                    selectedFile.previewMode === "online"
                      ? "#e3f2fd"
                      : "#f3e5f5",
                  fontSize: 12,
                  color: "#555",
                }}
              >
                📄{" "}
                {selectedFile.previewMode === "online"
                  ? "在线预览 (Office Online)"
                  : `离线预览 (${
                      selectedFile.docxMode === "mammoth"
                        ? "Mammoth"
                        : "docx-preview"
                    })`}
              </div>
            )}
          <Preview file={selectedFile} />
        </div>
      </div>
    </DemoPage>
  );
}
