import React, { useEffect, useState } from "react";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useLocation } from "react-router-dom";

type DemoPageProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

// 路由路径到文件名的映射
const routeToFileMap: Record<string, string> = {
  "/file-preview/image": "ImagePreviewDemo",
  "/file-preview/pdf": "PdfPreviewDemo",
  "/file-preview/video": "VideoPreviewDemo",
  "/file-preview/audio": "AudioPreviewDemo",
  "/file-preview/code": "CodePreviewDemo",
  "/file-preview/markdown": "MarkdownPreviewDemo",
  "/file-preview/office": "OfficePreviewDemo",
  "/file-preview/csv": "CsvPreviewDemo",
  "/file-preview/json": "JsonPreviewDemo",
  "/file-preview/zip": "ZipPreviewDemo",
  "/file-preview/epub": "EpubPreviewDemo",
  "/fp-plugin/example": "Example",
};

const DemoPage: React.FC<DemoPageProps> = ({
  title,
  description,
  children,
}) => {
  const location = useLocation();
  const [sourceCode, setSourceCode] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const loadSourceCode = async () => {
      // 获取当前路由对应的文件名
      const fileName = routeToFileMap[location.pathname];
      if (fileName) {
        try {
          // 动态导入源码文件（使用 ?raw 后缀）
          const module = await import(`../${fileName}.tsx?raw`);
          setSourceCode(module.default);
        } catch (error) {
          console.error("加载源码失败:", error);
          setSourceCode("// 源码加载失败");
        }
      }
    };

    loadSourceCode();
  }, [location.pathname]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(sourceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("复制失败:", error);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        {description ? <p className="page-desc">{description}</p> : null}
      </div>
      <div className="page-card">{children}</div>

      {sourceCode && (
        <div className="page-card" style={{ marginTop: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.2em" }}>源码</h2>
            <button
              onClick={handleCopyCode}
              style={{
                padding: "8px 16px",
                background: copied ? "#27ae60" : "#3498db",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => {
                if (!copied) {
                  e.currentTarget.style.background = "#2980b9";
                }
              }}
              onMouseLeave={(e) => {
                if (!copied) {
                  e.currentTarget.style.background = "#3498db";
                }
              }}
            >
              {copied ? (
                <>
                  <span>✓</span>
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>复制代码</span>
                </>
              )}
            </button>
          </div>
          <SyntaxHighlighter
            language="tsx"
            style={tomorrow}
            showLineNumbers={true}
            wrapLines={true}
            wrapLongLines={true}
            customStyle={{
              borderRadius: "4px",
              fontSize: "14px",
              lineHeight: "1.5",
              margin: 0,
            }}
          >
            {sourceCode}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
};

export default DemoPage;
