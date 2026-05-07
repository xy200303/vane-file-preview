/**
 * FilePreviewPlugin 综合示例页
 * 展示所有文件预览功能，整合所有单独示例的内容
 */

import React, { useState, useMemo } from "react";
import DemoPage from "./_layout/DemoPage";
import {
  FilePreviewCore,
  withPlugins,
  createImagePreviewPlugin,
  createPdfPreviewPlugin,
  createVideoPreviewPlugin,
  createAudioPreviewPlugin,
  createCodePreviewPlugin,
  createMarkdownPreviewPlugin,
  createMammothDocxPlugin,
  createDocxPreviewPlugin,
  createXlsxPreviewPlugin,
  createPptxPreviewPlugin,
  createSimpleReactReaderEpubPlugin,
  createCsvPreviewPlugin,
  createJsonPreviewPlugin,
  createOfficePreviewPlugin,
  createZipPreviewPlugin,
  type FileInfo,
} from "@dev_xiaoyun/vane-file-preview";

// 示例文件列表 - 从各个单独示例文件中提取的准确 FileInfo 数据
const exampleFiles: FileInfo[] = [
  // 图片预览文件 (来自 ImagePreviewDemo.tsx)
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
    url: "./sample.png",
  },
  {
    name: "sample.gif",
    size: 102 * 1024,
    type: "image/gif",
    extension: ".gif",
    url: "./sample.gif",
  },

  // PDF预览文件 (来自 PdfPreviewDemo.tsx)
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
    url: "./danmu.pdf",
  },
  {
    name: "STAR法则",
    size: 101 * 1024,
    type: "application/pdf",
    extension: ".pdf",
    url: "./star.pdf",
  },

  // 视频预览文件 (来自 VideoPreviewDemo.tsx)
  {
    name: "mp4 sample",
    size: 2440 * 1024,
    type: "video/mp4",
    extension: ".mp4",
    url: "./sample.mp4",
  },
  {
    name: "webm sample",
    size: 2115 * 1024,
    type: "video/webm",
    extension: ".webm",
    url: "./sample.webm",
  },
  {
    name: "flv sample",
    size: 1031 * 1024,
    type: "video/flv",
    extension: ".flv",
    url: "./sample.flv",
  },

  // 音频预览文件 (来自 AudioPreviewDemo.tsx)
  {
    name: "mp3 sample",
    size: 2995 * 1024,
    type: "audio/mpeg",
    extension: ".mp3",
    url: "./sample.mp3",
  },
  {
    name: "wav sample",
    size: 1024 * 1024,
    type: "audio/wav",
    extension: ".wav",
    url: "./sample.wav",
  },
  {
    name: "ogg sample",
    size: 1695 * 1024,
    type: "audio/ogg",
    extension: ".ogg",
    url: "./sample.ogg",
  },

  // 代码预览文件 (来自 CodePreviewDemo.tsx)
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

  // Markdown预览文件 (来自 MarkdownPreviewDemo.tsx)
  {
    name: "sample.md",
    size: 188 * 1024,
    type: "text/markdown",
    extension: ".md",
    url: "./sample.md",
  },

  // Office文档预览文件 (来自 OfficePreviewDemo.tsx)
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

  // CSV预览文件 (来自 CsvPreviewDemo.tsx)
  {
    name: "sample-data.csv",
    size: 2048,
    type: "text/csv",
    extension: ".csv",
    url: "./sample-data.csv",
  },
  {
    name: "sales-data.tsv",
    size: 1536,
    type: "text/tab-separated-values",
    extension: ".tsv",
    url: "./sales-data.tsv",
  },
  {
    name: "sample-data-semicolon.csv",
    size: 1024,
    type: "text/csv",
    extension: ".csv",
    url: "./sample-data-semicolon.csv",
  },
  {
    name: "sample-data-pipe.csv",
    size: 896,
    type: "text/csv",
    extension: ".csv",
    url: "./sample-data-pipe.csv",
  },
  {
    name: "mixed-data.csv",
    size: 512,
    type: "text/csv",
    extension: ".csv",
    url: "./mixed-data.csv",
  },

  // JSON预览文件 (来自 JsonPreviewDemo.tsx)
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

  // ZIP预览文件 (来自 ZipPreviewDemo.tsx)
  {
    name: "sample.zip",
    size: 96 * 1024,
    type: "application/zip",
    extension: ".zip",
    url: "./sample.zip",
  },

  // EPUB预览文件 (来自 EpubPreviewDemo.tsx)
  {
    name: "sample.epub",
    size: 185 * 1024,
    type: "application/epub+zip",
    extension: ".epub",
    url: "./sample.epub",
  },
];

export default function FilePreviewExample() {
  const [selectedFile, setSelectedFile] = useState<FileInfo>(exampleFiles[0]);
  // Toggle: true -> use online Office viewer for DOCX; false -> use offline mammoth
  // 默认使用离线预览，避免本地文件无法被在线查看器访问的问题
  const [preferOnlineDocx, setPreferOnlineDocx] = useState<boolean>(false);

  const Preview = useMemo(() => {
    // 根据当前选择的文件决定插件配置
    const isOnlineDocx = selectedFile.previewMode === "online";
    const isOfflineDocx = selectedFile.previewMode === "offline";
    const docxMode = selectedFile.docxMode || "mammoth"; // 默认使用 mammoth

    const plugins = [
      createImagePreviewPlugin(),
      createPdfPreviewPlugin(),
      createVideoPreviewPlugin({ controls: true }),
      createAudioPreviewPlugin({ controls: true }),
      createCodePreviewPlugin({
        showLineNumbers: true,
      }),
      createMarkdownPreviewPlugin(),
      // Offline Office plugins - 根据文件类型启用/禁用
      createMammothDocxPlugin({
        enabled: isOfflineDocx && docxMode === "mammoth",
      }),
      createDocxPreviewPlugin({
        enabled: isOfflineDocx && docxMode === "docx-preview",
      }),
      createXlsxPreviewPlugin(),
      createPptxPreviewPlugin(),
      createSimpleReactReaderEpubPlugin(),
      createCsvPreviewPlugin({
        pageSize: 20,
        maxPreviewRows: 500,
        autoDetectDelimiter: true,
        autoDetectEncoding: true,
      }),
      createJsonPreviewPlugin({
        maxFileSize: 10 * 1024 * 1024, // 10MB
        enableSearch: true,
        enableCopy: true,
        theme: "light",
        collapsed: 2,
      }),
      // Online Office viewer - 根据文件类型启用/禁用
      createOfficePreviewPlugin({
        preferDocxOnline: isOnlineDocx || (!isOfflineDocx && preferOnlineDocx),
        viewer: "google", // 直接使用 Google Docs Viewer，避免 Microsoft 连接问题
      }),
      createZipPreviewPlugin(),
    ];
    return withPlugins(FilePreviewCore, plugins);
  }, [preferOnlineDocx, selectedFile]);

  return (
    <DemoPage
      title="综合示例"
      description="展示所有文件预览功能，包括图片、PDF、视频、音频、代码、Markdown、Office文档、CSV、JSON、ZIP、EPUB等文件类型的预览"
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
        {/* 文件列表 */}
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
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Files</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {exampleFiles.map((file, index) => (
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

