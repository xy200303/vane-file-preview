/**
 * FilePreviewCore - 文件预览核心组件
 * 职责：
 * - 文件状态管理
 * - 预览区域渲染
 * - 生命周期回调
 * - 预留插件扩展接口
 */

import type {
  FileInfo,
  PreviewState,
  PreviewStateInfo,
} from "../plugins/types";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

export interface FilePreviewCoreProps {
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

export interface FilePreviewCoreRef {
  reload: () => void;
  reset: () => void;
  getState: () => PreviewStateInfo;
}

export const FilePreviewCore = forwardRef<
  FilePreviewCoreRef,
  FilePreviewCoreProps
>((props, ref) => {
  const {
    file,
    onBeforeLoad,
    onLoadStart,
    onLoadSuccess,
    onLoadError,
    children,
    containerStyle,
    containerClassName,
    contentStyle,
    contentClassName,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [state, setState] = useState<PreviewStateInfo>({
    state: "idle",
  });

  const startLoad = useCallback(async () => {
    if (state.state === "loading" || state.state === "loaded") return;

    setState({ state: "loading" });
    onLoadStart?.();

    try {
      // 检查是否允许加载
      const canLoad = await Promise.resolve(onBeforeLoad?.());
      if (canLoad === false) {
        setState({ state: "idle" });
        return;
      }

      // 加载成功（实际加载逻辑由插件处理）
      setState({ state: "loaded" });
      onLoadSuccess?.();
    } catch (error: any) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState({
        state: "error",
        error: err,
        message: err.message,
      });
      onLoadError?.(err);
    }
  }, [state.state, onBeforeLoad, onLoadStart, onLoadSuccess, onLoadError]);

  // 自动开始加载
  useEffect(() => {
    startLoad();
  }, [startLoad]);

  // 暴露 Ref 接口
  useImperativeHandle(
    ref,
    () => ({
      reload: () => {
        setState({ state: "idle" });
        startLoad();
      },
      reset: () => {
        setState({ state: "idle" });
      },
      getState: () => state,
    }),
    [startLoad, state]
  );

  // 渲染
  const containerStyles: React.CSSProperties = useMemo(
    () => ({
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      background: state.state === "error" ? "#fee" : "#fafafa",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "flex-start",
      ...containerStyle,
    }),
    [containerStyle, state.state]
  );

  const contentStyles: React.CSSProperties = useMemo(
    () => ({
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "flex-start",
      overflow: "hidden",
      ...contentStyle,
    }),
    [contentStyle]
  );

  return (
    <div
      ref={(el) => {
        containerRef.current = el;
        if (props.containerRefExternal) {
          (props.containerRefExternal as any).current = el;
        }
      }}
      className={containerClassName}
      style={containerStyles}
    >
      {/* Loading 状态 */}
      {state.state === "loading" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <span style={{ color: "#999", fontSize: 14 }}>Loading...</span>
        </div>
      )}

      {/* Error 状态 */}
      {state.state === "error" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#d32f2f",
            zIndex: 2,
          }}
        >
          <span style={{ fontSize: 14, marginBottom: 8 }}>❌ Load Failed</span>
          {state.message && (
            <span style={{ fontSize: 12, color: "#666" }}>{state.message}</span>
          )}
        </div>
      )}

      {/* 内容区域 */}
      <div
        ref={(el) => {
          contentRef.current = el;
          if (props.contentRefExternal) {
            (props.contentRefExternal as any).current = el;
          }
        }}
        className={contentClassName}
        style={contentStyles}
      >
        {/* 插件渲染内容 */}
        {children}
      </div>
    </div>
  );
});

FilePreviewCore.displayName = "FilePreviewCore";

export default FilePreviewCore;
