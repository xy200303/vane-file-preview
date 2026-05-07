/**
 * FilePreviewPlugin 系统入口
 * 插件式文件预览组件架构
 */

// 核心组件
export { default as FilePreviewCore } from "./core/FilePreviewCore";
export type {
  FilePreviewCoreProps,
  FilePreviewCoreRef,
} from "./core/FilePreviewCore";

// 插件系统
export { withPlugins } from "./plugins/withPlugins";
export { createPluginBus } from "./plugins/PluginBus";
export { createPluginManager } from "./plugins/PluginManager";

// 类型定义
export type {
  FileInfo,
  PreviewDimensions,
  PreviewProgress,
  PreviewState,
  PreviewStateInfo,
  PluginBus,
  PluginContext,
  PluginHooks,
  FilePreviewPlugin,
  PluginManager,
} from "./plugins/types";

// 预览插件
export * from "./custom-plugins";
