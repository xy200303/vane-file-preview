/**
 * PDF 预览插件
 * 使用 iframe 或 embed 标签预览 PDF
 */

import {
  FileInfo,
  ToolbarButton,
  ToolbarContainer,
  ToolbarSeparator,
} from "./shared/ToolbarComponents";

import type { FilePreviewPlugin } from "../plugins/types";
import React from "react";

export interface PdfPreviewPluginConfig {
  useIframe?: boolean;
  enableToolbar?: boolean;
}

export function createPdfPreviewPlugin(
  config: PdfPreviewPluginConfig = {}
): FilePreviewPlugin {
  const { useIframe = true, enableToolbar = true } = config;

  return {
    name: "PdfPreviewPlugin",
    version: "1.0.0",
    description: "PDF preview using iframe or embed",
    supportedTypes: ["application/pdf"],
    supportedExtensions: [".pdf"],
    config,

    hooks: {
      getPriority: () => 10,

      render: (context) => {
        const { file, state } = context;

        if (state.state !== "loaded" && state.state !== "loading") {
          return null;
        }

        const pdfUrl = enableToolbar
          ? file.url
          : `${file.url}#toolbar=0&navpanes=0&scrollbar=0`;

        if (useIframe) {
          return (
            <iframe
              src={pdfUrl}
              title={file.name}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          );
        }

        return (
          <embed
            src={pdfUrl}
            type="application/pdf"
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        );
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
              type="PDF Document"
              icon="📄"
            />

            <ToolbarSeparator />

            <ToolbarButton
              onClick={handleDownload}
              icon="📥"
              title="Download PDF"
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
