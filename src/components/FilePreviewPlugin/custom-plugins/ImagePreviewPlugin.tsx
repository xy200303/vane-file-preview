/**
 * 图片预览插件
 * 支持常见图片格式：jpg, png, gif, webp, svg 等
 */

import {
  FileInfo,
  ToolbarButton,
  ToolbarContainer,
  ToolbarSeparator,
} from "./shared/ToolbarComponents";
import type { FilePreviewPlugin, PluginContext } from "../plugins/types";
import React, { useState } from "react";

export interface ImagePreviewPluginConfig {
  enableZoom?: boolean;
  enableRotate?: boolean;
  maxZoom?: number;
  minZoom?: number;
}

const getImageScale = (context: PluginContext) =>
  Number(context.sharedData?.get("imageScale") || 1);

const getImageRotation = (context: PluginContext) =>
  Number(context.sharedData?.get("imageRotation") || 0);

const emitSharedDataChange = (
  context: PluginContext,
  key: string,
  value: unknown
) => {
  context.sharedData?.set(key, value);
  context.bus?.emit("sharedDataChanged", { key, value });
};

const setImageScale = (context: PluginContext, scale: number) => {
  emitSharedDataChange(context, "imageScale", scale);
  context.bus?.emit("zoom", { scale });
};

const setImageRotation = (context: PluginContext, rotation: number) => {
  emitSharedDataChange(context, "imageRotation", rotation);
  context.bus?.emit("rotate", { angle: rotation });
};

const downloadImageFile = (context: PluginContext) => {
  const link = document.createElement("a");
  link.href = context.file.url;
  link.download = context.file.name;
  link.click();
};

// 独立的 React 组件，避免在 render 钩子中使用 useState
const ImagePreviewComponent: React.FC<{ context: PluginContext }> = ({
  context,
}) => {
  const { file, state } = context;
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // 监听工具栏的状态变化
  React.useEffect(() => {
    const handleZoom = (data: { scale: number }) => {
      setScale(data.scale);
    };

    const handleRotate = (data: { angle: number }) => {
      setRotation(data.angle);
    };

    const handleReset = () => {
      setScale(1);
      setRotation(0);
    };

    const unsubscribeZoom = context.bus?.on("zoom", handleZoom);
    const unsubscribeRotate = context.bus?.on("rotate", handleRotate);
    const unsubscribeReset = context.bus?.on("reset", handleReset);

    return () => {
      unsubscribeZoom?.();
      unsubscribeRotate?.();
      unsubscribeReset?.();
    };
  }, [context.bus]);

  // 同步 sharedData 中的状态
  React.useEffect(() => {
    const sharedScale = context.sharedData?.get("imageScale");
    const sharedRotation = context.sharedData?.get("imageRotation");

    if (sharedScale !== undefined && sharedScale !== scale) {
      setScale(sharedScale);
    }
    if (sharedRotation !== undefined && sharedRotation !== rotation) {
      setRotation(sharedRotation);
    }
  }, [context.sharedData, scale, rotation]);

  // 将图片组件的状态同步回 sharedData
  React.useEffect(() => {
    context.sharedData?.set("imageScale", scale);
  }, [scale, context.sharedData]);

  React.useEffect(() => {
    context.sharedData?.set("imageRotation", rotation);
  }, [rotation, context.sharedData]);

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
        background: "#f5f5f5",
        overflow: "hidden",
      }}
    >
      <img
        src={file.url}
        alt={file.name}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          transform: `scale(${scale}) rotate(${rotation}deg)`,
          transition: "transform 0.2s ease",
          cursor: "zoom-in",
        }}
        onLoad={() => {}}
        onError={(e) => {
          console.error(`[ImagePreviewPlugin] Image load error:`, e);
        }}
      />
    </div>
  );
};

export function createImagePreviewPlugin(
  config: ImagePreviewPluginConfig = {}
): FilePreviewPlugin {
  const {
    enableZoom = true,
    enableRotate = true,
    maxZoom = 5,
    minZoom = 0.1,
  } = config;

  return {
    name: "ImagePreviewPlugin",
    version: "1.0.0",
    description: "Image preview with zoom and rotate controls",
    supportedTypes: ["image/*"],
    supportedExtensions: [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".bmp",
      ".ico",
    ],
    config,

    hooks: {
      getPriority: () => 10,

      render: (context) => {
        return <ImagePreviewComponent context={context} />;
      },

      getActions: (context) => ({
        download: () => {
          downloadImageFile(context);
        },
        save: () => {
          downloadImageFile(context);
        },
        zoom: (scale: number) => {
          const nextScale = Math.min(Math.max(scale, minZoom), maxZoom);
          setImageScale(context, nextScale);
        },
        zoomIn: (step = 0.2) => {
          const nextScale = Math.min(getImageScale(context) + step, maxZoom);
          setImageScale(context, nextScale);
        },
        zoomOut: (step = 0.2) => {
          const nextScale = Math.max(getImageScale(context) - step, minZoom);
          setImageScale(context, nextScale);
        },
        rotate: (
          payload?: number | { angle?: number; delta?: number }
        ) => {
          const currentRotation = getImageRotation(context);
          const nextRotation =
            typeof payload === "number"
              ? payload
              : typeof payload?.angle === "number"
                ? payload.angle
                : currentRotation + (payload?.delta ?? 90);

          setImageRotation(
            context,
            ((nextRotation % 360) + 360) % 360
          );
        },
        reset: () => {
          setImageScale(context, 1);
          setImageRotation(context, 0);
          context.bus?.emit("reset", {});
        },
      }),

      renderToolbar: (context) => {
        const handleZoomIn = () => {
          const currentScale = getImageScale(context);
          const newScale = Math.min(currentScale + 0.2, maxZoom);
          setImageScale(context, newScale);
        };

        const handleZoomOut = () => {
          const currentScale = getImageScale(context);
          const newScale = Math.max(currentScale - 0.2, minZoom);
          setImageScale(context, newScale);
        };

        const handleRotate = () => {
          const currentRotation = getImageRotation(context);
          const newRotation = (currentRotation + 90) % 360;
          setImageRotation(context, newRotation);
        };

        const handleReset = () => {
          setImageScale(context, 1);
          setImageRotation(context, 0);
          context.bus?.emit("reset", {});
        };

        const currentScale = getImageScale(context);
        const currentRotation = getImageRotation(context);

        return (
          <ToolbarContainer>
            <FileInfo
              name={context.file.name}
              size={context.file.size}
              type="Image"
              icon="🖼️"
            />

            <ToolbarSeparator />

            <span style={{ fontSize: 12, color: "#656d76", fontWeight: 500,width:'50px' }}>
              {Math.round(currentScale * 100)}%
            </span>

            {enableZoom && (
              <>
                <ToolbarButton
                  onClick={handleZoomOut}
                  icon="🔍"
                  title="Zoom Out"
                  variant="soft"
                >
                  -
                </ToolbarButton>
                <ToolbarButton
                  onClick={handleZoomIn}
                  icon="🔍"
                  title="Zoom In"
                  variant="soft"
                >
                  +
                </ToolbarButton>
              </>
            )}

            {enableRotate && (
              <ToolbarButton
                onClick={handleRotate}
                icon="🔄"
                title={`Rotate (${currentRotation}°)`}
                variant="soft"
              >
                Rotate
              </ToolbarButton>
            )}

            <ToolbarButton
              onClick={handleReset}
              icon="↺"
              title="Reset View"
              variant="soft"
            >
              Reset
            </ToolbarButton>

            <ToolbarSeparator />

            <ToolbarButton
              onClick={() => downloadImageFile(context)}
              icon="📥"
              title="Download Image"
              variant="soft"
            >
              Download
            </ToolbarButton>
          </ToolbarContainer>
        );
      },

      onLoadStart: (context) => {},

      onLoadSuccess: (context) => {},

      onLoadError: (context, error) => {
        console.error(
          `[ImagePreviewPlugin] Image load failed: ${context.file.name}`,
          error
        );
        return false; // 不阻止默认错误处理
      },
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
