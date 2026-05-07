/**
 * CSV/TSV 表格预览插件
 * 支持分页、列宽调整、筛选、导出等功能
 */

import {
  FileInfo,
  ToolbarButton,
  ToolbarContainer,
  ToolbarSeparator,
} from "./shared/ToolbarComponents";
import type { FilePreviewPlugin, PluginContext } from "../plugins/types";
import React, { useEffect, useMemo, useState } from "react";

import Papa from "papaparse";

interface CsvData {
  headers: string[];
  rows: any[][];
  totalRows: number;
}

export interface CsvPreviewConfig {
  pageSize?: number;
  maxPreviewRows?: number;
  autoDetectDelimiter?: boolean;
  autoDetectEncoding?: boolean;
}

const CsvPreviewComponent: React.FC<{
  context: PluginContext;
  config?: CsvPreviewConfig;
}> = ({ context, config = {} }) => {
  const { file, state } = context;
  const {
    pageSize = 50,
    maxPreviewRows = 1000,
    autoDetectDelimiter = true,
    autoDetectEncoding = true,
  } = config;

  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [delimiter, setDelimiter] = useState<string>(",");
  const [encoding, setEncoding] = useState<string>("utf-8");
  const [manualDelimiter, setManualDelimiter] = useState<string>("");

  // 解析 CSV 数据
  useEffect(() => {
    if (state.state !== "loaded" || !file.url) return;

    const parseCsv = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("📊 开始解析 CSV 文件:", file.url);

        // 获取文件内容
        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error(
            `文件加载失败: ${response.status} ${response.statusText}`
          );
        }

        let text = await response.text();
        console.log("📄 文件内容长度:", text.length);

        // 自动检测编码
        if (autoDetectEncoding) {
          const detectedEncoding = detectEncoding(text);
          if (detectedEncoding !== "utf-8") {
            console.log("🔍 检测到编码:", detectedEncoding);
            setEncoding(detectedEncoding);
            // 这里可以添加编码转换逻辑
          }
        }

        // 自动检测分隔符
        if (autoDetectDelimiter && !manualDelimiter) {
          const detectedDelimiter = detectDelimiter(text);
          console.log("🔍 检测到分隔符:", detectedDelimiter);
          setDelimiter(detectedDelimiter);
        } else if (manualDelimiter) {
          setDelimiter(manualDelimiter);
        }

        // 解析 CSV
        Papa.parse(text, {
          delimiter: delimiter,
          header: false,
          skipEmptyLines: true,
          complete: (results) => {
            console.log("✅ CSV 解析完成:", results);

            if (results.errors.length > 0) {
              console.warn("⚠️ 解析警告:", results.errors);
            }

            const data = results.data as string[][];
            if (data.length === 0) {
              setError("文件为空或格式不正确");
              return;
            }

            const headers = data[0] || [];
            const rows = data.slice(1);
            const totalRows = rows.length;

            console.log("📊 解析结果:", {
              headers: headers.length,
              rows: totalRows,
              preview: rows.slice(0, 3),
            });

            setCsvData({
              headers,
              rows: rows.slice(0, maxPreviewRows), // 限制预览行数
              totalRows: Math.min(totalRows, maxPreviewRows),
            });
          },
          error: (error: any) => {
            console.error("❌ CSV 解析错误:", error);
            setError(`解析失败: ${error.message}`);
          },
        });
      } catch (err: any) {
        console.error("❌ 文件加载错误:", err);
        setError(`文件加载失败: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    parseCsv();
  }, [
    file.url,
    state.state,
    delimiter,
    autoDetectDelimiter,
    autoDetectEncoding,
    maxPreviewRows,
    manualDelimiter,
  ]);

  // 自动检测分隔符
  const detectDelimiter = (text: string): string => {
    const delimiters = [",", ";", "\t", "|"];
    const sample = text.substring(0, 2000); // 增加样本大小

    let bestDelimiter = ",";
    let maxScore = 0;

    for (const delim of delimiters) {
      // 计算分隔符出现次数
      const count = (sample.match(new RegExp(`\\${delim}`, "g")) || []).length;

      // 计算每行的分隔符数量一致性
      const lines = sample.split("\n").slice(0, 10); // 检查前10行
      const delimiterCounts = lines
        .map((line) => (line.match(new RegExp(`\\${delim}`, "g")) || []).length)
        .filter((count) => count > 0);

      if (delimiterCounts.length === 0) continue;

      // 计算标准差，越小说明越一致
      const avg =
        delimiterCounts.reduce((a, b) => a + b, 0) / delimiterCounts.length;
      const variance =
        delimiterCounts.reduce(
          (acc, count) => acc + Math.pow(count - avg, 2),
          0
        ) / delimiterCounts.length;
      const consistency = 1 / (1 + Math.sqrt(variance)); // 一致性分数

      // 综合分数：出现次数 * 一致性
      const score = count * consistency;

      if (score > maxScore) {
        maxScore = score;
        bestDelimiter = delim;
      }
    }

    console.log("🔍 分隔符检测结果:", {
      detected: bestDelimiter,
      score: maxScore,
      sample: sample.substring(0, 100),
    });

    return bestDelimiter;
  };

  // 检测编码
  const detectEncoding = (text: string): string => {
    // 简单的编码检测逻辑
    if (text.includes("")) {
      return "gbk";
    }
    return "utf-8";
  };

  // 过滤和排序数据
  const filteredAndSortedData = useMemo(() => {
    if (!csvData) return null;

    let filteredRows = csvData.rows;

    // 搜索过滤
    if (searchTerm) {
      filteredRows = filteredRows.filter((row) =>
        row.some((cell) =>
          String(cell).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // 排序
    if (sortColumn && csvData.headers.includes(sortColumn)) {
      const columnIndex = csvData.headers.indexOf(sortColumn);
      filteredRows = [...filteredRows].sort((a, b) => {
        const aVal = a[columnIndex] || "";
        const bVal = b[columnIndex] || "";

        if (sortDirection === "asc") {
          return String(aVal).localeCompare(String(bVal));
        } else {
          return String(bVal).localeCompare(String(aVal));
        }
      });
    }

    return {
      ...csvData,
      rows: filteredRows,
    };
  }, [csvData, searchTerm, sortColumn, sortDirection]);

  // 分页数据
  const paginatedData = useMemo(() => {
    if (!filteredAndSortedData) return null;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const totalPages = Math.ceil(filteredAndSortedData.rows.length / pageSize);

    return {
      ...filteredAndSortedData,
      rows: filteredAndSortedData.rows.slice(startIndex, endIndex),
      totalPages,
      currentPage,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, filteredAndSortedData.rows.length),
    };
  }, [filteredAndSortedData, currentPage, pageSize]);

  // 排序处理
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // 列宽调整
  const handleColumnResize = (column: string, width: number) => {
    setColumnWidths((prev) => ({
      ...prev,
      [column]: Math.max(50, width),
    }));
  };

  // 导出数据
  const handleExport = () => {
    if (!csvData) return;

    const csv = Papa.unparse({
      fields: csvData.headers,
      data: csvData.rows,
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = file.name.replace(/\.[^/.]+$/, ".csv");
    link.click();
  };

  if (loading) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
          color: "#6c757d",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <div>Loading CSV...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
          color: "#dc3545",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
          <div>Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!csvData || !paginatedData) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
          color: "#6c757d",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <div>No CSV data available</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* 工具栏 */}
      <div
        style={{
          background: "#f8f9fa",
          borderBottom: "1px solid #dee2e6",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* 搜索框 */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="text"
            placeholder="搜索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "6px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
              width: "200px",
            }}
          />
        </div>

        {/* 分隔符选择 */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "12px", color: "#666" }}>分隔符:</label>
          <select
            value={delimiter}
            onChange={(e) => {
              setDelimiter(e.target.value);
              setManualDelimiter(e.target.value);
            }}
            style={{
              padding: "4px 8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            <option value=",">逗号 (,)</option>
            <option value=";">分号 (;)</option>
            <option value="\t">制表符 (Tab)</option>
            <option value="|">竖线 (|)</option>
          </select>
          {autoDetectDelimiter && !manualDelimiter && (
            <span
              style={{ fontSize: "10px", color: "#28a745", fontWeight: "500" }}
            >
              🔍 自动检测
            </span>
          )}
          {manualDelimiter && (
            <button
              onClick={() => {
                setManualDelimiter("");
                setDelimiter(",");
              }}
              style={{
                padding: "2px 6px",
                fontSize: "10px",
                backgroundColor: "#f8f9fa",
                border: "1px solid #ddd",
                borderRadius: "3px",
                cursor: "pointer",
                color: "#666",
              }}
              title="重置为自动检测"
            >
              🔄 重置
            </button>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* 统计信息 */}
        <div style={{ fontSize: "12px", color: "#666" }}>
          显示 {paginatedData.startIndex}-{paginatedData.endIndex} /{" "}
          {csvData.totalRows} 行
        </div>

        {/* 导出按钮 */}
        <button
          onClick={handleExport}
          style={{
            padding: "6px 12px",
            backgroundColor: "#007acc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          📥 导出 CSV
        </button>
      </div>

      {/* 表格容器 */}
      <div style={{ flex: 1, overflow: "auto", background: "#fff" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
            fontFamily: "monospace",
          }}
        >
          {/* 表头 */}
          <thead
            style={{
              background: "#f8f9fa",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            <tr>
              {csvData.headers.map((header, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(header)}
                  style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dee2e6",
                    cursor: "pointer",
                    userSelect: "none",
                    minWidth: columnWidths[header] || 100,
                    position: "relative",
                    background: sortColumn === header ? "#e3f2fd" : "#f8f9fa",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>{header || `列 ${index + 1}`}</span>
                    {sortColumn === header && (
                      <span style={{ fontSize: "10px" }}>
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                  {/* 列宽调整手柄 */}
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: "4px",
                      cursor: "col-resize",
                      background: "transparent",
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const startX = e.clientX;
                      const startWidth = columnWidths[header] || 100;

                      const handleMouseMove = (e: MouseEvent) => {
                        const newWidth = startWidth + (e.clientX - startX);
                        handleColumnResize(header, newWidth);
                      };

                      const handleMouseUp = () => {
                        document.removeEventListener(
                          "mousemove",
                          handleMouseMove
                        );
                        document.removeEventListener("mouseup", handleMouseUp);
                      };

                      document.addEventListener("mousemove", handleMouseMove);
                      document.addEventListener("mouseup", handleMouseUp);
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>

          {/* 表格内容 */}
          <tbody>
            {paginatedData.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  borderBottom: "1px solid #eee",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    style={{
                      padding: "6px 12px",
                      borderRight: "1px solid #eee",
                      minWidth: columnWidths[csvData.headers[cellIndex]] || 100,
                      maxWidth: "300px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={String(cell)}
                  >
                    {String(cell || "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页控件 */}
      {paginatedData.totalPages > 1 && (
        <div
          style={{
            background: "#f8f9fa",
            borderTop: "1px solid #dee2e6",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "12px", color: "#666" }}>
            第 {currentPage} 页，共 {paginatedData.totalPages} 页
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={{
                padding: "4px 8px",
                border: "1px solid #ddd",
                background: "white",
                borderRadius: "4px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                opacity: currentPage === 1 ? 0.5 : 1,
                fontSize: "12px",
              }}
            >
              首页
            </button>

            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: "4px 8px",
                border: "1px solid #ddd",
                background: "white",
                borderRadius: "4px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                opacity: currentPage === 1 ? 0.5 : 1,
                fontSize: "12px",
              }}
            >
              上一页
            </button>

            <button
              onClick={() =>
                setCurrentPage(
                  Math.min(paginatedData.totalPages, currentPage + 1)
                )
              }
              disabled={currentPage === paginatedData.totalPages}
              style={{
                padding: "4px 8px",
                border: "1px solid #ddd",
                background: "white",
                borderRadius: "4px",
                cursor:
                  currentPage === paginatedData.totalPages
                    ? "not-allowed"
                    : "pointer",
                opacity: currentPage === paginatedData.totalPages ? 0.5 : 1,
                fontSize: "12px",
              }}
            >
              下一页
            </button>

            <button
              onClick={() => setCurrentPage(paginatedData.totalPages)}
              disabled={currentPage === paginatedData.totalPages}
              style={{
                padding: "4px 8px",
                border: "1px solid #ddd",
                background: "white",
                borderRadius: "4px",
                cursor:
                  currentPage === paginatedData.totalPages
                    ? "not-allowed"
                    : "pointer",
                opacity: currentPage === paginatedData.totalPages ? 0.5 : 1,
                fontSize: "12px",
              }}
            >
              末页
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export function createCsvPreviewPlugin(
  config?: CsvPreviewConfig
): FilePreviewPlugin {
  return {
    name: "CsvPreviewPlugin",
    version: "1.0.0",
    description: "CSV/TSV 表格预览插件，支持分页、筛选、排序、导出",
    supportedTypes: [
      "text/csv",
      "application/csv",
      "text/tab-separated-values",
      "text/plain",
    ],
    supportedExtensions: [".csv", ".tsv", ".txt"],
    hooks: {
      getPriority: () => 7,
      render: (context) => {
        return <CsvPreviewComponent context={context} config={config} />;
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
              type="CSV"
              icon="📊"
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
