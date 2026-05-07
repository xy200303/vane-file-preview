/**
 * 共享的工具栏组件和样式
 * 为不同文件类型提供统一的工具栏 UI
 */

import React from "react";

// 统一的工具栏样式
export const toolbarStyles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    fontSize: 14,
    minHeight: 40,
  } as React.CSSProperties,

  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    color: "#586069",
    padding: "4px 8px",
    background: "#fff",
    borderRadius: 4,
    border: "1px solid #e1e4e8",
  } as React.CSSProperties,

  button: {
    padding: "6px 12px",
    border: "1px solid #d0d7de",
    borderRadius: 6,
    background: "#fff",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 500,
    color: "#24292f",
    display: "flex",
    alignItems: "center",
    gap: 4,
    transition: "all 0.2s ease",
  } as React.CSSProperties,

  buttonHover: {
    background: "#f6f8fa",
    borderColor: "#d0d7de",
  } as React.CSSProperties,

  buttonActive: {
    background: "#0969da",
    color: "#fff",
    borderColor: "#0969da",
  } as React.CSSProperties,

  buttonDisabled: {
    background: "#f6f8fa",
    color: "#8c959f",
    cursor: "not-allowed",
    borderColor: "#d0d7de",
  } as React.CSSProperties,

  iconButton: {
    padding: "6px",
    minWidth: 32,
    height: 32,
    boxSizing: "border-box",
  } as React.CSSProperties,

  separator: {
    width: 1,
    height: 20,
    background: "#d0d7de",
    margin: "0 4px",
  } as React.CSSProperties,

  progress: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    color: "#656d76",
  } as React.CSSProperties,
};

// 工具栏按钮组件
export interface ToolbarButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
  icon?: string;
  title?: string;
  variant?: "default" | "icon" | "danger";
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  children,
  disabled = false,
  active = false,
  icon,
  title,
  variant = "default",
}) => {
  const baseStyle =
    variant === "icon" ? toolbarStyles.iconButton : toolbarStyles.button;
  const style = {
    ...baseStyle,
    ...(disabled ? toolbarStyles.buttonDisabled : {}),
    ...(active ? toolbarStyles.buttonActive : {}),
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={style}
      onMouseEnter={(e) => {
        if (!disabled && !active) {
          Object.assign(
            e.currentTarget.style,
            baseStyle,
            toolbarStyles.buttonHover
          );
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !active) {
          Object.assign(e.currentTarget.style, baseStyle);
        }
      }}
    >
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      {children}
    </button>
  );
};

// 文件信息组件
export interface FileInfoProps {
  name: string;
  size?: number;
  type?: string;
  icon?: string;
}

export const FileInfo: React.FC<FileInfoProps> = ({
  name,
  size,
  type,
  icon,
}) => {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <div style={toolbarStyles.fileInfo}>
      {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
      <span style={{ fontWeight: 500 }}>{name}</span>
      {size && <span style={{ color: "#656d76" }}>({formatSize(size)})</span>}
      {type && <span style={{ color: "#656d76", fontSize: 11 }}>{type}</span>}
    </div>
  );
};

// 分隔符组件
export const ToolbarSeparator: React.FC = () => {
  return <div style={toolbarStyles.separator} />;
};

// 进度指示器组件
export interface ProgressIndicatorProps {
  progress: number;
  status?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  status = "Loading...",
}) => {
  return (
    <div style={toolbarStyles.progress}>
      <div style={{ fontSize: 12 }}>⏳</div>
      <div>{status}</div>
      <div style={{ color: "#656d76" }}>{Math.round(progress)}%</div>
    </div>
  );
};

// 工具栏容器组件
export interface ToolbarContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ToolbarContainer: React.FC<ToolbarContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div style={toolbarStyles.container} className={className}>
      {children}
    </div>
  );
};
