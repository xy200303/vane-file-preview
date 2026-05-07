/**
 * FilePreviewPlugin 插件系统类型定义
 * 参考 LazyLoadImagePlugin 架构模式
 */

import type React from "react";

// ============ 文件信息类型 ============
export interface FileInfo {
  name: string;
  size: number;
  type: string; // MIME type
  extension: string;
  url: string;
  lastModified?: number;
  previewMode?: "online" | "offline"; // 预览模式：在线或离线
  docxMode?: "mammoth" | "docx-preview"; // DOCX 离线预览模式
}

export interface PreviewDimensions {
  width: number;
  height: number;
}

export interface PreviewProgress {
  loaded: number;
  total: number;
  percent: number;
  indeterminate?: boolean;
}

// ============ 预览状态 ============
export type PreviewState =
  | "idle"
  | "loading"
  | "loaded"
  | "error"
  | "unsupported";

export interface PreviewStateInfo {
  state: PreviewState;
  error?: Error;
  message?: string;
}

// ============ 插件通信总线 ============
export interface PluginBus {
  emit: (event: string, data: any) => void;
  on: (event: string, handler: (data: any) => void) => () => void;
  getData: (key: string) => any;
  setData: (key: string, value: any) => void;
}

// ============ 插件上下文 ============
export interface PluginContext {
  file: FileInfo;
  state: PreviewStateInfo;
  containerRef: React.RefObject<HTMLElement | null>;
  contentRef?: React.RefObject<HTMLElement | null>;
  bus?: PluginBus;

  // 扩展上下文
  dimensions?: PreviewDimensions;
  progress?: PreviewProgress;
  metadata?: Record<string, any>;
  sharedData?: Map<string, any>;
}

// ============ 插件钩子 ============
export interface PluginHooks {
  // 生命周期钩子
  onMount?: (context: PluginContext) => void | (() => void);
  onUnmount?: (context: PluginContext) => void;

  // 文件检测与支持
  canHandle?: (file: FileInfo) => boolean | Promise<boolean>;
  getPriority?: (file: FileInfo) => number; // 优先级，数字越大优先级越高

  // 加载钩子
  onBeforeLoad?: (context: PluginContext) => boolean | Promise<boolean>;
  onLoadStart?: (context: PluginContext) => void;
  onLoadProgress?: (context: PluginContext, progress: PreviewProgress) => void;
  onLoadSuccess?: (context: PluginContext) => void;
  onLoadError?: (
    context: PluginContext,
    error: Error
  ) => boolean | Promise<boolean>; // 返回 false 阻止默认错误处理

  // 预览渲染
  render?: (context: PluginContext) => React.ReactNode;
  renderToolbar?: (context: PluginContext) => React.ReactNode;
  renderOverlay?: (context: PluginContext) => React.ReactNode;

  // 数据转换
  transformData?: (context: PluginContext, data: any) => any | Promise<any>;

  // 交互钩子
  onDownload?: (context: PluginContext) => void | Promise<void>;
  onZoom?: (context: PluginContext, scale: number) => void;
  onRotate?: (context: PluginContext, angle: number) => void;
  onFullscreen?: (context: PluginContext, isFullscreen: boolean) => void;
}

// ============ 插件定义 ============
export interface FilePreviewPlugin {
  name: string;
  version?: string;
  description?: string;
  supportedTypes?: string[]; // 支持的 MIME types
  supportedExtensions?: string[]; // 支持的文件扩展名
  hooks: PluginHooks;
  config?: Record<string, any>;

  init?: () => void | Promise<void>;
  destroy?: () => void | Promise<void>;
}

// ============ 插件管理器 ============
export interface PluginManager {
  register: (plugin: FilePreviewPlugin) => void;
  unregister: (pluginName: string) => void;
  getPlugin: (pluginName: string) => FilePreviewPlugin | undefined;
  getAllPlugins: () => FilePreviewPlugin[];
  findPluginForFile: (file: FileInfo) => Promise<FilePreviewPlugin | null>;
  executeHook: <K extends keyof PluginHooks>(
    hookName: K,
    context: PluginContext,
    ...args: any[]
  ) => Promise<any>;
}
