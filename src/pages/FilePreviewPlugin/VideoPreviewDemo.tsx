/**
 * 视频预览示例
 * 展示视频文件的预览功能
 */

import React, { useState } from "react";
import DemoPage from "./_layout/DemoPage";
import {
  FilePreviewCore,
  withPlugins,
  createVideoPreviewPlugin,
  type FileInfo,
} from "vane-file-preview";

// 示例视频文件列表
const videoFiles: FileInfo[] = [
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
];

export default function VideoPreviewDemo() {
  const [selectedFile, setSelectedFile] = useState<FileInfo>(videoFiles[0]);

  // 创建视频预览组件
  const Preview = withPlugins(FilePreviewCore, [
    createVideoPreviewPlugin({
      // 可以配置视频预览的选项
      controls: true,
      autoplay: false,
      muted: false,
      loop: false,
      preload: "metadata",
    }),
  ]);

  return (
    <DemoPage
      title="视频预览"
      description="展示视频文件的预览功能，支持 MP4、WebM 等格式，提供完整的播放控制"
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
        {/* 视频文件列表 */}
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
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>视频文件</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {videoFiles.map((file, index) => (
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
                  {file.extension} • {(file.size / 1024 / 1024).toFixed(1)} MB
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
