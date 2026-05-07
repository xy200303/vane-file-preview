/**
 * PPTX 预览插件
 * 基于 PptxViewJS 在浏览器中直接渲染演示文稿
 */

import React, { useEffect, useRef, useState } from "react";
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

const PptxPreviewComponent: React.FC<{
  context: PluginContext;
}> = ({ context }) => {
  const { file, state } = context;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerRef = useRef<PPTXViewer | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let resizeFrame = 0;
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;

    if (!canvas || !viewport) {
      return;
    }

    setActiveSlide(0);
    setSlideCount(0);
    setLoading(true);
    setRendering(false);
    setError(null);

    const viewer = new PPTXViewer({
      canvas,
      slideSizeMode: "fit",
      backgroundColor: "#0f172a",
    });

    viewerRef.current = viewer;

    const syncViewerState = () => {
      if (disposed) {
        return;
      }

      setSlideCount(viewer.getSlideCount());
      setActiveSlide(viewer.getCurrentSlideIndex());
    };

    const scheduleRerender = () => {
      if (disposed || viewer.getSlideCount() === 0) {
        return;
      }

      if (resizeFrame) {
        cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = requestAnimationFrame(async () => {
        resizeFrame = 0;

        if (disposed) {
          return;
        }

        try {
          await viewer.render(canvas);
          syncViewerState();
        } catch {
          // Ignore transient resize render errors and keep last good frame.
        }
      });
    };

    const handleLoadComplete = (payload: unknown) => {
      if (
        typeof payload === "object" &&
        payload !== null &&
        "slideCount" in payload &&
        typeof (payload as { slideCount?: unknown }).slideCount === "number"
      ) {
        setSlideCount((payload as { slideCount: number }).slideCount);
      } else {
        syncViewerState();
      }
    };

    const handleSlideChanged = (slideIndex: unknown) => {
      if (typeof slideIndex === "number") {
        setActiveSlide(slideIndex);
        return;
      }

      syncViewerState();
    };

    const handleRenderComplete = () => {
      syncViewerState();
      setRendering(false);
    };

    viewer.on("loadComplete", handleLoadComplete);
    viewer.on("slideChanged", handleSlideChanged);
    viewer.on("renderComplete", handleRenderComplete);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            scheduleRerender();
          })
        : null;

    resizeObserver?.observe(viewport);

    const load = async () => {
      try {
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });

        if (disposed) {
          return;
        }

        await viewer.loadFromUrl(file.url);

        if (disposed) {
          return;
        }

        setRendering(true);
        await viewer.render(canvas);

        if (disposed) {
          return;
        }

        syncViewerState();
      } catch (cause) {
        if (disposed) {
          return;
        }

        const message =
          cause instanceof Error ? cause.message : String(cause);
        setError(message);
      } finally {
        if (!disposed) {
          setLoading(false);
          setRendering(false);
        }
      }
    };

    load();

    return () => {
      disposed = true;

      if (resizeFrame) {
        cancelAnimationFrame(resizeFrame);
      }

      resizeObserver?.disconnect();
      viewer.off("loadComplete", handleLoadComplete);
      viewer.off("slideChanged", handleSlideChanged);
      viewer.off("renderComplete", handleRenderComplete);
      viewer.destroy();

      if (viewerRef.current === viewer) {
        viewerRef.current = null;
      }
    };
  }, [file.url]);

  if (state.state !== "loaded" && state.state !== "loading") {
    return null;
  }

  const canNavigate = slideCount > 0 && !loading && !rendering;

  const navigateTo = async (targetIndex: number) => {
    const viewer = viewerRef.current;
    const canvas = canvasRef.current;

    if (!viewer || !canvas || !canNavigate) {
      return;
    }

    const boundedIndex = Math.max(0, Math.min(slideCount - 1, targetIndex));

    try {
      setRendering(true);
      await viewer.goToSlide(boundedIndex, canvas);
      setActiveSlide(viewer.getCurrentSlideIndex());
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : String(cause);
      setError(message);
    } finally {
      setRendering(false);
    }
  };

  return (
    <div
      style={createIsolatedContainer({
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
      })}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "#fff",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 18 }}>📽️</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              PowerPoint 预览
            </div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>
              {file.name}
              {slideCount > 0 ? ` • Slide ${activeSlide + 1} / ${slideCount}` : ""}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={() => navigateTo(activeSlide - 1)}
            disabled={!canNavigate || activeSlide === 0}
            style={{
              padding: "6px 12px",
              border: "1px solid #475569",
              borderRadius: 4,
              background:
                !canNavigate || activeSlide === 0 ? "#334155" : "#2563eb",
              color: "#fff",
              cursor:
                !canNavigate || activeSlide === 0 ? "not-allowed" : "pointer",
              fontSize: 12,
            }}
          >
            ◀
          </button>

          <div
            style={{
              minWidth: 88,
              padding: "6px 12px",
              borderRadius: 4,
              background: "#334155",
              color: "#e2e8f0",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            {slideCount > 0 ? `${activeSlide + 1} / ${slideCount}` : "-- / --"}
          </div>

          <button
            type="button"
            onClick={() => navigateTo(activeSlide + 1)}
            disabled={!canNavigate || activeSlide >= slideCount - 1}
            style={{
              padding: "6px 12px",
              border: "1px solid #475569",
              borderRadius: 4,
              background:
                !canNavigate || activeSlide >= slideCount - 1
                  ? "#334155"
                  : "#2563eb",
              color: "#fff",
              cursor:
                !canNavigate || activeSlide >= slideCount - 1
                  ? "not-allowed"
                  : "pointer",
              fontSize: 12,
            }}
          >
            ▶
          </button>

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

              navigateTo(value - 1);
            }}
            style={{
              width: 60,
              padding: "6px 8px",
              border: "1px solid #475569",
              borderRadius: 4,
              background: "#0f172a",
              color: "#fff",
              fontSize: 12,
              textAlign: "center",
            }}
          />
        </div>
      </div>

      <div
        ref={viewportRef}
        style={{
          flex: 1,
          minHeight: 420,
          padding: 20,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background:
            "radial-gradient(circle at top, rgba(37, 99, 235, 0.12), transparent 35%), #0f172a",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 16px 48px rgba(15, 23, 42, 0.45)",
          }}
        />

        {(loading || rendering) && (
          <div
            style={{
              position: "absolute",
              inset: 20,
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
            {loading ? "Loading PPTX..." : "Rendering slide..."}
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              position: "absolute",
              inset: 20,
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
              inset: 20,
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
    version: "2.0.0",
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
      renderToolbar: (context) => {
        const handleDownload = () => {
          const link = document.createElement("a");
          link.href = context.file.url;
          link.download = context.file.name;
          link.click();
        };

        return (
          <ToolbarContainer>
            <FileInfo
              name={context.file.name}
              size={context.file.size}
              type="PPTX"
              icon="📽️"
            />
            <ToolbarSeparator />
            <ToolbarButton onClick={handleDownload} icon="📥" title="Download">
              Download
            </ToolbarButton>
          </ToolbarContainer>
        );
      },
    },
  };
}
