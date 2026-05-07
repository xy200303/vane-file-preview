/**
 * 样式隔离辅助函数
 * 为插件提供样式隔离，避免影响整体页面布局
 */

export const createIsolatedContainer = (
  baseStyles: React.CSSProperties = {}
): React.CSSProperties => ({
  height: "100%",
  width: "100%",
  position: "relative",
  overflow: "hidden",
  isolation: "isolate" as const, // 创建新的层叠上下文，隔离样式
  contain: "layout style", // 限制样式和布局的影响范围
  ...baseStyles,
});

export const createIsolatedContent = (
  baseStyles: React.CSSProperties = {}
) => ({
  position: "relative",
  zIndex: 1,
  ...baseStyles,
});

export const createIsolatedOverlay = (
  baseStyles: React.CSSProperties = {}
) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 10,
  pointerEvents: "none", // 默认不阻止鼠标事件
  ...baseStyles,
});
