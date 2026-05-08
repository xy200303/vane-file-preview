/**
 * 共享的工具栏组件和样式
 * 为不同文件类型提供统一的工具栏 UI
 */

import React from "react";

const iconWrapperStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const SvgIcon: React.FC<{
  children: React.ReactNode;
  size?: number;
  viewBox?: string;
  strokeWidth?: number;
}> = ({ children, size = 16, viewBox = "0 0 24 24", strokeWidth = 1.9 }) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ display: "block" }}
  >
    <g
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </g>
  </svg>
);

const renderKnownIcon = (
  icon: React.ReactNode,
  size = 16
): React.ReactNode => {
  if (typeof icon !== "string") {
    return icon;
  }

  const normalizedIcon = icon.replace(/\uFE0F/g, "");

  switch (normalizedIcon) {
    case "📥":
      return (
        <SvgIcon size={size}>
          <path d="M12 3v11" />
          <path d="M8 10.5 12 14.5l4-4" />
          <path d="M5 17.5V20h14v-2.5" />
        </SvgIcon>
      );
    case "🖼":
      return (
        <SvgIcon size={size}>
          <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
          <circle cx="9" cy="10" r="1.4" />
          <path d="m6.5 17 4.5-4.5 3.3 3.3 2.2-2.2 1.8 1.8" />
        </SvgIcon>
      );
    case "🔍":
      return (
        <SvgIcon size={size}>
          <circle cx="11" cy="11" r="5.5" />
          <path d="m15.2 15.2 4.3 4.3" />
        </SvgIcon>
      );
    case "🔄":
      return (
        <SvgIcon size={size}>
          <path d="M20 11a8 8 0 0 0-13.7-5.6L4 7.8" />
          <path d="M4 4.5v3.3h3.3" />
          <path d="M4 13a8 8 0 0 0 13.7 5.6l2.3-2.4" />
          <path d="M20 19.5v-3.3h-3.3" />
        </SvgIcon>
      );
    case "↺":
      return (
        <SvgIcon size={size}>
          <path d="M8 7H4V3" />
          <path d="M4.8 7.8A8 8 0 1 1 6 18.6" />
        </SvgIcon>
      );
    case "📄":
      return (
        <SvgIcon size={size}>
          <path d="M8 3.5h6l4 4V20H8z" />
          <path d="M14 3.5V8h4" />
          <path d="M10.5 12h5" />
          <path d="M10.5 15h5" />
        </SvgIcon>
      );
    case "📝":
      return (
        <SvgIcon size={size}>
          <path d="M8 3.5h6l4 4V20H8z" />
          <path d="M14 3.5V8h4" />
          <path d="m10 16 4.8-4.8 1.8 1.8L11.8 17.8 10 18z" />
        </SvgIcon>
      );
    case "📊":
      return (
        <SvgIcon size={size}>
          <path d="M5 19.5h14" />
          <path d="M8 17v-4.5" />
          <path d="M12 17V8.5" />
          <path d="M16 17v-6.5" />
        </SvgIcon>
      );
    case "🎵":
      return (
        <SvgIcon size={size}>
          <path d="M15 5.5v8.5" />
          <path d="M15 5.5 9 7.2v9.1" />
          <ellipse cx="8.5" cy="17" rx="2.5" ry="2" />
          <ellipse cx="14.5" cy="14" rx="2.5" ry="2" />
        </SvgIcon>
      );
    case "🎬":
      return (
        <SvgIcon size={size}>
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path d="m10 9 5 3-5 3z" />
          <path d="M8 6 10 3.8" />
          <path d="M14 6 16 3.8" />
        </SvgIcon>
      );
    case "📚":
      return (
        <SvgIcon size={size}>
          <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H18v14H7.5A2.5 2.5 0 0 0 5 20.5z" />
          <path d="M5 6.5v14" />
          <path d="M9 8.5h6" />
        </SvgIcon>
      );
    case "📽":
      return (
        <SvgIcon size={size}>
          <rect x="4" y="6" width="16" height="10" rx="2" />
          <path d="M10 16v3" />
          <path d="M14 16v3" />
          <path d="M8 19h8" />
          <path d="m15 11 3-2v6l-3-2" />
        </SvgIcon>
      );
    case "⏳":
      return (
        <SvgIcon size={size}>
          <path d="M8 4h8" />
          <path d="M8 20h8" />
          <path d="M9 4c0 3 2 4.2 3 5 1 .8 3 2 3 5" />
          <path d="M15 20c0-3-2-4.2-3-5-1-.8-3-2-3-5" />
        </SvgIcon>
      );
    case "📦":
      return (
        <SvgIcon size={size}>
          <path d="M12 3.8 18.5 7 12 10.2 5.5 7 12 3.8Z" />
          <path d="M18.5 7v8L12 18.2 5.5 15V7" />
          <path d="M12 10.2v8" />
        </SvgIcon>
      );
    case "📋":
      return (
        <SvgIcon size={size}>
          <rect x="7" y="5.5" width="10" height="14" rx="2" />
          <path d="M9.5 5.5h5" />
          <path d="M10 3.8h4a1 1 0 0 1 1 1v1.7H9V4.8a1 1 0 0 1 1-1Z" />
        </SvgIcon>
      );
    case "✓":
      return (
        <SvgIcon size={size}>
          <path d="m6.5 12.5 3.2 3.2 7.8-7.8" />
        </SvgIcon>
      );
    case "🌙":
      return (
        <SvgIcon size={size}>
          <path d="M18 14.5A6.5 6.5 0 0 1 9.5 6a7 7 0 1 0 8.5 8.5Z" />
        </SvgIcon>
      );
    case "☀":
      return (
        <SvgIcon size={size}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 3.5v2.2" />
          <path d="M12 18.3v2.2" />
          <path d="m5.9 5.9 1.6 1.6" />
          <path d="m16.5 16.5 1.6 1.6" />
          <path d="M3.5 12h2.2" />
          <path d="M18.3 12h2.2" />
          <path d="m5.9 18.1 1.6-1.6" />
          <path d="m16.5 7.5 1.6-1.6" />
        </SvgIcon>
      );
    default:
      return icon;
  }
};

// 统一的工具栏样式
export const toolbarStyles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    fontSize: 14,
    minHeight: 40,
    width: "100%",
    flexWrap: "wrap",
    rowGap: 8,
    minWidth: 0,
  } as React.CSSProperties,

  fileInfo: {
    display: "inline-flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    fontSize: 12,
    fontWeight: 500,
    color: "#1f2a44",
    padding: "8px 16px",
    minHeight: 40,
    background: "#fff",
    borderRadius: 16,
    border: "none",
    boxShadow: "0 10px 30px rgba(148, 163, 184, 0.18)",
    minWidth: 0,
    maxWidth: "100%",
  } as React.CSSProperties,

  button: {
    padding: "8px 14px",
    minHeight: 40,
    boxSizing: "border-box",
    border: "none",
    borderRadius: 16,
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    color: "#1f2a44",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 10px 30px rgba(148, 163, 184, 0.18)",
    transition: "all 0.2s ease",
  } as React.CSSProperties,

  buttonHover: {
    background: "#eef2ff",
    color: "#344a9a",
    boxShadow: "0 12px 34px rgba(148, 163, 184, 0.22)",
  } as React.CSSProperties,

  buttonActive: {
    background: "#e5ebff",
    color: "#31438c",
    boxShadow: "0 8px 24px rgba(99, 102, 241, 0.18)",
  } as React.CSSProperties,

  buttonDisabled: {
    background: "rgba(255, 255, 255, 0.72)",
    color: "#94a3b8",
    cursor: "not-allowed",
    boxShadow: "none",
    opacity: 0.75,
  } as React.CSSProperties,

  iconButton: {
    padding: "6px 10px",
    minHeight: 32,
    boxSizing: "border-box",
    border: "none",
    borderRadius: 6,
    background: "transparent",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 500,
    color: "#24292f",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  } as React.CSSProperties,

  iconButtonHover: {
    background: "rgba(15, 23, 42, 0.06)",
  } as React.CSSProperties,

  iconButtonActive: {
    background: "rgba(37, 99, 235, 0.12)",
    color: "#1d4ed8",
  } as React.CSSProperties,

  iconButtonDisabled: {
    background: "transparent",
    color: "#8c959f",
    cursor: "not-allowed",
    opacity: 0.6,
  } as React.CSSProperties,

  softButton: {
    padding: "8px 14px",
    minHeight: 40,
    boxSizing: "border-box",
    border: "none",
    borderRadius: 16,
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    color: "#1f2a44",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 10px 30px rgba(148, 163, 184, 0.18)",
    transition: "all 0.2s ease",
  } as React.CSSProperties,

  softButtonHover: {
    background: "#eef2ff",
    color: "#344a9a",
    boxShadow: "0 12px 34px rgba(148, 163, 184, 0.22)",
  } as React.CSSProperties,

  softButtonActive: {
    background: "#e5ebff",
    color: "#31438c",
    boxShadow: "0 8px 24px rgba(99, 102, 241, 0.18)",
  } as React.CSSProperties,

  softButtonDisabled: {
    background: "rgba(255, 255, 255, 0.72)",
    color: "#94a3b8",
    cursor: "not-allowed",
    boxShadow: "none",
    opacity: 0.75,
  } as React.CSSProperties,

  separator: {
    width: 1,
    height: 24,
    background: "#dbe2ef",
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

export const softControlBarStyle: React.CSSProperties = {
  padding: "12px 16px",
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  background: "#f5f7fb",
  borderBottom: "1px solid #e8edf5",
};

export const softFieldGroupStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 14px",
  minHeight: 40,
  borderRadius: 16,
  background: "#ffffff",
  boxShadow: "0 10px 30px rgba(148, 163, 184, 0.18)",
  minWidth: 0,
  flexWrap: "wrap",
};

export const softLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#52607a",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

export const softInputStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "none",
  borderRadius: 12,
  background: "#f8faff",
  color: "#1f2a44",
  fontSize: 12,
  fontWeight: 500,
  outline: "none",
  minWidth: 100,
};

export const softSelectStyle: React.CSSProperties = {
  ...softInputStyle,
  cursor: "pointer",
  appearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2352607a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  backgroundSize: "12px",
  paddingRight: 30,
};

export const softMetaPillStyle: React.CSSProperties = {
  ...softFieldGroupStyle,
  color: "#64748b",
  fontWeight: 500,
};

export const softTagStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  background: "#eef2ff",
  color: "#4153a5",
  fontSize: 11,
  fontWeight: 600,
};

// 工具栏按钮组件
export interface ToolbarButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
  icon?: React.ReactNode;
  title?: string;
  variant?: "default" | "icon" | "danger" | "soft";
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
  const isIconVariant = variant === "icon";
  const isSoftVariant = variant === "soft";
  const baseStyle = isSoftVariant
    ? toolbarStyles.softButton
    : isIconVariant
      ? toolbarStyles.iconButton
      : toolbarStyles.button;
  const hoverStyle = isSoftVariant
    ? toolbarStyles.softButtonHover
    : isIconVariant
      ? toolbarStyles.iconButtonHover
      : toolbarStyles.buttonHover;
  const activeStyle = isSoftVariant
    ? toolbarStyles.softButtonActive
    : isIconVariant
      ? toolbarStyles.iconButtonActive
      : toolbarStyles.buttonActive;
  const disabledStyle = isSoftVariant
    ? toolbarStyles.softButtonDisabled
    : isIconVariant
      ? toolbarStyles.iconButtonDisabled
      : toolbarStyles.buttonDisabled;
  const style = {
    ...baseStyle,
    ...(disabled ? disabledStyle : {}),
    ...(active ? activeStyle : {}),
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={style}
      onMouseEnter={(e) => {
        if (!disabled && !active) {
          Object.assign(e.currentTarget.style, baseStyle, hoverStyle);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !active) {
          Object.assign(e.currentTarget.style, baseStyle);
        }
      }}
    >
      {icon && <span style={iconWrapperStyle}>{renderKnownIcon(icon, 16)}</span>}
      {children}
    </button>
  );
};

// 文件信息组件
export interface FileInfoProps {
  name: string;
  size?: number;
  type?: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

export const FileInfo: React.FC<FileInfoProps> = ({
  name,
  size,
  type,
  icon,
  style,
}) => {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <div style={{ ...toolbarStyles.fileInfo, ...style }}>
      {icon && <span style={iconWrapperStyle}>{renderKnownIcon(icon, 16)}</span>}
      <span
        style={{
          fontWeight: 500,
          minWidth: 0,
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </span>
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
      <div style={iconWrapperStyle}>{renderKnownIcon("⏳", 14)}</div>
      <div>{status}</div>
      <div style={{ color: "#656d76" }}>{Math.round(progress)}%</div>
    </div>
  );
};

// 工具栏容器组件
export interface ToolbarContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ToolbarContainer: React.FC<ToolbarContainerProps> = ({
  children,
  className,
  style,
}) => {
  return (
    <div style={{ ...toolbarStyles.container, ...style }} className={className}>
      {children}
    </div>
  );
};
