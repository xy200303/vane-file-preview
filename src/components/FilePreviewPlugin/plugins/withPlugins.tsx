/**
 * withPlugins HOC
 * 为 FilePreviewCore 注入插件系统
 */

import type {
  FilePreviewCoreProps,
  FilePreviewCoreRef,
} from "../core/FilePreviewCore";
import type {
  PluginActionHandlers,
  PluginActions,
  FilePreviewPlugin,
  PluginContext,
  PluginManager,
  PreviewStateInfo,
} from "./types";
import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";

import { createPluginBus } from "./PluginBus";
import { createPluginManager } from "./PluginManager";

export interface WithPluginsConfig {
  plugins: FilePreviewPlugin[];
  enableDebug?: boolean;
}

export interface ToolbarRenderParams {
  context: PluginContext;
  activePlugin: FilePreviewPlugin | null;
  defaultToolbar: React.ReactNode | null;
}

export interface WithPluginsRuntimeProps {
  enableDefaultToolbar?: boolean;
  renderToolbar?: (params: ToolbarRenderParams) => React.ReactNode;
}

const triggerFileDownload = (url: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
};

export function withPlugins(
  WrappedComponent: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<FilePreviewCoreProps> &
      React.RefAttributes<FilePreviewCoreRef>
  >,
  config: WithPluginsConfig | FilePreviewPlugin[]
) {
  const normalized: WithPluginsConfig = Array.isArray(config)
    ? { plugins: config, enableDebug: false }
    : config;

  const { plugins, enableDebug = false } = normalized;

  const WithPluginsComponent = forwardRef<
    FilePreviewCoreRef,
    FilePreviewCoreProps & WithPluginsRuntimeProps
  >((props, ref) => {
    const {
      file,
      enableDefaultToolbar = true,
      renderToolbar,
      ...coreProps
    } = props;

    // 插件管理
    const pluginManagerRef = useRef<PluginManager>(createPluginManager());
    const pluginManager = pluginManagerRef.current;
    const busRef = useRef(createPluginBus());
    const bus = busRef.current;

    // refs
    const containerRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    // 使用 useState 确保 sharedData Map 实例在组件生命周期内保持稳定
    const [sharedData] = useState<Map<string, any>>(() => {
      const map = new Map();
      return map;
    });
    const sharedDataRef = useRef(sharedData);

    // 状态
    const [state, setState] = useState<PreviewStateInfo>({
      state: "idle",
    });

    // 当前活动插件
    const [activePlugin, setActivePlugin] = useState<FilePreviewPlugin | null>(
      null
    );
    const activePluginRef = useRef<FilePreviewPlugin | null>(null);
    const pluginContextRef = useRef<PluginContext | null>(null);

    const actions = useMemo<PluginActions>(() => {
      const getContext = () => pluginContextRef.current;
      const getPlugin = () => activePluginRef.current;
      const getActionHandlers = (): PluginActionHandlers => {
        const plugin = getPlugin();
        const context = getContext();

        if (!plugin || !context) {
          return {};
        }

        return plugin.hooks.getActions?.(context) ?? {};
      };

      const invoke = (actionName: string, ...args: any[]) => {
        const context = getContext();
        const plugin = getPlugin();

        if (!context) {
          return undefined;
        }

        const actionHandlers = getActionHandlers();
        const customHandler = actionHandlers[actionName];

        if (typeof customHandler === "function") {
          return customHandler(...args);
        }

        switch (actionName) {
          case "download":
            if (plugin?.hooks.onDownload) {
              return plugin.hooks.onDownload(context);
            }
            triggerFileDownload(context.file.url, context.file.name);
            return undefined;
          case "save":
            return invoke("download");
          case "zoom":
            if (
              plugin?.hooks.onZoom &&
              typeof args[0] === "number" &&
              Number.isFinite(args[0])
            ) {
              return plugin.hooks.onZoom(context, args[0]);
            }
            if (typeof args[0] === "number" && Number.isFinite(args[0])) {
              context.bus?.emit("zoom", { scale: args[0] });
            }
            return undefined;
          case "rotate": {
            const payload = args[0];

            if (plugin?.hooks.onRotate) {
              if (typeof payload === "number") {
                return plugin.hooks.onRotate(context, payload);
              }

              if (
                payload &&
                typeof payload === "object" &&
                typeof payload.angle === "number"
              ) {
                return plugin.hooks.onRotate(context, payload.angle);
              }
            }

            context.bus?.emit("rotate", payload ?? {});
            return undefined;
          }
          case "reset":
            context.bus?.emit("reset", {});
            return undefined;
          case "fullscreen": {
            if (plugin?.hooks.onFullscreen) {
              return plugin.hooks.onFullscreen(context, Boolean(args[0]));
            }

            const container = context.containerRef.current;
            if (!container) {
              return undefined;
            }

            const shouldEnable =
              typeof args[0] === "boolean"
                ? args[0]
                : document.fullscreenElement !== container;

            if (shouldEnable) {
              return container.requestFullscreen?.();
            }

            if (document.fullscreenElement) {
              return document.exitFullscreen?.();
            }

            return undefined;
          }
          default:
            context.bus?.emit(actionName, args[0]);
            return undefined;
        }
      };

      return {
        download: async () => {
          await Promise.resolve(invoke("download"));
        },
        save: async () => {
          await Promise.resolve(invoke("save"));
        },
        zoom: (scale) => invoke("zoom", scale),
        zoomIn: (step) => invoke("zoomIn", step),
        zoomOut: (step) => invoke("zoomOut", step),
        rotate: (payload) => invoke("rotate", payload),
        reset: () => invoke("reset"),
        previous: () => invoke("previous"),
        next: () => invoke("next"),
        goTo: (index) => invoke("goTo", index),
        fullscreen: (enabled) => invoke("fullscreen", enabled),
        run: (actionName, ...args) => invoke(actionName, ...args),
        has: (actionName) => {
          const actionHandlers = getActionHandlers();

          if (typeof actionHandlers[actionName] === "function") {
            return true;
          }

          if (
            actionName === "download" ||
            actionName === "save" ||
            actionName === "fullscreen"
          ) {
            return true;
          }

          const plugin = getPlugin();
          if (!plugin) {
            return false;
          }

          if (actionName === "zoom") {
            return typeof plugin.hooks.onZoom === "function";
          }

          if (actionName === "rotate") {
            return typeof plugin.hooks.onRotate === "function";
          }

          return false;
        },
        list: () => {
          const actionNames = new Set<string>([
            "download",
            "save",
            "fullscreen",
          ]);
          const actionHandlers = getActionHandlers();

          Object.keys(actionHandlers).forEach((actionName) => {
            if (typeof actionHandlers[actionName] === "function") {
              actionNames.add(actionName);
            }
          });

          const plugin = getPlugin();
          if (plugin?.hooks.onZoom) {
            actionNames.add("zoom");
          }
          if (plugin?.hooks.onRotate) {
            actionNames.add("rotate");
          }

          return Array.from(actionNames);
        },
      };
    }, []);

    // 注册插件
    useEffect(() => {
      plugins.forEach((plugin) => {
        pluginManager.register(plugin);
      });

      return () => {
        plugins.forEach((plugin) => pluginManager.unregister(plugin.name));
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [plugins]);

    // 查找适合的插件
    useEffect(() => {
      const findPlugin = async () => {
        const plugin = await pluginManager.findPluginForFile(file);
        setActivePlugin(plugin);

        if (!plugin) {
          setState({
            state: "unsupported",
            message: `No plugin found for file type: ${file.type}`,
          });
        }
      };

      findPlugin();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file]);

    // 调试日志
    useEffect(() => {
      if (enableDebug) {
        const names = plugins.map((p) => p.name);
        console.debug("[withPlugins] active plugins:", names);
        console.debug(
          "[withPlugins] active plugin for file:",
          activePlugin?.name
        );
      }
    }, [enableDebug, plugins, activePlugin]);

    // 构造插件上下文
    const pluginContext: PluginContext = useMemo(() => {
      const context = {
        file,
        state,
        containerRef,
        contentRef,
        bus,
        sharedData: sharedData,
        actions,
      };
      return context;
    }, [actions, bus, file, sharedData, state]);

    activePluginRef.current = activePlugin;
    pluginContextRef.current = pluginContext;

    // 生命周期钩子
    useEffect(() => {
      const cleanups: Array<void | (() => void)> = [];
      plugins.forEach((plugin) => {
        const cleanup = plugin.hooks.onMount?.(pluginContext);
        if (cleanup) cleanups.push(cleanup);
      });

      return () => {
        plugins.forEach((plugin) => plugin.hooks.onUnmount?.(pluginContext));
        cleanups.forEach((fn) => typeof fn === "function" && fn());
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 渲染聚合
    const pluginRenders = useMemo(() => {
      if (!activePlugin) return null;

      const node = activePlugin.hooks.render?.(pluginContext);
      if (!node) return null;

      return (
        <React.Fragment key={`plugin-render-${activePlugin.name}`}>
          {node}
        </React.Fragment>
      );
    }, [pluginContext, activePlugin]);

    // 强制重新渲染的状态
    const [toolbarUpdateKey, setToolbarUpdateKey] = useState(0);

    // 监听 sharedData 变化
    useEffect(() => {
      const handleSharedDataChange = () => {
        setToolbarUpdateKey((prev) => prev + 1);
      };

      // 监听 sharedData 变化事件
      const unsubscribe = bus?.on("sharedDataChanged", handleSharedDataChange);

      return () => {
        unsubscribe?.();
      };
    }, [bus]);

    // 工具栏渲染 - 只显示当前激活插件的工具栏
    const pluginToolbars = useMemo(() => {
      if (!activePlugin) return null;

      const node = activePlugin.hooks.renderToolbar?.(pluginContext);
      if (!node) return null;

      return (
        <React.Fragment
          key={`plugin-toolbar-${activePlugin.name}-${toolbarUpdateKey}`}
        >
          {node}
        </React.Fragment>
      );
    }, [pluginContext, activePlugin, toolbarUpdateKey]);

    const renderedToolbar = useMemo(() => {
      if (renderToolbar) {
        return renderToolbar({
          context: pluginContext,
          activePlugin,
          defaultToolbar: pluginToolbars,
        });
      }

      if (enableDefaultToolbar) {
        return pluginToolbars;
      }

      return null;
    }, [
      activePlugin,
      enableDefaultToolbar,
      pluginContext,
      pluginToolbars,
      renderToolbar,
      toolbarUpdateKey,
    ]);

    // 针对 PDF 插件，禁用外层滚动，仅保留内嵌查看器的滚动
    const isPdfPlugin = activePlugin?.name === "PdfPreviewPlugin";

    // 叠加层渲染
    const pluginOverlays = useMemo(() => {
      return plugins
        .map((plugin, idx) => {
          const node = plugin.hooks.renderOverlay?.(pluginContext);
          if (!node) return null;
          return (
            <React.Fragment key={`plugin-overlay-${plugin.name}-${idx}`}>
              {node}
            </React.Fragment>
          );
        })
        .filter(Boolean);
    }, [pluginContext, plugins]);

    // 增强的 props
    const enhancedProps: FilePreviewCoreProps = {
      file,
      ...coreProps,
      containerRefExternal: containerRef,
      contentRefExternal: contentRef,
      children: (
        <>
          {renderedToolbar && (
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                display: "flex",
                gap: 8,
                padding: 8,
                background: "rgba(255, 255, 255, 0.95)",
                borderBottom: "1px solid #e0e0e0",
                flexShrink: 0,
                backdropFilter: "blur(8px)",
              }}
            >
              {renderedToolbar}
            </div>
          )}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "100%",
                overflow: isPdfPlugin ? "hidden" : "auto",
                overscrollBehavior: isPdfPlugin ? "none" : "contain",
                boxSizing: "border-box",
              }}
            >
              {pluginRenders}
            </div>
            {pluginOverlays}
            {coreProps.children}
          </div>
        </>
      ),
      onBeforeLoad: async () => {
        const result = await pluginManager.executeHook(
          "onBeforeLoad",
          pluginContext
        );
        return result !== false;
      },
      onLoadStart: () => {
        setState({ state: "loading" });
        pluginManager.executeHook("onLoadStart", pluginContext).catch(() => {});
      },
      onLoadSuccess: () => {
        setState({ state: "loaded" });
        pluginManager
          .executeHook("onLoadSuccess", pluginContext)
          .catch(() => {});
      },
      onLoadError: (error) => {
        setState({
          state: "error",
          error,
          message: error.message,
        });
        pluginManager
          .executeHook("onLoadError", pluginContext, error)
          .catch(() => {});
      },
    };

    return <WrappedComponent ref={ref} {...enhancedProps} />;
  });

  WithPluginsComponent.displayName = "WithPlugins(FilePreviewCore)";
  return WithPluginsComponent;
}
