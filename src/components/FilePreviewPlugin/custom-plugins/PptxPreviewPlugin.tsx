/**
 * PPTX 预览插件
 * 基于 PptxViewJS 在浏览器中将演示文稿渲染到 Canvas
 */

import React, { useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import { PPTXViewer } from "pptxviewjs";

import {
  FileInfo,
  ToolbarButton,
  ToolbarContainer,
  ToolbarSeparator,
} from "./shared/ToolbarComponents";
import { createIsolatedContainer } from "./styles/isolatedStyles";
import type { FilePreviewPlugin, PluginContext } from "../plugins/types";

export type PptxPreviewPluginConfig = Record<string, never>;

const XML_MIME_TYPE = "application/xml";
const EMU_TO_PX = 96 / 914400;

type SlideSize = {
  width: number;
  height: number;
};

type ExtractedImageSlide = SlideSize & {
  url: string;
};

type ImageDeckDisplayMode = "sharp" | "fit";

type SlideDimensions = {
  cx: number;
  cy: number;
};

type PptxViewerInstance = PPTXViewer & {
  getSlideDimensions?: () => SlideDimensions;
};

const getAttributeByLocalName = (
  element: Element,
  attributeName: string
): string | null => {
  const attribute = Array.from(element.attributes).find(
    (candidate) =>
      candidate.localName === attributeName ||
      candidate.name === attributeName ||
      candidate.name.endsWith(`:${attributeName}`)
  );

  return attribute?.value ?? null;
};

const resolveZipPath = (basePath: string, targetPath: string): string => {
  const segments = basePath.split("/").slice(0, -1);

  for (const segment of targetPath.replace(/\\/g, "/").split("/")) {
    if (!segment || segment === ".") {
      continue;
    }

    if (segment === "..") {
      segments.pop();
      continue;
    }

    segments.push(segment);
  }

  return segments.join("/");
};

const getContentTypeFromPath = (path: string): string => {
  const extension = path.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "bmp":
      return "image/bmp";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
};

const getImageSizeFromBytes = (
  path: string,
  bytes: Uint8Array
): SlideSize | null => {
  const extension = path.split(".").pop()?.toLowerCase();

  if (extension === "png" && bytes.length >= 24) {
    const view = new DataView(
      bytes.buffer,
      bytes.byteOffset,
      bytes.byteLength
    );

    return {
      width: view.getUint32(16),
      height: view.getUint32(20),
    };
  }

  if ((extension === "jpg" || extension === "jpeg") && bytes.length >= 4) {
    let offset = 2;

    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      const marker = bytes[offset + 1];
      const length = (bytes[offset + 2] << 8) | bytes[offset + 3];

      if (
        marker === 0xc0 ||
        marker === 0xc1 ||
        marker === 0xc2 ||
        marker === 0xc3 ||
        marker === 0xc5 ||
        marker === 0xc6 ||
        marker === 0xc7 ||
        marker === 0xc9 ||
        marker === 0xca ||
        marker === 0xcb ||
        marker === 0xcd ||
        marker === 0xce ||
        marker === 0xcf
      ) {
        return {
          width: (bytes[offset + 7] << 8) | bytes[offset + 8],
          height: (bytes[offset + 5] << 8) | bytes[offset + 6],
        };
      }

      if (length <= 0) {
        break;
      }

      offset += 2 + length;
    }
  }

  return null;
};

const parseZipXml = async (
  zip: JSZip,
  path: string
): Promise<Document | null> => {
  const entry = zip.file(path);

  if (!entry) {
    return null;
  }

  const xmlText = await entry.async("text");
  return new DOMParser().parseFromString(xmlText, XML_MIME_TYPE);
};

const parseRelationships = async (
  zip: JSZip,
  path: string
): Promise<Map<string, string>> => {
  const document = await parseZipXml(zip, path);
  const relationships = new Map<string, string>();

  if (!document) {
    return relationships;
  }

  for (const node of Array.from(
    document.getElementsByTagNameNS("*", "Relationship")
  )) {
    const id = getAttributeByLocalName(node, "Id");
    const target = getAttributeByLocalName(node, "Target");

    if (!id || !target) {
      continue;
    }

    relationships.set(id, resolveZipPath(path, target));
  }

  return relationships;
};

const getOrderedSlidePaths = async (zip: JSZip): Promise<string[]> => {
  const presentationDocument = await parseZipXml(zip, "ppt/presentation.xml");

  if (!presentationDocument) {
    return [];
  }

  const relationships = await parseRelationships(
    zip,
    "ppt/_rels/presentation.xml.rels"
  );

  return Array.from(presentationDocument.getElementsByTagNameNS("*", "sldId"))
    .map((node) => {
      const relationshipId = getAttributeByLocalName(node, "id");
      return relationshipId ? relationships.get(relationshipId) ?? null : null;
    })
    .filter((path): path is string => Boolean(path));
};

const extractImageSlidesFromPptx = async (
  source: ArrayBuffer
): Promise<ExtractedImageSlide[] | null> => {
  const zip = await JSZip.loadAsync(source);
  const slidePaths = await getOrderedSlidePaths(zip);

  if (slidePaths.length === 0) {
    return null;
  }

  const slideUrls: ExtractedImageSlide[] = [];
  const cleanupSlideUrls = () => {
    slideUrls.forEach((slide) => URL.revokeObjectURL(slide.url));
    slideUrls.length = 0;
  };

  try {
    for (const slidePath of slidePaths) {
      const slideDocument = await parseZipXml(zip, slidePath);

      if (!slideDocument) {
        cleanupSlideUrls();
        return null;
      }

      const pictureCount =
        slideDocument.getElementsByTagNameNS("*", "pic").length;
      const shapeCount = slideDocument.getElementsByTagNameNS("*", "sp").length;
      const graphicFrameCount =
        slideDocument.getElementsByTagNameNS("*", "graphicFrame").length;

      if (pictureCount !== 1 || shapeCount > 0 || graphicFrameCount > 0) {
        cleanupSlideUrls();
        return null;
      }

      const blip = slideDocument.getElementsByTagNameNS("*", "blip").item(0);
      const relationshipId = blip
        ? getAttributeByLocalName(blip, "embed")
        : null;

      if (!relationshipId) {
        cleanupSlideUrls();
        return null;
      }

      const [slideDirectory, slideFileName] = [
        slidePath.split("/").slice(0, -1).join("/"),
        slidePath.split("/").pop(),
      ];
      const slideRelationshipsPath = `${slideDirectory}/_rels/${slideFileName}.rels`;
      const slideRelationships = await parseRelationships(
        zip,
        slideRelationshipsPath
      );
      const mediaPath = slideRelationships.get(relationshipId);
      const mediaEntry = mediaPath ? zip.file(mediaPath) : null;

      if (!mediaPath || !mediaEntry) {
        cleanupSlideUrls();
        return null;
      }

      const data = await mediaEntry.async("uint8array");
      const bytes = new Uint8Array(data.byteLength);
      bytes.set(data);
      const imageSize = getImageSizeFromBytes(mediaPath, bytes);
      const blob = new Blob([bytes], {
        type: getContentTypeFromPath(mediaPath),
      });
      slideUrls.push({
        url: URL.createObjectURL(blob),
        width: imageSize?.width ?? 0,
        height: imageSize?.height ?? 0,
      });
    }

    return slideUrls;
  } catch {
    cleanupSlideUrls();
    return null;
  }
};

const toSlideSize = (dimensions?: SlideDimensions | null): SlideSize => {
  if (!dimensions || dimensions.cx <= 0 || dimensions.cy <= 0) {
    return {
      width: 0,
      height: 0,
    };
  }

  return {
    width: Math.max(1, Math.round(dimensions.cx * EMU_TO_PX)),
    height: Math.max(1, Math.round(dimensions.cy * EMU_TO_PX)),
  };
};

const fitSizeWithin = (
  maxWidth: number,
  maxHeight: number,
  contentSize: SlideSize,
  options: {
    allowUpscale?: boolean;
  } = {}
): SlideSize => {
  const safeWidth = Math.max(1, Math.floor(maxWidth));
  const safeHeight = Math.max(1, Math.floor(maxHeight));

  if (contentSize.width <= 0 || contentSize.height <= 0) {
    return {
      width: safeWidth,
      height: safeHeight,
    };
  }

  const scale = Math.min(
    safeWidth / contentSize.width,
    safeHeight / contentSize.height
  );
  const normalizedScale =
    Number.isFinite(scale) && scale > 0 ? scale : 1;
  const constrainedScale = options.allowUpscale
    ? normalizedScale
    : Math.min(1, normalizedScale);

  return {
    width: Math.max(1, Math.round(contentSize.width * constrainedScale)),
    height: Math.max(1, Math.round(contentSize.height * constrainedScale)),
  };
};

const getDevicePixelRatio = (): number => {
  if (typeof window === "undefined") {
    return 1;
  }

  const ratio = window.devicePixelRatio;
  return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
};

const normalizeImageDeckSize = (
  contentSize: SlideSize,
  displayMode: ImageDeckDisplayMode,
  devicePixelRatio: number
): SlideSize => {
  if (displayMode === "fit" || contentSize.width <= 0 || contentSize.height <= 0) {
    return contentSize;
  }

  const safeRatio =
    Number.isFinite(devicePixelRatio) && devicePixelRatio > 0
      ? devicePixelRatio
      : 1;

  return {
    width: Math.max(1, Math.round(contentSize.width / safeRatio)),
    height: Math.max(1, Math.round(contentSize.height / safeRatio)),
  };
};

const setCanvasSize = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) => {
  const logicalWidth = Math.max(1, Math.round(width));
  const logicalHeight = Math.max(1, Math.round(height));
  const styleWidth = `${logicalWidth}px`;
  const styleHeight = `${logicalHeight}px`;

  // PptxViewJS 会优先读取 canvas.style.width/height，不能传 "100%"，
  // 否则 parseFloat("100%") 会被当成 100px，导致整页按 100x100 低分辨率渲染。
  if (canvas.style.width !== styleWidth) {
    canvas.style.width = styleWidth;
  }

  if (canvas.style.height !== styleHeight) {
    canvas.style.height = styleHeight;
  }

  if (canvas.width !== logicalWidth) {
    canvas.width = logicalWidth;
  }

  if (canvas.height !== logicalHeight) {
    canvas.height = logicalHeight;
  }
};

const PresentationIcon: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ display: "block" }}
  >
    <g
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="6" width="16" height="10" rx="2" />
      <path d="M10 16v3" />
      <path d="M14 16v3" />
      <path d="M8 19h8" />
      <path d="m15 11 3-2v6l-3-2" />
    </g>
  </svg>
);

const softControlStyle: React.CSSProperties = {
  padding: "8px 14px",
  minHeight: 40,
  boxSizing: "border-box",
  border: "none",
  borderRadius: 16,
  background: "#ffffff",
  color: "#1f2a44",
  fontSize: 12,
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  boxShadow: "0 10px 30px rgba(148, 163, 184, 0.18)",
};

const softControlActiveStyle: React.CSSProperties = {
  background: "#e5ebff",
  color: "#31438c",
  boxShadow: "0 8px 24px rgba(99, 102, 241, 0.18)",
};

const softControlDisabledStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.72)",
  color: "#94a3b8",
  boxShadow: "none",
  opacity: 0.75,
};

const downloadPptxFile = (context: PluginContext) => {
  const link = document.createElement("a");
  link.href = context.file.url;
  link.download = context.file.name;
  link.click();
};

const PptxPreviewComponent: React.FC<{
  context: PluginContext;
}> = ({ context }) => {
  const { file, state } = context;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerRef = useRef<PptxViewerInstance | null>(null);
  const imageSlidesRef = useRef<ExtractedImageSlide[]>([]);
  const activeSlideRef = useRef(0);
  const slideCountRef = useRef(0);
  const renderingRef = useRef(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [renderingSlide, setRenderingSlide] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [imageDeckDisplayMode, setImageDeckDisplayMode] =
    useState<ImageDeckDisplayMode>("sharp");
  const [slideSize, setSlideSize] = useState<SlideSize>({
    width: 0,
    height: 0,
  });
  const [frameSize, setFrameSize] = useState<SlideSize>({
    width: 0,
    height: 0,
  });
  const [imageSlides, setImageSlides] = useState<ExtractedImageSlide[] | null>(
    null
  );

  const revokeImageSlides = () => {
    imageSlidesRef.current.forEach((slide) => URL.revokeObjectURL(slide.url));
    imageSlidesRef.current = [];
  };

  useEffect(() => {
    activeSlideRef.current = activeSlide;
  }, [activeSlide]);

  useEffect(() => {
    slideCountRef.current = slideCount;
  }, [slideCount]);

  useEffect(() => {
    return () => {
      revokeImageSlides();
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, []);

  const syncStageLayout = (overrideSlideSize?: SlideSize) => {
    const stage = stageRef.current;

    if (!stage) {
      return null;
    }

    const stageWidth = Math.max(1, Math.floor(stage.clientWidth));
    const stageHeight = Math.max(1, Math.floor(stage.clientHeight));
    const nextViewportWidth = stageWidth;
    const contentSize = overrideSlideSize ?? slideSize;
    const isImageDeckActive = imageSlidesRef.current.length > 0;
    const layoutContentSize = isImageDeckActive
      ? normalizeImageDeckSize(
          contentSize,
          imageDeckDisplayMode,
          getDevicePixelRatio()
        )
      : contentSize;
    const nextFrameSize = fitSizeWithin(stageWidth, stageHeight, layoutContentSize, {
      allowUpscale: !isImageDeckActive || imageDeckDisplayMode === "fit",
    });

    setViewportWidth((currentWidth) =>
      currentWidth === nextViewportWidth ? currentWidth : nextViewportWidth
    );
    setFrameSize((currentFrameSize) =>
      currentFrameSize.width === nextFrameSize.width &&
      currentFrameSize.height === nextFrameSize.height
        ? currentFrameSize
        : nextFrameSize
    );

    const canvas = canvasRef.current;

    if (canvas) {
      setCanvasSize(canvas, nextFrameSize.width, nextFrameSize.height);
    }

    return nextFrameSize;
  };

  const renderViewerSlide = async (
    slideIndex: number,
    options: {
      showBusyIndicator?: boolean;
    } = {}
  ) => {
    const viewer = viewerRef.current;
    const canvas = canvasRef.current;

    if (!viewer || !canvas || renderingRef.current) {
      return;
    }

    syncStageLayout();
    renderingRef.current = true;

    if (options.showBusyIndicator) {
      setRenderingSlide(true);
    }

    try {
      await viewer.renderSlide(slideIndex, canvas, {
        quality: "high",
      });
      activeSlideRef.current = slideIndex;
      setActiveSlide(slideIndex);
      setError(null);
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : String(cause);
      setError(message);
    } finally {
      renderingRef.current = false;

      if (options.showBusyIndicator) {
        setRenderingSlide(false);
      }
    }
  };

  useEffect(() => {
    let resizeFrame = 0;
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    const updateLayout = () => {
      resizeFrame = 0;
      syncStageLayout();

      if (
        !viewerRef.current ||
        imageSlidesRef.current.length > 0 ||
        slideCountRef.current === 0 ||
        renderingRef.current
      ) {
        return;
      }

      void renderViewerSlide(activeSlideRef.current);
    };

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (resizeFrame) {
              cancelAnimationFrame(resizeFrame);
            }

            resizeFrame = requestAnimationFrame(updateLayout);
          })
        : null;

    syncStageLayout();
    observer?.observe(stage);

    return () => {
      if (resizeFrame) {
        cancelAnimationFrame(resizeFrame);
      }

      observer?.disconnect();
    };
  }, [imageDeckDisplayMode, slideSize.height, slideSize.width]);

  useEffect(() => {
    let disposed = false;

    setActiveSlide(0);
    activeSlideRef.current = 0;
    setSlideCount(0);
    slideCountRef.current = 0;
    setSlideSize({ width: 0, height: 0 });
    setFrameSize({ width: 0, height: 0 });
    setLoading(true);
    setRenderingSlide(false);
    setError(null);
    setImageDeckDisplayMode("sharp");
    revokeImageSlides();
    setImageSlides(null);
    viewerRef.current?.destroy();
    viewerRef.current = null;
    renderingRef.current = false;

    const load = async () => {
      try {
        const response = await fetch(file.url);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch PPTX: ${response.status} ${response.statusText}`
          );
        }

        const source = await response.arrayBuffer();
        const imageSlides = await extractImageSlidesFromPptx(source);

        if (disposed) {
          imageSlides?.forEach((slide) => URL.revokeObjectURL(slide.url));
          return;
        }

        if (imageSlides && imageSlides.length > 0) {
          imageSlidesRef.current = imageSlides;
          setImageSlides(imageSlides);
          setSlideCount(imageSlides.length);
          slideCountRef.current = imageSlides.length;
          const firstSlideSize = imageSlides[0]
            ? {
                width: imageSlides[0].width,
                height: imageSlides[0].height,
              }
            : { width: 0, height: 0 };
          if (firstSlideSize.width > 0 && firstSlideSize.height > 0) {
            setSlideSize(firstSlideSize);
            syncStageLayout(firstSlideSize);
          }
          setLoading(false);
          setError(null);
          return;
        }

        const viewer = new PPTXViewer({
          canvas: canvasRef.current,
          backgroundColor: "#ffffff",
          enableThumbnails: false,
          slideSizeMode: "fit",
          autoChartRerenderDelayMs: 250,
        }) as PptxViewerInstance;

        await viewer.loadFile(source);

        if (disposed) {
          viewer.destroy();
          return;
        }

        const nextSlideCount = viewer.getSlideCount();
        const nextSlideSize = toSlideSize(
          typeof viewer.getSlideDimensions === "function"
            ? viewer.getSlideDimensions()
            : null
        );

        viewerRef.current = viewer;
        setSlideCount(nextSlideCount);
        slideCountRef.current = nextSlideCount;
        setSlideSize(nextSlideSize);
        syncStageLayout(nextSlideSize);
        await renderViewerSlide(0);

        if (disposed) {
          viewer.destroy();
          return;
        }

        setLoading(false);
        setError(null);
      } catch (cause) {
        if (disposed) {
          return;
        }

        const message =
          cause instanceof Error ? cause.message : String(cause);
        setError(message);
        setLoading(false);
        setRenderingSlide(false);
      }
    };

    void load();

    return () => {
      disposed = true;
    };
  }, [file.type, file.url]);

  if (state.state !== "loaded" && state.state !== "loading") {
    return null;
  }

  const canNavigate = slideCount > 0 && !loading && !renderingSlide;
  const isImageDeck = Boolean(imageSlides && imageSlides.length > 0);
  const viewportPadding = viewportWidth > 0 && viewportWidth < 520 ? 12 : 20;
  const viewportMinHeight = viewportWidth > 0 && viewportWidth < 520 ? 260 : 320;

  const navigateTo = (targetIndex: number) => {
    if (!canNavigate) {
      return;
    }

    const boundedIndex = Math.max(0, Math.min(slideCount - 1, targetIndex));

    if (boundedIndex === activeSlideRef.current) {
      return;
    }

    if (isImageDeck) {
      const nextSlide = imageSlides?.[boundedIndex];

      if (nextSlide && nextSlide.width > 0 && nextSlide.height > 0) {
        const nextSlideSize = {
          width: nextSlide.width,
          height: nextSlide.height,
        };
        setSlideSize((currentSize) =>
          currentSize.width === nextSlideSize.width &&
          currentSize.height === nextSlideSize.height
            ? currentSize
            : nextSlideSize
        );
        syncStageLayout(nextSlideSize);
      }

      activeSlideRef.current = boundedIndex;
      setActiveSlide(boundedIndex);
      return;
    }

    void renderViewerSlide(boundedIndex, {
      showBusyIndicator: true,
    });
  };

  const syncToolbarState = (key: string, value: unknown) => {
    if (context.sharedData?.get(key) === value) {
      return;
    }

    context.sharedData?.set(key, value);
    context.bus?.emit("sharedDataChanged", { key, value });
  };

  useEffect(() => {
    syncToolbarState("pptxActiveSlide", activeSlide);
    syncToolbarState("pptxSlideCount", slideCount);
    syncToolbarState("pptxLoading", loading);
    syncToolbarState("pptxRenderingSlide", renderingSlide);
    syncToolbarState("pptxIsImageDeck", isImageDeck);
    syncToolbarState("pptxImageDeckDisplayMode", imageDeckDisplayMode);
  }, [
    activeSlide,
    imageDeckDisplayMode,
    isImageDeck,
    loading,
    renderingSlide,
    slideCount,
  ]);

  useEffect(() => {
    const unsubscribeNavigate = context.bus?.on(
      "pptx:navigate",
      (payload: unknown) => {
        if (!payload || typeof payload !== "object") {
          return;
        }

        const data = payload as { index?: number; delta?: number };

        if (typeof data.index === "number" && Number.isFinite(data.index)) {
          navigateTo(data.index);
          return;
        }

        if (typeof data.delta === "number" && Number.isFinite(data.delta)) {
          navigateTo(activeSlideRef.current + data.delta);
        }
      }
    );

    const unsubscribeDisplayMode = context.bus?.on(
      "pptx:setImageDeckMode",
      (payload: unknown) => {
        if (!payload || typeof payload !== "object") {
          return;
        }

        const data = payload as { mode?: ImageDeckDisplayMode };

        if (data.mode === "sharp" || data.mode === "fit") {
          setImageDeckDisplayMode(data.mode);
        }
      }
    );

    return () => {
      unsubscribeNavigate?.();
      unsubscribeDisplayMode?.();
    };
  }, [context.bus, navigateTo]);

  return (
    <div
      style={createIsolatedContainer({
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      })}
    >
      <div
        style={{
          flex: 1,
          minHeight: viewportMinHeight,
          padding: viewportPadding,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          boxSizing: "border-box",
          background: "#ffffff",
        }}
      >
        <div
          ref={stageRef}
          style={{
            width: "100%",
            height: "100%",
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "relative",
              width: frameSize.width > 0 ? frameSize.width : "100%",
              height: frameSize.height > 0 ? frameSize.height : "100%",
              maxWidth: "100%",
              maxHeight: "100%",
              minWidth: 0,
              minHeight: 0,
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                display: isImageDeck ? "none" : "block",
                width: frameSize.width > 0 ? frameSize.width : undefined,
                height: frameSize.height > 0 ? frameSize.height : undefined,
                background: "#ffffff",
                borderRadius: 12,
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
              }}
            />

            {isImageDeck && (
              <img
                src={imageSlides?.[activeSlide]?.url}
                alt={`${file.name} slide ${activeSlide + 1}`}
                decoding="sync"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "auto",
                  height: "auto",
                  display: "block",
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
                  objectFit: "contain",
                }}
              />
            )}
          </div>
        </div>

        {loading && (
          <div
            style={{
              position: "absolute",
              inset: viewportPadding,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(15, 23, 42, 0.55)",
              color: "#fff",
              fontSize: 14,
              borderRadius: 12,
              backdropFilter: "blur(4px)",
            }}
          >
            Loading PPTX...
          </div>
        )}

        {renderingSlide && !loading && (
          <div
            style={{
              position: "absolute",
              top: viewportPadding,
              right: viewportPadding,
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(15, 23, 42, 0.78)",
              color: "#e2e8f0",
              fontSize: 12,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.28)",
            }}
          >
            Rendering...
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              position: "absolute",
              inset: viewportPadding,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: "rgba(127, 29, 29, 0.88)",
              color: "#fff",
              borderRadius: 12,
              padding: 24,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 22 }}>❌</div>
            <div style={{ fontWeight: 600 }}>PPTX 预览失败</div>
            <div style={{ fontSize: 12, lineHeight: 1.6, opacity: 0.9 }}>
              {error}
            </div>
          </div>
        )}

        {!loading && !error && slideCount === 0 && (
          <div
            style={{
              position: "absolute",
              inset: viewportPadding,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#cbd5e1",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            No slides found.
          </div>
        )}
      </div>
    </div>
  );
};

export function createPptxPreviewPlugin(
  _config: PptxPreviewPluginConfig = {}
): FilePreviewPlugin {
  return {
    name: "PptxPreviewPlugin",
    version: "4.0.0",
    description: "PPTX preview powered by PptxViewJS",
    supportedTypes: [
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
    supportedExtensions: [".pptx"],
    hooks: {
      getPriority: () => 8,
      render: (context) => {
        return <PptxPreviewComponent context={context} />;
      },
      getActions: (context) => ({
        download: () => {
          downloadPptxFile(context);
        },
        save: () => {
          downloadPptxFile(context);
        },
        previous: () => {
          context.bus?.emit("pptx:navigate", { delta: -1 });
        },
        next: () => {
          context.bus?.emit("pptx:navigate", { delta: 1 });
        },
        goTo: (index: number) => {
          context.bus?.emit("pptx:navigate", { index });
        },
        setImageDeckMode: (mode: ImageDeckDisplayMode) => {
          context.bus?.emit("pptx:setImageDeckMode", { mode });
        },
      }),
      renderToolbar: (context) => {
        const activeSlide = Number(
          context.sharedData?.get("pptxActiveSlide") ?? 0
        );
        const slideCount = Number(
          context.sharedData?.get("pptxSlideCount") ?? 0
        );
        const loading = Boolean(
          context.sharedData?.get("pptxLoading") ?? true
        );
        const renderingSlide = Boolean(
          context.sharedData?.get("pptxRenderingSlide") ?? false
        );
        const isImageDeck = Boolean(
          context.sharedData?.get("pptxIsImageDeck") ?? false
        );
        const imageDeckDisplayMode =
          (context.sharedData?.get(
            "pptxImageDeckDisplayMode"
          ) as ImageDeckDisplayMode | undefined) ?? "sharp";
        const canNavigate = slideCount > 0 && !loading && !renderingSlide;
        const slideIndicatorText =
          slideCount > 0 ? `${activeSlide + 1} / ${slideCount}` : "-- / --";

        return (
          <ToolbarContainer
            style={{
              width: "100%",
              flexWrap: "wrap",
              rowGap: 8,
              minWidth: 0,
              justifyContent: "space-between",
            }}
          >
            <div style={{ minWidth: 0, flex: "1 1 240px" }}>
              <FileInfo
                name={context.file.name}
                size={context.file.size}
                type="PPTX"
                icon="📽️"
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "flex-end",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0 8px",
                  minHeight: 40,
                  color: "#0f172a",
                  fontSize: 14,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <PresentationIcon />
                </div>
                <span>PowerPoint 预览</span>
              </div>

              <ToolbarSeparator />

              {isImageDeck && (
                <>
                  <ToolbarButton
                    onClick={() =>
                      context.bus?.emit("pptx:setImageDeckMode", {
                        mode: "sharp" as ImageDeckDisplayMode,
                      })
                    }
                    disabled={!canNavigate}
                    active={imageDeckDisplayMode === "sharp"}
                    title="清晰优先"
                    variant="soft"
                  >
                    清晰优先
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() =>
                      context.bus?.emit("pptx:setImageDeckMode", {
                        mode: "fit" as ImageDeckDisplayMode,
                      })
                    }
                    disabled={!canNavigate}
                    active={imageDeckDisplayMode === "fit"}
                    title="适应容器"
                    variant="soft"
                  >
                    适应容器
                  </ToolbarButton>
                </>
              )}

              <ToolbarButton
                onClick={() => context.bus?.emit("pptx:navigate", { delta: -1 })}
                disabled={!canNavigate || activeSlide === 0}
                title="上一页"
                variant="soft"
              >
                ◀
              </ToolbarButton>

              <div
                style={{
                  ...softControlStyle,
                  minWidth: 120,
                  textAlign: "center",
                }}
              >
                {slideIndicatorText}
              </div>

              <ToolbarButton
                onClick={() => context.bus?.emit("pptx:navigate", { delta: 1 })}
                disabled={!canNavigate || activeSlide >= slideCount - 1}
                title="下一页"
                variant="soft"
              >
                ▶
              </ToolbarButton>

              <input
                type="number"
                min={slideCount > 0 ? 1 : 0}
                max={slideCount > 0 ? slideCount : 0}
                value={slideCount > 0 ? activeSlide + 1 : 0}
                disabled={!canNavigate}
                onChange={(event) => {
                  const value = Number.parseInt(event.target.value, 10);

                  if (!Number.isFinite(value)) {
                    return;
                  }

                  context.bus?.emit("pptx:navigate", { index: value - 1 });
                }}
                style={{
                  ...softControlStyle,
                  width: 60,
                  background: "#ffffff",
                  color: "#0f172a",
                  textAlign: "center",
                  outline: "none",
                }}
              />

              <ToolbarSeparator />

              <ToolbarButton
                onClick={() => downloadPptxFile(context)}
                icon="📥"
                title="Download"
                variant="soft"
              >
                Download
              </ToolbarButton>
            </div>
          </ToolbarContainer>
        );
      },
    },
  };
}
