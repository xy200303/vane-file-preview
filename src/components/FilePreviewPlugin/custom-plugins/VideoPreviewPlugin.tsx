/**
 * 视频预览插件
 * 支持常见视频格式：mp4, webm, ogg 等
 */

import {
  FileInfo,
  ToolbarButton,
  ToolbarContainer,
  ToolbarSeparator,
} from "./shared/ToolbarComponents";

import type { FilePreviewPlugin } from "../plugins/types";
import React from "react";

export interface VideoPreviewPluginConfig {
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: "none" | "metadata" | "auto";
}

export function createVideoPreviewPlugin(
  config: VideoPreviewPluginConfig = {}
): FilePreviewPlugin {
  const {
    controls = true,
    autoplay = false,
    loop = false,
    muted = false,
    preload = "metadata",
  } = config;

  return {
    name: "VideoPreviewPlugin",
    version: "1.0.0",
    description: "Video preview with controls",
    supportedTypes: ["video/*"],
    supportedExtensions: [
      ".mp4",
      ".webm",
      ".ogg",
      ".mov",
      ".avi",
      ".wmv",
      ".flv",
      ".mkv",
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
              alignItems: "center",
              justifyContent: "center",
              background: "#000",
            }}
          >
            <video
              src={file.url}
              controls={controls}
              autoPlay={autoplay}
              loop={loop}
              muted={muted}
              preload={preload}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
              onError={(e) => {
                console.error("Video load error:", e);
              }}
            >
              Your browser does not support the video tag.
            </video>
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

        const getVideoType = (extension: string) => {
          const typeMap: Record<string, string> = {
            ".mp4": "MP4 Video",
            ".webm": "WebM Video",
            ".ogg": "OGG Video",
            ".mov": "QuickTime",
            ".avi": "AVI Video",
            ".wmv": "Windows Media",
            ".flv": "Flash Video",
            ".mkv": "Matroska Video",
          };
          return typeMap[extension.toLowerCase()] || "Video";
        };

        return (
          <ToolbarContainer>
            <FileInfo
              name={context.file.name}
              size={context.file.size}
              type={getVideoType(context.file.extension)}
              icon="🎬"
            />

            <ToolbarSeparator />

            <ToolbarButton
              onClick={handleDownload}
              icon="📥"
              title="Download Video"
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
