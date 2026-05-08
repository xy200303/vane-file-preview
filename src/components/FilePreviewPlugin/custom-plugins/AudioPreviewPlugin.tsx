/**
 * 音频预览插件
 * 支持常见音频格式：mp3, wav, ogg 等
 */

import {
  FileInfo,
  ToolbarButton,
  ToolbarContainer,
  ToolbarSeparator,
} from "./shared/ToolbarComponents";

import type { FilePreviewPlugin } from "../plugins/types";
import React from "react";

export interface AudioPreviewPluginConfig {
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  preload?: "none" | "metadata" | "auto";
}

export function createAudioPreviewPlugin(
  config: AudioPreviewPluginConfig = {}
): FilePreviewPlugin {
  const {
    controls = true,
    autoplay = false,
    loop = false,
    preload = "metadata",
  } = config;

  return {
    name: "AudioPreviewPlugin",
    version: "1.0.0",
    description: "Audio preview with controls",
    supportedTypes: ["audio/*"],
    supportedExtensions: [
      ".mp3",
      ".wav",
      ".ogg",
      ".m4a",
      ".aac",
      ".flac",
      ".wma",
    ],
    config,

    hooks: {
      getPriority: () => 10,

      render: (context) => {
        const { file, state } = context;

        if (state.state !== "loaded" && state.state !== "loading") {
          return null;
        }

        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {/* 音频图标 */}
            <div
              style={{
                fontSize: 80,
                opacity: 0.9,
              }}
            >
              🎵
            </div>

            {/* 音频控件 */}
            <audio
              src={file.url}
              controls={controls}
              autoPlay={autoplay}
              loop={loop}
              preload={preload}
              style={{
                width: "80%",
                maxWidth: 500,
              }}
              onError={(e) => {
                console.error("Audio load error:", e);
              }}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      },

      getActions: (context) => ({
        download: () => {
          const link = document.createElement("a");
          link.href = context.file.url;
          link.download = context.file.name;
          link.click();
        },
        save: () => {
          const link = document.createElement("a");
          link.href = context.file.url;
          link.download = context.file.name;
          link.click();
        },
      }),

      renderToolbar: (context) => {
        const handleDownload = () => {
          const link = document.createElement("a");
          link.href = context.file.url;
          link.download = context.file.name;
          link.click();
        };

        const formatSize = (bytes: number): string => {
          if (bytes < 1024) return bytes + " B";
          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
          return (bytes / (1024 * 1024)).toFixed(2) + " MB";
        };

        const getAudioType = (extension: string) => {
          const typeMap: Record<string, string> = {
            ".mp3": "MP3 Audio",
            ".wav": "WAV Audio",
            ".ogg": "OGG Audio",
            ".m4a": "M4A Audio",
            ".aac": "AAC Audio",
            ".flac": "FLAC Audio",
            ".wma": "Windows Media Audio",
          };
          return typeMap[extension.toLowerCase()] || "Audio";
        };

        return (
          <ToolbarContainer>
            <FileInfo
              name={context.file.name}
              size={context.file.size}
              type={getAudioType(context.file.extension)}
              icon="🎵"
            />

            <ToolbarSeparator />

            <ToolbarButton
              onClick={handleDownload}
              icon="📥"
              title="Download Audio"
            >
              Download
            </ToolbarButton>
          </ToolbarContainer>
        );
      },

      onLoadStart: (context) => {},
    },
  };
}

const toolbarButtonStyle: React.CSSProperties = {
  padding: "4px 12px",
  border: "1px solid #ddd",
  borderRadius: 4,
  background: "#fff",
  cursor: "pointer",
  fontSize: 14,
};
