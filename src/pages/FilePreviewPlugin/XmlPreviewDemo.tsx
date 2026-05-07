import React, { useState } from "react";
import { FilePreviewCore, withPlugins, type FileInfo } from "vane-file-preview";
import { createXmlPreviewPlugin } from "../../components/FilePreviewPlugin/custom-plugins";
import DemoPage from "./_layout/DemoPage";

// 示例 XML 文件
const xmlFiles: FileInfo[] = [
  {
    name: "sample.xml",
    url: "/sample.xml",
    type: "text/xml",
    size: 1024,
    extension: ".xml",
  },
  {
    name: "sample.rss",
    url: "/sample.rss",
    type: "application/rss+xml",
    size: 2048,
    extension: ".rss",
  },
  {
    name: "sample.svg",
    url: "/sample.svg",
    type: "image/svg+xml",
    size: 512,
    extension: ".svg",
  },
];

const XmlPreviewDemo: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(
    xmlFiles[0]
  );

  // 创建带插件的预览组件
  const PreviewWithPlugins = withPlugins(FilePreviewCore, [
    createXmlPreviewPlugin({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      enableSearch: true,
      enableCopy: true,
      enableFormat: true,
      enableValidation: true,
      theme: "auto",
      collapsedLevels: 2,
      showAttributes: true,
      showComments: true,
      showProcessingInstructions: true,
    }),
  ]);

  return (
    <DemoPage
      title="XML 预览演示"
      description="使用 react-xml-viewer 展示 XML 文件的树形结构和语法高亮"
    >
      <div style={{ display: "flex", height: "100%", gap: "16px" }}>
        {/* 文件列表 */}
        <div
          style={{
            width: "300px",
            borderRight: "1px solid #e1e4e8",
            padding: "16px",
            background: "#f8f9fa",
            overflow: "auto",
          }}
        >
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>示例文件</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {xmlFiles.map((file) => (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                style={{
                  padding: "12px",
                  border: "1px solid #d0d7de",
                  borderRadius: "6px",
                  background:
                    selectedFile?.name === file.name ? "#0969da" : "#ffffff",
                  color:
                    selectedFile?.name === file.name ? "#ffffff" : "#24292f",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "14px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (selectedFile?.name !== file.name) {
                    e.currentTarget.style.background = "#f6f8fa";
                    e.currentTarget.style.borderColor = "#0969da";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedFile?.name !== file.name) {
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.borderColor = "#d0d7de";
                  }
                }}
              >
                <div style={{ fontWeight: "500", marginBottom: "4px" }}>
                  {file.name}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                  }}
                >
                  {file.type} • {(file.size / 1024).toFixed(1)} KB
                </div>
              </button>
            ))}
          </div>

          <div
            style={{
              marginTop: "24px",
              padding: "12px",
              background: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#856404",
            }}
          >
            <strong>功能特性：</strong>
            <ul style={{ margin: "8px 0 0 0", paddingLeft: "16px" }}>
              <li>树形结构展示</li>
              <li>语法高亮</li>
              <li>搜索功能</li>
              <li>格式化支持</li>
              <li>复制功能</li>
              <li>主题切换</li>
            </ul>
          </div>
        </div>

        {/* 预览区域 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {selectedFile ? (
            <PreviewWithPlugins file={selectedFile} />
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                color: "#586069",
                fontSize: "16px",
              }}
            >
              请选择一个 XML 文件进行预览
            </div>
          )}
        </div>
      </div>
    </DemoPage>
  );
};

export default XmlPreviewDemo;
