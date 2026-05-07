/**
 * CSV预览示例
 * 展示CSV文件的预览功能
 */

import React, { useState } from "react";
import DemoPage from "./_layout/DemoPage";
import {
  FilePreviewCore,
  withPlugins,
  createCsvPreviewPlugin,
  type FileInfo,
} from "vane-file-preview";

// 示例CSV文件列表
const csvFiles: FileInfo[] = [
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
];

export default function CsvPreviewDemo() {
  const [selectedFile, setSelectedFile] = useState<FileInfo>(csvFiles[0]);

  // 创建CSV预览组件
  const Preview = withPlugins(FilePreviewCore, [
    createCsvPreviewPlugin({
      // 可以配置CSV预览的选项
      pageSize: 20,
      maxPreviewRows: 500,
      autoDetectDelimiter: true,
      autoDetectEncoding: true,
    }),
  ]);

  return (
    <DemoPage
      title="CSV预览"
      description="展示CSV文件的预览功能，支持自动分隔符检测、编码检测、分页、搜索等功能"
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
        {/* CSV文件列表 */}
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
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>CSV文件</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {csvFiles.map((file, index) => (
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
