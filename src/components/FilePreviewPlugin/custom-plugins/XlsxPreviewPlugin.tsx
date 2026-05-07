/**
 * Xlsx 离线预览插件
 * 使用 SheetJS (xlsx) 在浏览器中解析 .xlsx 并渲染为 HTML 表格
 */

import * as XLSX from "xlsx";

import {
  FileInfo,
  ToolbarButton,
  ToolbarContainer,
  ToolbarSeparator,
} from "./shared/ToolbarComponents";
import type { FilePreviewPlugin, PluginContext } from "../plugins/types";
import React, { useEffect, useMemo, useState } from "react";

export interface XlsxPreviewPluginConfig {
  defaultSheetIndex?: number;
}

const XlsxPreviewComponent: React.FC<{
  context: PluginContext;
  config: XlsxPreviewPluginConfig;
}> = ({ context, config }) => {
  const { file, state } = context;
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [activeSheet, setActiveSheet] = useState<number>(
    config.defaultSheetIndex || 0
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  console.log("XlsxPreviewComponent render", {
    fileUrl: file.url,
    state: state.state,
    loading,
    hasWorkbook: !!workbook,
    activeSheet,
  });

  useEffect(() => {
    console.log("XlsxPreviewComponent useEffect triggered", {
      fileUrl: file.url,
      defaultSheetIndex: config.defaultSheetIndex,
    });

    let aborted = false;
    const load = async () => {
      try {
        console.log("Starting XLSX load...");
        setLoading(true);
        setError(null);
        const res = await fetch(file.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const arrayBuffer = await res.arrayBuffer();
        console.log("ArrayBuffer loaded, size:", arrayBuffer.byteLength);
        const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
        console.log("Workbook parsed, sheets:", wb.SheetNames);
        if (aborted) return;
        setWorkbook(wb);
        const newActiveSheet = Math.min(
          config.defaultSheetIndex || 0,
          wb.SheetNames.length - 1
        );
        console.log("Setting active sheet:", newActiveSheet);
        setActiveSheet(newActiveSheet);
      } catch (e: any) {
        console.error("XLSX load error:", e);
        if (aborted) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!aborted) {
          console.log("XLSX load completed");
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      console.log("XlsxPreviewComponent useEffect cleanup");
      aborted = true;
    };
  }, [file.url, config.defaultSheetIndex]);

  const html = useMemo(() => {
    console.log("XlsxPreviewComponent html useMemo triggered", {
      hasWorkbook: !!workbook,
      activeSheet,
      sheetNames: workbook?.SheetNames,
    });

    if (!workbook) return "";
    const sheetName =
      workbook.SheetNames[activeSheet] || workbook.SheetNames[0];
    console.log("Selected sheet name:", sheetName);
    const ws = workbook.Sheets[sheetName];
    if (!ws) {
      console.log("Sheet not found:", sheetName);
      return "";
    }
    console.log("Converting sheet to HTML with enhanced formatting...");

    // 使用更高级的 HTML 转换选项来保留更多格式
    const htmlString = XLSX.utils.sheet_to_html(ws, {
      id: "xlsx-preview-table",
      editable: false,
      header: "",
      footer: "",
    });

    console.log("HTML generated, length:", htmlString.length);
    return htmlString;
  }, [workbook, activeSheet]);

  console.log("XlsxPreviewComponent render conditions", {
    state: state.state,
    loading,
    error,
    hasWorkbook: !!workbook,
    htmlLength: html.length,
  });

  if (state.state !== "loaded" && state.state !== "loading") {
    console.log("State not ready, returning null");
    return null;
  }

  if (loading) {
    console.log("Loading state, showing loader");
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
        <div style={{ fontSize: 22 }}>📊</div>
        <div>Loading XLSX...</div>
      </div>
    );
  }

  if (error) {
    console.log("Error state, showing error");
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
        <div>Error loading XLSX: {error}</div>
      </div>
    );
  }

  console.log("Rendering XLSX content", { htmlLength: html.length });

  return (
    <div
      className="xlsx-container"
      style={{ height: "100%", padding: "20px", background: "#f5f5f5" }}
    >
      <style>
        {`
          #xlsx-preview-table {
            border-collapse: collapse;
            width: 100%;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11px;
            background: #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 2px solid #d0d0d0;
          }

          #xlsx-preview-table th, #xlsx-preview-table td {
            border: 1px solid #d0d0d0;
            padding: 6px 8px;
            text-align: left;
            vertical-align: middle;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 60px;
            max-width: 200px;
            position: relative;
          }

          #xlsx-preview-table th {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            font-weight: 700;
            color: #333;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 10px;
            border-bottom: 2px solid #007acc;
            position: sticky;
            top: 0;
            z-index: 10;
          }

          #xlsx-preview-table td {
            background: #fff;
            color: #333;
            font-size: 11px;
            line-height: 1.2;
          }

          /* 行悬停效果 */
          #xlsx-preview-table tr:hover td {
            background: #e3f2fd !important;
            transition: background-color 0.2s ease;
          }

          /* 交替行颜色 */
          #xlsx-preview-table tr:nth-child(even) td {
            background: #fafafa;
          }

          /* 数字右对齐 */
          #xlsx-preview-table td[data-type="n"] {
            text-align: right;
            font-family: 'Courier New', monospace;
            font-weight: 500;
          }

          /* 字符串左对齐 */
          #xlsx-preview-table td[data-type="s"] {
            text-align: left;
          }

          /* 日期格式 */
          #xlsx-preview-table td[data-type="d"] {
            text-align: center;
            font-family: 'Courier New', monospace;
            color: #666;
          }

          /* 布尔值居中 */
          #xlsx-preview-table td[data-type="b"] {
            text-align: center;
            font-weight: bold;
            color: #007acc;
          }

          /* 错误值样式 */
          #xlsx-preview-table td[data-type="e"] {
            background: #ffebee;
            color: #c62828;
            font-style: italic;
            text-align: center;
          }

          /* 空单元格样式 */
          #xlsx-preview-table td:empty {
            background: #f5f5f5;
            border-style: dashed;
            border-color: #ddd;
          }

          /* 滚动条样式 */
          .xlsx-scroll-container {
            max-height: 600px;
            overflow: auto;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #fff;
          }

          .xlsx-scroll-container::-webkit-scrollbar {
            width: 12px;
            height: 12px;
          }

          .xlsx-scroll-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 6px;
          }

          .xlsx-scroll-container::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 6px;
            border: 2px solid #f1f1f1;
          }

          .xlsx-scroll-container::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }

          /* 单元格选择效果 */
          #xlsx-preview-table td:focus {
            outline: 2px solid #007acc;
            outline-offset: -2px;
            background: #e3f2fd !important;
          }

          /* 字体优化 */
          #xlsx-preview-table {
            font-family: 'Segoe UI', 'Calibri', 'Arial', sans-serif;
          }
        `}
      </style>
      <div className="xlsx-scroll-container">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
};

export function createXlsxPreviewPlugin(
  config: XlsxPreviewPluginConfig = {}
): FilePreviewPlugin {
  return {
    name: "XlsxPreviewPlugin",
    version: "1.0.0",
    description: "Offline XLSX preview via SheetJS",
    supportedTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    supportedExtensions: [".xlsx"],
    config,
    hooks: {
      getPriority: () => 8,
      render: (context) => {
        return <XlsxPreviewComponent context={context} config={config} />;
      },
      renderToolbar: (context) => {
        const handleDownload = () => {
          const link = document.createElement("a");
          link.href = context.file.url;
          link.download = context.file.name;
          link.click();
        };

        // 提供 Sheet 切换
        return (
          <ToolbarContainer>
            <FileInfo
              name={context.file.name}
              size={context.file.size}
              type="XLSX"
              icon="📊"
            />
            <ToolbarSeparator />
            <SheetSwitcher context={context} />
            <ToolbarSeparator />
            <ToolbarButton onClick={handleDownload} icon="📥" title="Download">
              Download
            </ToolbarButton>
          </ToolbarContainer>
        );
      },
    },
  };

  function SheetSwitcher({ context }: { context: PluginContext }) {
    // 简化：暂时禁用 Sheet 切换功能，避免死循环
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: "#666" }}>Sheet: 1</span>
      </div>
    );
  }
}
