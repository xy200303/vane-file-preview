/**
 * 轻量级核心包
 * 只包含基础功能，不包含任何第三方依赖
 */

export { FilePreviewCore } from "./FilePreviewCore";
export type { FilePreviewCoreProps } from "./FilePreviewCore";

// 从 plugins/types.ts 导出核心类型
export type {
  FileInfo,
  PreviewState,
  PreviewStateInfo,
  PreviewDimensions,
  PreviewProgress,
  PluginContext,
  FilePreviewPlugin,
  PluginHooks,
  PluginBus,
  PluginManager,
} from "../plugins/types";

// 插件系统
export { withPlugins } from "../plugins/withPlugins";
export { createPluginBus } from "../plugins/PluginBus";
export { createPluginManager } from "../plugins/PluginManager";

// 基础工具
export {
  createIsolatedContainer,
  createIsolatedContent,
  createIsolatedOverlay,
} from "../custom-plugins/styles/isolatedStyles";
