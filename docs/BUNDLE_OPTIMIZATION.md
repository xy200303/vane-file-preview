# 📦 包体积优化指南

## 问题分析

当前包体积较大（4.7MB）的主要原因：

- 包含大量第三方库（PDF.js、XLSX、Mammoth、Highlight.js 等）
- 所有插件打包在一起
- 没有按需加载机制

## 优化方案

### 1. 轻量级核心包

```bash
# 只安装核心功能（< 50KB）
npm install @dev_xiaoyun/vane-file-preview
```

```tsx
import { FilePreviewCore, withPlugins } from "@dev_xiaoyun/vane-file-preview/core";
import { createImagePreviewPlugin } from "@dev_xiaoyun/vane-file-preview/plugins";

// 只包含图片预览，包体积 < 100KB
const ImagePreview = withPlugins(FilePreviewCore, [createImagePreviewPlugin()]);
```

### 2. 按需导入插件

```tsx
// 只导入需要的插件
import { createPdfPreviewPlugin } from "@dev_xiaoyun/vane-file-preview/plugins";
import { createCodePreviewPlugin } from "@dev_xiaoyun/vane-file-preview/plugins";

// 包体积根据导入的插件动态计算
const DocumentPreview = withPlugins(FilePreviewCore, [
  createPdfPreviewPlugin(),
  createCodePreviewPlugin(),
]);
```

### 3. 动态导入（推荐）

```tsx
// 运行时按需加载，初始包体积最小
const createPreview = async (fileType: string) => {
  const { FilePreviewCore, withPlugins } = await import(
    "@dev_xiaoyun/vane-file-preview/core"
  );

  let plugins = [];
  switch (fileType) {
    case "image":
      const { createImagePreviewPlugin } = await import(
        "@dev_xiaoyun/vane-file-preview/plugins"
      );
      plugins = [createImagePreviewPlugin()];
      break;
    case "pdf":
      const { createPdfPreviewPlugin } = await import(
        "@dev_xiaoyun/vane-file-preview/plugins"
      );
      plugins = [createPdfPreviewPlugin()];
      break;
  }

  return withPlugins(FilePreviewCore, plugins);
};
```

## 包体积对比

| 方案     | 包体积       | 适用场景                       |
| -------- | ------------ | ------------------------------ |
| 全量包   | ~4.7MB       | 需要所有功能的完整应用         |
| 核心包   | ~50KB        | 只需要基础预览功能             |
| 单插件   | ~100-500KB   | 只需要特定文件类型预览         |
| 动态导入 | ~50KB + 按需 | 需要多种文件类型但希望按需加载 |

## 最佳实践

### 1. 根据需求选择方案

```tsx
// 只需要图片预览
import { FilePreviewCore, withPlugins } from "@dev_xiaoyun/vane-file-preview/core";
import { createImagePreviewPlugin } from "@dev_xiaoyun/vane-file-preview/plugins";

// 需要多种文件类型
import { FilePreviewCore, withPlugins } from "@dev_xiaoyun/vane-file-preview";
import {
  createImagePreviewPlugin,
  createPdfPreviewPlugin,
  createCodePreviewPlugin,
} from "@dev_xiaoyun/vane-file-preview/plugins";

// 需要所有功能
import { FilePreviewCore, withPlugins } from "@dev_xiaoyun/vane-file-preview";
import * as plugins from "@dev_xiaoyun/vane-file-preview/plugins";
```

### 2. 使用 Tree Shaking

```tsx
// ✅ 推荐：按需导入
import { createImagePreviewPlugin } from "@dev_xiaoyun/vane-file-preview/plugins";

// ❌ 避免：全量导入
import * as plugins from "@dev_xiaoyun/vane-file-preview/plugins";
```

### 3. 配置 Webpack/Vite

```js
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vaneFilePreview: {
          test: /[\\/]node_modules[\\/]@dev_xiaoyun[\\/]vane-file-preview[\\/]/,
          name: "@dev_xiaoyun/vane-file-preview",
          chunks: "all",
        },
      },
    },
  },
};
```

## 迁移指南

### 从全量包迁移到按需导入

```tsx
// 之前
import { FilePreviewCore, withPlugins } from "@dev_xiaoyun/vane-file-preview";
import {
  createImagePreviewPlugin,
  createPdfPreviewPlugin,
} from "@dev_xiaoyun/vane-file-preview";

// 之后
import { FilePreviewCore, withPlugins } from "@dev_xiaoyun/vane-file-preview/core";
import {
  createImagePreviewPlugin,
  createPdfPreviewPlugin,
} from "@dev_xiaoyun/vane-file-preview/plugins";
```

## 监控包体积

```bash
# 分析包体积
npm run build:analyze

# 查看各插件大小
npm run build:plugins -- --analyze
```

## 总结

通过以上优化方案，可以将包体积从 4.7MB 降低到：

- 核心包：~50KB
- 单插件：~100-500KB
- 按需加载：~50KB + 运行时加载

选择合适的方案可以显著提升应用性能！

