# 插件样式隔离解决方案

## 问题描述

在文件预览插件中，某些插件（如 PPTX、Markdown、Office 等）的样式可能会影响整体页面的布局，导致页面混乱。

## 解决方案

### 1. 移除全局 CSS 导入

**问题**：MarkdownPreviewPlugin 导入了全局的 highlight.js CSS 样式

```tsx
// 问题代码
import "highlight.js/styles/github.css";
import "highlight.js/styles/github-dark.css";
```

**解决**：注释掉全局 CSS 导入

```tsx
// 移除全局 CSS 导入，避免影响整体页面样式
// import "highlight.js/styles/github.css";
// import "highlight.js/styles/github-dark.css";
```

### 2. 创建样式隔离辅助函数

创建了 `isolatedStyles.ts` 文件，提供样式隔离的辅助函数：

```tsx
export const createIsolatedContainer = (
  baseStyles: React.CSSProperties = {}
) => ({
  height: "100%",
  width: "100%",
  position: "relative",
  overflow: "hidden",
  isolation: "isolate", // 创建新的层叠上下文，隔离样式
  contain: "layout style", // 限制样式和布局的影响范围
  ...baseStyles,
});
```

### 3. 更新插件使用样式隔离

**PptxPreviewPlugin**：

```tsx
// 更新前
<div style={{
  height: "100%",
  background: "#1a1a1a",
  display: "flex",
  flexDirection: "column",
}}>

// 更新后
<div style={createIsolatedContainer({
  background: "#1a1a1a",
  display: "flex",
  flexDirection: "column",
})}>
```

**OfficePreviewPlugin**：

```tsx
// 更新前
<div style={{
  width: "100%",
  height: "100%",
  background: "#f5f5f5",
  position: "relative",
  overflow: "hidden",
}}>

// 更新后
<div style={createIsolatedContainer({
  background: "#f5f5f5",
})}>
```

## 样式隔离原理

### 1. `isolation: "isolate"`

- 创建新的层叠上下文（stacking context）
- 防止子元素的 z-index 影响外部元素
- 隔离样式的影响范围

### 2. `contain: "layout style"`

- 限制布局和样式的影响范围
- 提高渲染性能
- 防止样式泄露

### 3. `position: "relative"`

- 建立定位上下文
- 确保子元素的绝对定位相对于插件容器

### 4. `overflow: "hidden"`

- 防止内容溢出影响外部布局
- 确保插件内容在指定范围内

## 最佳实践

1. **所有插件都应该使用样式隔离**
2. **避免导入全局 CSS 文件**
3. **使用内联样式或 CSS-in-JS 方案**
4. **为插件容器添加适当的样式隔离属性**

## 注意事项

- 样式隔离可能会影响某些插件的视觉效果
- 需要测试确保插件功能正常
- 如果插件需要全局样式，考虑使用 CSS 模块化方案
