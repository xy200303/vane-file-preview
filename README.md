# 🗂️ Vane File Preview

一个功能强大、高度可扩展的 React 文件预览组件库

[![NPM Version](https://img.shields.io/badge/npm-v1.0.0-blue)](https://www.npmjs.com/package/vane-file-preview)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)

[在线演示](https://chinavane.netlify.app/) | [快速开始](#快速开始) | [插件列表](#插件列表) | [API 文档](#api-文档)

---

## ✨ 核心特性

### 🔌 **插件化架构**

- 基于事件总线的插件系统，支持灵活组合
- 15+ 内置预览插件，覆盖主流文件格式
- 易于扩展，支持自定义插件开发

### 📄 **丰富的文件格式支持**

- **文档类**：PDF、Word (DOCX)、PowerPoint (PPTX)、Excel (XLSX)、Markdown、EPUB
- **代码类**：JavaScript、TypeScript、Python、Java、CSS、HTML 等 180+ 语言
- **数据类**：JSON、CSV、TSV 等结构化数据
- **媒体类**：图片、音频、视频
- **压缩包**：ZIP 文件内容预览

### ⚡ **性能优化**

- 懒加载机制，按需渲染
- 虚拟滚动支持大文件预览
- 内存缓存优化
- 支持文件流式加载
- 响应式设计，适配各种屏幕尺寸

### 🛡️ **稳健性**

- 完善的错误处理机制
- 文件格式自动检测
- 降级预览策略
- TypeScript 类型安全

### 🎨 **用户体验**

- 统一的预览界面设计
- 主题切换支持（亮色/暗色/自动）
- 语法高亮、代码折叠
- 搜索、导航、缩放等交互功能
- 可访问性支持

---

## 📦 安装

### NPM / Yarn / PNPM

```bash
# npm
npm install vane-file-preview

# yarn
yarn add vane-file-preview

# pnpm
pnpm add vane-file-preview
```

### 本地开发

如果您想本地运行演示站点或进行二次开发：

```bash
# 克隆仓库
git clone https://github.com/frankvane/vane-file-preview.git

# 进入项目目录
cd vane-file-preview

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview
```

---

## 🚀 快速开始

### 基础使用

最简单的使用方式，不带任何插件：

```tsx
import { FilePreviewCore } from "vane-file-preview";

function App() {
  const fileInfo = {
    name: "example.pdf",
    url: "/path/to/example.pdf",
    size: 1024000,
    type: "application/pdf",
  };

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <FilePreviewCore
        file={fileInfo}
        onLoadStart={() => console.log("开始加载")}
        onLoadSuccess={() => console.log("加载成功")}
        onLoadError={(error) => console.error("加载失败", error)}
      />
    </div>
  );
}
```

### 使用插件

通过 `withPlugins` 高阶组件组合多个预览插件：

```tsx
import {
  FilePreviewCore,
  withPlugins,
  createPdfPreviewPlugin,
  createImagePreviewPlugin,
  createJsonPreviewPlugin,
} from "vane-file-preview";

// 组合插件
const FilePreview = withPlugins(FilePreviewCore, [
  createPdfPreviewPlugin({
    enableTextSelection: true,
    scale: 1.2,
  }),
  createImagePreviewPlugin({
    enableZoom: true,
    enableRotation: true,
  }),
  createJsonPreviewPlugin({
    theme: "auto",
    enableSearch: true,
    collapsed: false,
  }),
]);

function App() {
  const fileInfo = {
    name: "data.json",
    url: "/path/to/data.json",
    size: 2048,
    type: "application/json",
  };

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <FilePreview
        file={fileInfo}
        containerStyle={{ border: "1px solid #ddd", borderRadius: 8 }}
      />
    </div>
  );
}
```

### 完整示例：多格式文件预览器

```tsx
import {
  FilePreviewCore,
  withPlugins,
  createPdfPreviewPlugin,
  createImagePreviewPlugin,
  createJsonPreviewPlugin,
  createCodePreviewPlugin,
  createMarkdownPreviewPlugin,
  createDocxPreviewPlugin,
  createXlsxPreviewPlugin,
  createVideoPreviewPlugin,
  createAudioPreviewPlugin,
  createZipPreviewPlugin,
} from "vane-file-preview";

const UniversalFilePreview = withPlugins(FilePreviewCore, [
  // 文档预览
  createPdfPreviewPlugin(),
  createDocxPreviewPlugin(),
  createXlsxPreviewPlugin(),

  // 代码预览
  createCodePreviewPlugin({
    theme: "github",
    showLineNumbers: true,
    enableCodeFolding: true,
  }),
  createMarkdownPreviewPlugin({
    enableMath: true,
    enableMermaid: true,
  }),

  // 数据预览
  createJsonPreviewPlugin({
    theme: "auto",
    enableSearch: true,
  }),

  // 媒体预览
  createImagePreviewPlugin({
    enableZoom: true,
    enableRotation: true,
  }),
  createVideoPreviewPlugin({
    controls: true,
    autoplay: false,
  }),
  createAudioPreviewPlugin({
    showPlaylist: true,
  }),

  // 压缩包预览
  createZipPreviewPlugin({
    maxDepth: 3,
    showFileSize: true,
  }),
]);

export default function FilePreviewDemo() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile({
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        type: file.type,
      });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <input
        type="file"
        onChange={handleFileSelect}
        style={{ marginBottom: 20 }}
      />

      {selectedFile && (
        <div style={{ height: 600, border: "1px solid #ddd", borderRadius: 8 }}>
          <UniversalFilePreview
            file={selectedFile}
            onLoadError={(error) => {
              console.error("文件预览失败:", error);
              alert("文件预览失败，请检查文件格式是否支持");
            }}
          />
        </div>
      )}
    </div>
  );
}
```

---

## 📚 插件列表

本项目提供 15+ 个开箱即用的预览插件，按文件类型分类如下：

### 📄 文档预览插件

| 插件                          | 支持格式 | 主要功能                          |
| ----------------------------- | -------- | --------------------------------- |
| `createPdfPreviewPlugin`      | PDF      | 页面导航、缩放、文本选择、搜索    |
| `createDocxPreviewPlugin`     | DOCX     | 文档渲染、样式保持、图片显示      |
| `createXlsxPreviewPlugin`     | XLSX     | 表格预览、工作表切换、数据筛选    |
| `createMarkdownPreviewPlugin` | MD       | Markdown 渲染、数学公式、代码高亮 |
| `createEpubPreviewPlugin`     | EPUB     | 电子书阅读、章节导航、字体调节    |

### 💻 代码预览插件

| 插件                      | 支持格式  | 主要功能                           |
| ------------------------- | --------- | ---------------------------------- |
| `createCodePreviewPlugin` | 180+ 语言 | 语法高亮、行号、代码折叠、主题切换 |
| `createJsonPreviewPlugin` | JSON      | 结构化显示、搜索、折叠、主题切换   |

### 📊 数据预览插件

| 插件                     | 支持格式 | 主要功能                   |
| ------------------------ | -------- | -------------------------- |
| `createCsvPreviewPlugin` | CSV/TSV  | 表格显示、分页、排序、筛选 |

### 🖼️ 媒体预览插件

| 插件                       | 支持格式        | 主要功能                     |
| -------------------------- | --------------- | ---------------------------- |
| `createImagePreviewPlugin` | JPG/PNG/GIF/SVG | 缩放、旋转、全屏查看         |
| `createVideoPreviewPlugin` | MP4/WebM/OGV    | 播放控制、进度条、音量调节   |
| `createAudioPreviewPlugin` | MP3/WAV/OGG     | 音频播放、波形显示、播放列表 |

### 🗜️ 压缩包预览插件

| 插件                     | 支持格式 | 主要功能                   |
| ------------------------ | -------- | -------------------------- |
| `createZipPreviewPlugin` | ZIP      | 文件列表、目录树、文件提取 |

### 🔧 通用插件

| 插件                        | 说明         |
| --------------------------- | ------------ |
| `createDownloadPlugin`      | 文件下载功能 |
| `createErrorBoundaryPlugin` | 错误边界处理 |
| `createLoadingPlugin`       | 加载状态显示 |

> 💡 **提示**：所有插件都可以通过 `vane-file-preview` 包导入。详细配置请参考 [API 文档](#api-文档) 或查看 [在线演示](https://chinavane.netlify.app/)。

---

## 📂 项目结构

```
vane-file-preview/
├── src/
│   ├── components/
│   │   └── FilePreviewPlugin/
│   │       ├── core/
│   │       │   └── FilePreviewCore.tsx    # 核心组件
│   │       ├── plugins/
│   │       │   ├── types.ts               # 插件类型定义
│   │       │   ├── PluginBus.ts           # 事件总线
│   │       │   ├── PluginManager.ts       # 插件管理器
│   │       │   ├── withPlugins.tsx        # HOC 组合方法
│   │       │   └── index.ts               # 插件系统导出
│   │       ├── custom-plugins/             # 15+ 自定义预览插件
│   │       │   ├── PdfPreviewPlugin.tsx
│   │       │   ├── ImagePreviewPlugin.tsx
│   │       │   ├── JsonPreviewPlugin.tsx
│   │       │   ├── CodePreviewPlugin.tsx
│   │       │   ├── MarkdownPreviewPlugin.tsx
│   │       │   ├── DocxPreviewPlugin.tsx
│   │       │   ├── XlsxPreviewPlugin.tsx
│   │       │   ├── VideoPreviewPlugin.tsx
│   │       │   ├── AudioPreviewPlugin.tsx
│   │       │   ├── ZipPreviewPlugin.tsx
│   │       │   └── ...
│   │       └── index.ts                   # 统一导出
│   ├── pages/
│   │   └── FilePreviewPlugin/
│   │       └── Example.tsx                # 演示页面
│   ├── App.tsx                            # 应用入口
│   └── main.tsx                           # React 入口
├── public/                                # 测试文件
│   ├── example.jpg
│   ├── sample-data.csv
│   ├── sample-config.json
│   ├── test.docx
│   ├── test.xlsx
│   ├── typescript.pdf
│   └── ...
├── dist/                                  # 构建产物
├── vite.config.ts                         # Vite 配置
├── tsconfig.json                          # TypeScript 配置
└── package.json                           # 项目配置
```

---

## 🔧 API 文档

### FilePreviewCore

核心文件预览组件，提供基础的文件预览能力。

#### Props

```typescript
interface FilePreviewCoreProps {
  // 文件信息（必需）
  file: FileInfo;

  // 生命周期回调
  onBeforeLoad?: () => Promise<boolean> | boolean;
  onLoadStart?: () => void;
  onLoadSuccess?: () => void;
  onLoadError?: (error: Error) => void;

  // 渲染增强
  children?: React.ReactNode;

  // 样式
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
  contentStyle?: React.CSSProperties;
  contentClassName?: string;

  // 外部 refs（供插件使用）
  containerRefExternal?: React.RefObject<HTMLDivElement | null>;
  contentRefExternal?: React.RefObject<HTMLDivElement | null>;
}

interface FileInfo {
  name: string; // 文件名
  url: string; // 文件 URL
  size?: number; // 文件大小（字节）
  type?: string; // MIME 类型
}
```

#### Ref 方法

```typescript
interface FilePreviewCoreRef {
  reload: () => void; // 重新加载文件
  reset: () => void; // 重置组件状态
  getState: () => PreviewStateInfo; // 获取当前状态
}
```

### withPlugins

高阶组件，用于为 FilePreviewCore 添加插件功能。

```typescript
function withPlugins<T extends ComponentType<any>>(
  Component: T,
  plugins: Plugin[]
): ComponentType<ComponentProps<T>>;
```

#### 使用示例

```typescript
import {
  FilePreviewCore,
  withPlugins,
  createPdfPreviewPlugin,
} from "vane-file-preview";

const EnhancedFilePreview = withPlugins(FilePreviewCore, [
  createPdfPreviewPlugin({
    enableTextSelection: true,
    scale: 1.0,
  }),
]);
```

### 插件配置

#### PDF 预览插件

```typescript
createPdfPreviewPlugin({
  enableTextSelection?: boolean;  // 启用文本选择，默认 true
  scale?: number;                 // 缩放比例，默认 1.0
  enableNavigation?: boolean;     // 启用页面导航，默认 true
  enableSearch?: boolean;         // 启用搜索功能，默认 true
})
```

#### JSON 预览插件

```typescript
createJsonPreviewPlugin({
  theme?: "light" | "dark" | "auto";  // 主题，默认 "auto"
  enableSearch?: boolean;             // 启用搜索，默认 true
  collapsed?: boolean;                // 默认折叠，默认 false
  displayDataTypes?: boolean;         // 显示数据类型，默认 true
})
```

#### 代码预览插件

```typescript
createCodePreviewPlugin({
  theme?: string;                     // 代码主题，默认 "github"
  showLineNumbers?: boolean;          // 显示行号，默认 true
  enableCodeFolding?: boolean;        // 启用代码折叠，默认 true
  wrapLongLines?: boolean;           // 长行换行，默认 false
})
```

#### 图片预览插件

```typescript
createImagePreviewPlugin({
  enableZoom?: boolean;              // 启用缩放，默认 true
  enableRotation?: boolean;          // 启用旋转，默认 true
  enableFullscreen?: boolean;        // 启用全屏，默认 true
  maxZoom?: number;                  // 最大缩放比例，默认 3
})
```

---

## 🎯 使用场景

### 1. 文档管理系统

```tsx
// 企业文档管理系统
const DocumentViewer = withPlugins(FilePreviewCore, [
  createPdfPreviewPlugin({ enableTextSelection: true }),
  createDocxPreviewPlugin({ preserveFormatting: true }),
  createXlsxPreviewPlugin({ enableFiltering: true }),
  createDownloadPlugin({ showDownloadButton: true }),
]);
```

### 2. 代码审查平台

```tsx
// 代码审查工具
const CodeReviewer = withPlugins(FilePreviewCore, [
  createCodePreviewPlugin({
    theme: "vs-dark",
    showLineNumbers: true,
    enableCodeFolding: true,
  }),
  createJsonPreviewPlugin({ theme: "dark" }),
  createMarkdownPreviewPlugin({ enableMath: true }),
]);
```

### 3. 媒体资源管理

```tsx
// 媒体文件管理器
const MediaViewer = withPlugins(FilePreviewCore, [
  createImagePreviewPlugin({
    enableZoom: true,
    enableRotation: true,
  }),
  createVideoPreviewPlugin({
    controls: true,
    preload: "metadata",
  }),
  createAudioPreviewPlugin({
    showWaveform: true,
  }),
]);
```

### 4. 数据分析工具

```tsx
// 数据文件预览器
const DataViewer = withPlugins(FilePreviewCore, [
  createCsvPreviewPlugin({
    enableSorting: true,
    enableFiltering: true,
    pageSize: 100,
  }),
  createJsonPreviewPlugin({
    enableSearch: true,
    displayDataTypes: true,
  }),
  createXlsxPreviewPlugin({
    enableSheetSwitching: true,
  }),
]);
```

---

## 🔌 自定义插件开发

### 插件接口

```typescript
interface Plugin {
  name: string;
  version: string;
  canHandle: (file: FileInfo) => boolean;
  render: (props: PluginRenderProps) => React.ReactNode;
  onMount?: (context: PluginContext) => void;
  onUnmount?: (context: PluginContext) => void;
}
```

### 创建自定义插件

```typescript
import { Plugin, FileInfo } from "vane-file-preview";

export function createCustomPreviewPlugin(options = {}) {
  return {
    name: "CustomPreviewPlugin",
    version: "1.0.0",

    canHandle: (file: FileInfo) => {
      // 判断是否能处理该文件类型
      return file.type === "application/custom";
    },

    render: ({
      file,
      containerRef,
      onLoadStart,
      onLoadSuccess,
      onLoadError,
    }) => {
      // 渲染预览内容
      return (
        <div ref={containerRef}>
          <h3>自定义预览：{file.name}</h3>
          {/* 自定义预览逻辑 */}
        </div>
      );
    },

    onMount: (context) => {
      console.log("插件已挂载", context);
    },

    onUnmount: (context) => {
      console.log("插件已卸载", context);
    },
  } as Plugin;
}
```

### 使用自定义插件

```typescript
import { FilePreviewCore, withPlugins } from "vane-file-preview";
import { createCustomPreviewPlugin } from "./CustomPreviewPlugin";

const CustomFilePreview = withPlugins(FilePreviewCore, [
  createCustomPreviewPlugin({
    // 插件配置选项
  }),
]);
```

---

## 🌟 高级特性

### 主题系统

支持亮色、暗色和自动主题切换：

```tsx
// 全局主题配置
const ThemedFilePreview = withPlugins(FilePreviewCore, [
  createJsonPreviewPlugin({ theme: "auto" }),
  createCodePreviewPlugin({ theme: "vs-dark" }),
]);

// 运行时主题切换
const [theme, setTheme] = useState("auto");

<ThemedFilePreview file={fileInfo} theme={theme} />;
```

### 性能优化

#### 懒加载

```tsx
// 大文件懒加载
const LazyFilePreview = withPlugins(FilePreviewCore, [
  createPdfPreviewPlugin({
    lazyLoading: true,
    pageBufferSize: 3,
  }),
]);
```

#### 虚拟滚动

```tsx
// 大数据集虚拟滚动
const VirtualizedPreview = withPlugins(FilePreviewCore, [
  createCsvPreviewPlugin({
    enableVirtualization: true,
    rowHeight: 40,
    overscan: 10,
  }),
]);
```

### 错误处理

```tsx
const RobustFilePreview = withPlugins(FilePreviewCore, [
  createErrorBoundaryPlugin({
    fallback: (error) => <div>预览失败：{error.message}</div>,
  }),
  // 其他插件...
]);
```

---

## 🤝 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

### 开发环境设置

```bash
# 1. Fork 并克隆仓库
git clone https://github.com/your-username/vane-file-preview.git

# 2. 安装依赖
cd vane-file-preview
npm install

# 3. 启动开发服务器
npm run dev

# 4. 运行测试
npm test

# 5. 构建项目
npm run build
```

### 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 功能添加
git commit -m "feat: 添加 PowerPoint 预览插件"

# 问题修复
git commit -m "fix: 修复 PDF 缩放问题"

# 文档更新
git commit -m "docs: 更新 API 文档"

# 性能优化
git commit -m "perf: 优化大文件加载性能"
```

### 插件开发指南

1. 在 `src/components/FilePreviewPlugin/custom-plugins/` 目录下创建新插件
2. 实现 `Plugin` 接口
3. 添加相应的类型定义
4. 编写单元测试
5. 更新文档和示例

---

## 📄 许可证

本项目采用 [MIT 许可证](./LICENSE)。

---

## 🙏 致谢

感谢以下开源项目的支持：

- [React](https://reactjs.org/) - UI 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Vite](https://vitejs.dev/) - 构建工具
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF 渲染
- [Highlight.js](https://highlightjs.org/) - 代码高亮
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown 渲染

---

## 📞 联系我们

- **GitHub Issues**: [提交问题](https://github.com/frankvane/vane-file-preview/issues)
- **GitHub Discussions**: [参与讨论](https://github.com/frankvane/vane-file-preview/discussions)
- **Email**: chinavane_2008@163.com

---

<div align="center">

**如果这个项目对您有帮助，请给我们一个 ⭐️**

[⬆️ 回到顶部](#-vane-file-preview)
