/**
 * Pptx 离线预览插件
 * 基于 JSZip 解包，并提取每页幻灯片的文本内容进行基础预览
 * 说明：完整的样式/图片/布局渲染较复杂，这里先提供文本大纲级预览
 */

import {
  FileInfo,
  ToolbarButton,
  ToolbarContainer,
  ToolbarSeparator,
} from "./shared/ToolbarComponents";
import type { FilePreviewPlugin, PluginContext } from "../plugins/types";
import React, { useEffect, useMemo, useState } from "react";
import { createIsolatedContainer } from "./styles/isolatedStyles";

import JSZip from "jszip";

export interface PptxPreviewPluginConfig {
  // 暂时没有配置选项
}

interface SlideData {
  index: number;
  texts: string[];
}

const PptxPreviewComponent: React.FC<{
  context: PluginContext;
}> = ({ context }) => {
  const { file, state } = context;
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [active, setActive] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let aborted = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(file.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const arrayBuffer = await res.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        // 收集所有 slide 文件
        const slideFiles = Object.keys(zip.files)
          .filter((k) => k.startsWith("ppt/slides/slide") && k.endsWith(".xml"))
          .sort((a, b) => {
            const ai = parseInt(a.match(/slide(\d+)\.xml$/)?.[1] || "0", 10);
            const bi = parseInt(b.match(/slide(\d+)\.xml$/)?.[1] || "0", 10);
            return ai - bi;
          });

        const parsedSlides: SlideData[] = [];
        for (let i = 0; i < slideFiles.length; i++) {
          const path = slideFiles[i];
          const xmlText = await zip.file(path)!.async("text");
          const doc = new DOMParser().parseFromString(
            xmlText,
            "application/xml"
          );

          // 提取文本节点，兼容命名空间，并尝试保留更多格式信息
          let tNodes: Element[] = Array.from(doc.getElementsByTagName("a:t"));
          if (tNodes.length === 0) {
            tNodes = Array.from(doc.getElementsByTagName("t"));
          }

          // 尝试提取更多结构化信息，包括层级和格式
          const texts: string[] = [];
          const paragraphs = doc.getElementsByTagName("a:p");
          if (paragraphs.length === 0) {
            const pNodes = doc.getElementsByTagName("p");
            for (let j = 0; j < pNodes.length; j++) {
              const p = pNodes[j];
              const pTexts = Array.from(p.getElementsByTagName("t"))
                .map((n) => (n.textContent || "").trim())
                .filter(Boolean);
              if (pTexts.length > 0) {
                // 检查是否是标题或项目符号
                const isTitle =
                  p.getAttribute("lvl") === "0" || pTexts[0].length < 50;
                const isBullet =
                  pTexts[0].startsWith("•") ||
                  pTexts[0].startsWith("-") ||
                  pTexts[0].startsWith("*");
                const prefix = isTitle ? "📌 " : isBullet ? "• " : "";
                texts.push(prefix + pTexts.join(" "));
              }
            }
          } else {
            for (let j = 0; j < paragraphs.length; j++) {
              const p = paragraphs[j];
              const pTexts = Array.from(p.getElementsByTagName("a:t"))
                .map((n) => (n.textContent || "").trim())
                .filter(Boolean);
              if (pTexts.length > 0) {
                // 检查是否是标题或项目符号
                const isTitle =
                  p.getAttribute("lvl") === "0" || pTexts[0].length < 50;
                const isBullet =
                  pTexts[0].startsWith("•") ||
                  pTexts[0].startsWith("-") ||
                  pTexts[0].startsWith("*");
                const prefix = isTitle ? "📌 " : isBullet ? "• " : "";
                texts.push(prefix + pTexts.join(" "));
              }
            }
          }

          parsedSlides.push({ index: i, texts });
        }

        if (aborted) return;
        setSlides(parsedSlides);
        setActive(0);
      } catch (e: any) {
        if (aborted) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!aborted) setLoading(false);
      }
    };
    load();
    return () => {
      aborted = true;
    };
  }, [file.url]);

  const current = useMemo(() => slides[active], [slides, active]);

  if (state.state !== "loaded" && state.state !== "loading") {
    return null;
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 22 }}>📽️</div>
        <div>Loading PPTX...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          flexDirection: "column",
          gap: 12,
          color: "#d32f2f",
        }}
      >
        <div style={{ fontSize: 22 }}>❌</div>
        <div>Error loading PPTX: {error}</div>
      </div>
    );
  }

  if (!current) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#666",
        }}
      >
        No slides found.
      </div>
    );
  }

  return (
    <div
      style={createIsolatedContainer({
        background: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
      })}
    >
      {/* PowerPoint 风格的顶部工具栏 */}
      <div
        style={{
          background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
          color: "#fff",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "18px" }}>📽️</div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>
              PowerPoint 预览
            </div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>
              {file.name} • Slide {active + 1} of {slides.length}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            style={{
              padding: "6px 12px",
              border: "1px solid #4a5568",
              borderRadius: "4px",
              background: active === 0 ? "#4a5568" : "#3498db",
              color: "#fff",
              cursor: active === 0 ? "not-allowed" : "pointer",
              fontSize: "12px",
              transition: "all 0.2s",
            }}
            onClick={() => setActive((i) => Math.max(0, i - 1))}
            disabled={active === 0}
          >
            ◀
          </button>

          <div
            style={{
              padding: "6px 12px",
              background: "#4a5568",
              borderRadius: "4px",
              fontSize: "12px",
              minWidth: "80px",
              textAlign: "center",
            }}
          >
            {active + 1} / {slides.length}
          </div>

          <button
            style={{
              padding: "6px 12px",
              border: "1px solid #4a5568",
              borderRadius: "4px",
              background: active >= slides.length - 1 ? "#4a5568" : "#3498db",
              color: "#fff",
              cursor: active >= slides.length - 1 ? "not-allowed" : "pointer",
              fontSize: "12px",
              transition: "all 0.2s",
            }}
            onClick={() => setActive((i) => Math.min(slides.length - 1, i + 1))}
            disabled={active >= slides.length - 1}
          >
            ▶
          </button>

          {/* 快速跳转输入框 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginLeft: "8px",
            }}
          >
            <span style={{ fontSize: "11px", color: "#ccc" }}>跳转:</span>
            <input
              type="number"
              min="1"
              max={slides.length}
              value={active + 1}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= slides.length) {
                  setActive(value - 1);
                }
              }}
              style={{
                width: "50px",
                padding: "4px 6px",
                border: "1px solid #4a5568",
                borderRadius: "3px",
                background: "#2c3e50",
                color: "#fff",
                fontSize: "11px",
                textAlign: "center",
              }}
            />
          </div>
        </div>
      </div>

      {/* 幻灯片显示区域 */}
      <div
        style={{
          flex: 1,
          background: "#2c3e50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        {/* 幻灯片容器，模拟 PowerPoint 样式 */}
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            padding: "60px 80px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            minHeight: "500px",
            maxWidth: "800px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* 幻灯片内容 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              flex: 1,
            }}
          >
            {current.texts.length > 0 ? (
              current.texts.map((t, idx) => {
                const isTitle = t.startsWith("📌");
                const isBullet = t.startsWith("•");
                return (
                  <div
                    key={idx}
                    style={{
                      lineHeight: isTitle ? 1.4 : 1.8,
                      fontSize: isTitle ? 20 : 16,
                      color: isTitle ? "#007acc" : "#333",
                      textAlign: "left",
                      padding: isTitle ? "12px 0 8px 0" : "8px 0",
                      borderLeft: isTitle
                        ? "4px solid #007acc"
                        : isBullet
                        ? "2px solid #ddd"
                        : "none",
                      paddingLeft: isTitle ? "12px" : isBullet ? "16px" : "0",
                      fontWeight: isTitle ? 700 : 400,
                      marginBottom: isTitle ? "8px" : "4px",
                      background: isTitle
                        ? "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)"
                        : "transparent",
                      borderRadius: isTitle ? "6px" : "0",
                      boxShadow: isTitle ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                    }}
                  >
                    {t}
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  color: "#999",
                  textAlign: "center",
                  fontSize: 16,
                  fontStyle: "italic",
                  padding: "40px",
                }}
              >
                (No text content on this slide)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部缩略图导航 - 智能显示 */}
      <div
        style={{
          background: "#34495e",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          overflowX: "auto",
          borderTop: "1px solid #4a5568",
          maxHeight: "50px", // 进一步限制高度
        }}
      >
        {/* 显示前几个幻灯片 */}
        {slides.slice(0, 3).map((slide, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            style={{
              padding: "4px 8px",
              border: "1px solid",
              borderColor: active === idx ? "#3498db" : "#4a5568",
              borderRadius: "3px",
              background: active === idx ? "#3498db" : "#4a5568",
              color: "#fff",
              cursor: "pointer",
              fontSize: "10px",
              minWidth: "30px",
              textAlign: "center",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {idx + 1}
          </button>
        ))}

        {/* 如果当前幻灯片不在前3个，显示当前幻灯片 */}
        {active >= 3 && (
          <>
            <span style={{ color: "#999", fontSize: "10px" }}>...</span>
            <button
              onClick={() => setActive(active)}
              style={{
                padding: "4px 8px",
                border: "1px solid #3498db",
                borderRadius: "3px",
                background: "#3498db",
                color: "#fff",
                cursor: "pointer",
                fontSize: "10px",
                minWidth: "30px",
                textAlign: "center",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {active + 1}
            </button>
          </>
        )}

        {/* 如果当前幻灯片不在最后3个，显示省略号 */}
        {active < slides.length - 3 && (
          <span style={{ color: "#999", fontSize: "10px" }}>...</span>
        )}

        {/* 显示最后几个幻灯片 */}
        {slides.length > 3 &&
          slides.slice(-3).map((slide, idx) => {
            const actualIndex = slides.length - 3 + idx;
            if (actualIndex <= active && active < slides.length - 3)
              return null; // 避免重复显示当前幻灯片
            return (
              <button
                key={actualIndex}
                onClick={() => setActive(actualIndex)}
                style={{
                  padding: "4px 8px",
                  border: "1px solid",
                  borderColor: active === actualIndex ? "#3498db" : "#4a5568",
                  borderRadius: "3px",
                  background: active === actualIndex ? "#3498db" : "#4a5568",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "10px",
                  minWidth: "30px",
                  textAlign: "center",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {actualIndex + 1}
              </button>
            );
          })}

        {/* 总幻灯片数提示 */}
        <div
          style={{
            padding: "4px 8px",
            color: "#999",
            fontSize: "10px",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            marginLeft: "8px",
          }}
        >
          ({slides.length} slides)
        </div>
      </div>
    </div>
  );
};

export function createPptxPreviewPlugin(
  _config: PptxPreviewPluginConfig = {}
): FilePreviewPlugin {
  return {
    name: "PptxPreviewPlugin",
    version: "1.0.0",
    description: "Offline PPTX text-outline preview via JSZip",
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
