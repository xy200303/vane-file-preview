/**
 * 插件包入口
 * 按需导入插件，避免全量打包
 */

// 基础插件
export { createDownloadPlugin } from "../custom-plugins/DownloadPlugin";

// 图片插件
export { createImagePreviewPlugin } from "../custom-plugins/ImagePreviewPlugin";

// PDF 插件
export { createPdfPreviewPlugin } from "../custom-plugins/PdfPreviewPlugin";

// 视频插件
export { createVideoPreviewPlugin } from "../custom-plugins/VideoPreviewPlugin";

// 音频插件
export { createAudioPreviewPlugin } from "../custom-plugins/AudioPreviewPlugin";

// 代码插件
export { createCodePreviewPlugin } from "../custom-plugins/CodePreviewPlugin";

// Markdown 插件
export { createMarkdownPreviewPlugin } from "../custom-plugins/MarkdownPreviewPlugin";

// Office 插件
export { createOfficePreviewPlugin } from "../custom-plugins/OfficePreviewPlugin";
export { createDocxPreviewPlugin } from "../custom-plugins/DocxPreviewPlugin";
export { createXlsxPreviewPlugin } from "../custom-plugins/XlsxPreviewPlugin";
export { createPptxPreviewPlugin } from "../custom-plugins/PptxPreviewPlugin";

// 数据插件
export { createCsvPreviewPlugin } from "../custom-plugins/CsvPreviewPlugin";
export { createJsonPreviewPlugin } from "../custom-plugins/JsonPreviewPlugin";

// 压缩包插件
export { createZipPreviewPlugin } from "../custom-plugins/ZipPreviewPlugin";
export { createSimpleReactReaderEpubPlugin as createEpubPreviewPlugin } from "../custom-plugins/SimpleReactReaderEpubPlugin";

// 类型定义 - 从各个插件文件中导入
export type { ImagePreviewPluginConfig } from "../custom-plugins/ImagePreviewPlugin";
export type { PdfPreviewPluginConfig } from "../custom-plugins/PdfPreviewPlugin";
export type { VideoPreviewPluginConfig } from "../custom-plugins/VideoPreviewPlugin";
export type { AudioPreviewPluginConfig } from "../custom-plugins/AudioPreviewPlugin";
export type { CodePreviewPluginConfig } from "../custom-plugins/CodePreviewPlugin";
export type { MarkdownPreviewPluginConfig } from "../custom-plugins/MarkdownPreviewPlugin";
export type { OfficePreviewPluginConfig } from "../custom-plugins/OfficePreviewPlugin";
export type { DocxPreviewPluginConfig } from "../custom-plugins/DocxPreviewPlugin";
export type { XlsxPreviewPluginConfig } from "../custom-plugins/XlsxPreviewPlugin";
export type { PptxPreviewPluginConfig } from "../custom-plugins/PptxPreviewPlugin";
export type { CsvPreviewConfig as CsvPreviewPluginConfig } from "../custom-plugins/CsvPreviewPlugin";
export type { JsonPreviewConfig as JsonPreviewPluginConfig } from "../custom-plugins/JsonPreviewPlugin";
export type { ZipPreviewPluginConfig } from "../custom-plugins/ZipPreviewPlugin";
// EPUB 插件没有配置接口，使用空接口
export type EpubPreviewPluginConfig = {};
