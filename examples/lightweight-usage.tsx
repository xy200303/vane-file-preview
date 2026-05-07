/**
 * 轻量级使用示例
 * 只导入需要的插件，大幅减小包体积
 */

// 方案1: 只使用核心 + 特定插件

import { FilePreviewCore, withPlugins } from "vane-file-preview/core";

import { createCodePreviewPlugin } from "vane-file-preview/plugins";
import { createImagePreviewPlugin } from "vane-file-preview/plugins";
import { createPdfPreviewPlugin } from "vane-file-preview/plugins";

// 只包含图片预览功能，包体积 < 100KB
const LightweightImagePreview = withPlugins(FilePreviewCore, [
  createImagePreviewPlugin({
    enableZoom: true,
    enableRotation: true,
  }),
]);

// 方案2: 按需导入多个插件



// 只包含 PDF + 代码预览，包体积 < 500KB
const DocumentPreview = withPlugins(FilePreviewCore, [
  createPdfPreviewPlugin({
    enableTextSelection: true,
  }),
  createCodePreviewPlugin({
    theme: "github",
    showLineNumbers: true,
  }),
]);

// 方案3: 动态导入插件（运行时按需加载）
const createDynamicPreview = async (fileType: string) => {
  const { FilePreviewCore, withPlugins } = await import(
    "vane-file-preview/core"
  );

  let plugins = [];

  switch (fileType) {
    case "image":
      const { createImagePreviewPlugin } = await import(
        "vane-file-preview/plugins"
      );
      plugins = [createImagePreviewPlugin()];
      break;
    case "pdf":
      const { createPdfPreviewPlugin } = await import(
        "vane-file-preview/plugins"
      );
      plugins = [createPdfPreviewPlugin()];
      break;
    case "code":
      const { createCodePreviewPlugin } = await import(
        "vane-file-preview/plugins"
      );
      plugins = [createCodePreviewPlugin()];
      break;
    // ... 其他文件类型
  }

  return withPlugins(FilePreviewCore, plugins);
};

export { LightweightImagePreview, DocumentPreview, createDynamicPreview };
