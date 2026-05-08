# 自定义头部接入指南

本文档说明如何在 `@dev_xiaoyun/vane-file-preview` 中关闭内置头部，并接入你自己的自定义头部。

## 适用场景

- 你希望完全接管顶部工具栏样式
- 你希望把工具栏嵌入业务系统自己的设计体系
- 你希望在头部放入额外业务按钮
- 你希望通过统一 API 控制下载、翻页、缩放、旋转等行为

## 核心能力

`withPlugins` 返回的预览组件现在支持两个额外参数：

- `enableDefaultToolbar?: boolean`
  - 是否显示插件自带的头部
  - 默认值为 `true`
- `renderToolbar?: (params: ToolbarRenderParams) => React.ReactNode`
  - 自定义渲染头部
  - 传入后可以完全自定义顶部区域

相关类型：

```tsx
import type {
  ToolbarRenderParams,
  PluginContext,
  PluginActions,
} from "@dev_xiaoyun/vane-file-preview";
```

## 最小接入示例

```tsx
import {
  FilePreviewCore,
  withPlugins,
  createImagePreviewPlugin,
  createPptxPreviewPlugin,
  type ToolbarRenderParams,
} from "@dev_xiaoyun/vane-file-preview";

const Preview = withPlugins(FilePreviewCore, [
  createImagePreviewPlugin(),
  createPptxPreviewPlugin(),
]);

const renderCustomToolbar = ({
  context,
  activePlugin,
}: ToolbarRenderParams) => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div>{context.file.name}</div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => void context.actions.download()}>
          下载
        </button>

        {activePlugin?.name === "ImagePreviewPlugin" && (
          <>
            <button onClick={() => context.actions.zoomOut()}>缩小</button>
            <button onClick={() => context.actions.zoomIn()}>放大</button>
            <button onClick={() => context.actions.rotate({ delta: 90 })}>
              旋转
            </button>
            <button onClick={() => context.actions.reset()}>重置</button>
          </>
        )}

        {activePlugin?.name === "PptxPreviewPlugin" && (
          <>
            <button onClick={() => context.actions.previous()}>上一页</button>
            <button onClick={() => context.actions.next()}>下一页</button>
          </>
        )}
      </div>
    </div>
  );
};

export default function Demo() {
  return (
    <Preview
      file={{
        name: "demo.pptx",
        size: 1024,
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        extension: ".pptx",
        url: "/demo.pptx",
      }}
      enableDefaultToolbar={false}
      renderToolbar={renderCustomToolbar}
    />
  );
}
```

## `renderToolbar` 参数说明

`renderToolbar` 会收到一个 `ToolbarRenderParams`：

```ts
type ToolbarRenderParams = {
  context: PluginContext;
  activePlugin: FilePreviewPlugin | null;
  defaultToolbar: React.ReactNode | null;
};
```

字段说明：

- `context`
  - 当前文件和插件上下文
  - 包含 `file`、`state`、`sharedData`、`actions`、`bus`
- `activePlugin`
  - 当前命中的插件
  - 可用于判断当前是图片、PPT、代码、CSV 等预览
- `defaultToolbar`
  - 插件原始工具栏节点
  - 如果你只是想在原头部外包一层，也可以直接复用它

## 两种接入方式

### 方式一：完全替换内置头部

推荐做法：

```tsx
<Preview
  file={file}
  enableDefaultToolbar={false}
  renderToolbar={renderCustomToolbar}
/>
```

适合：

- 设计系统统一改造
- 业务侧完全接管头部布局

### 方式二：增强默认头部

如果你想保留插件原始头部，再加一些业务按钮：

```tsx
const renderToolbar = ({ defaultToolbar, context }: ToolbarRenderParams) => {
  return (
    <div style={{ display: "flex", gap: 12, width: "100%" }}>
      <div style={{ flex: 1 }}>{defaultToolbar}</div>
      <button onClick={() => void context.actions.download()}>
        业务下载
      </button>
    </div>
  );
};
```

适合：

- 保留插件现有操作逻辑
- 只想额外加 1-2 个业务按钮

## `context.actions` 怎么用

`context.actions` 是给自定义头部准备的统一动作入口。

### 通用动作

这些动作所有插件都可以安全调用：

- `actions.download()`
  - 下载原始文件
- `actions.save()`
  - 保存当前内容
  - 某些插件会保存处理后的内容，而不是原文件
- `actions.fullscreen(enabled?)`
  - 进入或退出全屏
- `actions.run(name, ...args)`
  - 调用插件特有动作
- `actions.has(name)`
  - 判断某个动作是否可用
- `actions.list()`
  - 获取当前插件暴露的动作列表

### 图片插件动作

`ImagePreviewPlugin` 额外支持：

- `actions.zoom(scale)`
- `actions.zoomIn(step?)`
- `actions.zoomOut(step?)`
- `actions.rotate(payload?)`
- `actions.reset()`

示例：

```tsx
context.actions.zoomIn();
context.actions.rotate({ delta: 90 });
context.actions.reset();
```

### PPT 插件动作

`PptxPreviewPlugin` 额外支持：

- `actions.previous()`
- `actions.next()`
- `actions.goTo(index)`
- `actions.run("setImageDeckMode", "sharp" | "fit")`

示例：

```tsx
context.actions.previous();
context.actions.next();
context.actions.goTo(3);
context.actions.run("setImageDeckMode", "fit");
```

说明：

- `goTo(index)` 使用的是从 `0` 开始的页码
- 第 4 页应传 `3`

### 代码插件动作

`CodePreviewPlugin` 额外支持：

- `actions.run("copy")`
- `actions.run("setLanguage", language)`
- `actions.run("setTheme", theme)`
- `actions.run("setLineNumbers", boolean)`
- `actions.run("setWrapLongLines", boolean)`

### Markdown 插件动作

`MarkdownPreviewPlugin` 额外支持：

- `actions.run("toggleTheme")`
- `actions.run("setTheme", "light" | "dark")`

### CSV 插件动作

`CsvPreviewPlugin` 额外支持：

- `actions.previous()`
- `actions.next()`
- `actions.goTo(page)`
- `actions.run("firstPage")`
- `actions.run("lastPage")`

说明：

- CSV 的 `goTo(page)` 使用的是从 `1` 开始的页码

### XLSX 插件动作

`XlsxPreviewPlugin` 额外支持：

- `actions.previous()`
- `actions.next()`
- `actions.goTo(index)`
- `actions.run("setSheet", index)`

说明：

- XLSX 的 sheet 切换使用的是从 `0` 开始的索引
- 当前 sheet 名和列表可从 `sharedData` 读取：

```tsx
const activeSheet = Number(context.sharedData?.get("xlsxActiveSheet") ?? 0);
const sheetNames =
  (context.sharedData?.get("xlsxSheetNames") as string[] | undefined) ?? [];
```

### XML 插件动作

`XmlPreviewPlugin` 额外支持：

- `actions.run("copy")`
- `actions.run("format")`

### JSON 插件动作

`JsonPreviewPlugin` 支持：

- `actions.download()`
- `actions.save()`

说明：

- `save()` 会优先导出当前 JSON 内容

### 其他内置插件

以下插件也已经显式支持自定义头部场景下的 `download()` / `save()`：

- `PdfPreviewPlugin`
- `AudioPreviewPlugin`
- `VideoPreviewPlugin`
- `DocxPreviewPlugin`
- `MammothDocxPlugin`
- `OfficePreviewPlugin`
- `SimpleReactReaderEpubPlugin`
- `ZipPreviewPlugin`
- `DownloadPlugin`

## 如何判断当前能不能显示某个按钮

推荐不要写死，优先用 `actions.has()` 或 `activePlugin?.name` 判断：

```tsx
if (context.actions.has("previous")) {
  // 显示上一页按钮
}

if (activePlugin?.name === "ImagePreviewPlugin") {
  // 显示图片专属按钮
}
```

也可以直接打印当前插件暴露的动作：

```tsx
console.log(context.actions.list());
```

## 如何读取当前状态

一些实时状态不一定是动作，而是保存在 `context.sharedData` 中。

常见例子：

### PPT 当前页

```tsx
const activeSlide = Number(context.sharedData?.get("pptxActiveSlide") ?? 0);
const slideCount = Number(context.sharedData?.get("pptxSlideCount") ?? 0);
```

### 图片当前缩放

```tsx
const scale = Number(context.sharedData?.get("imageScale") ?? 1);
const rotation = Number(context.sharedData?.get("imageRotation") ?? 0);
```

### CSV 当前分页

```tsx
const currentPage = Number(context.sharedData?.get("csvCurrentPage") ?? 1);
const totalPages = Number(context.sharedData?.get("csvTotalPages") ?? 0);
```

## 推荐接入方式

建议按下面顺序做：

1. 先把 `enableDefaultToolbar` 设为 `false`
2. 在 `renderToolbar` 里先渲染文件名和一个下载按钮
3. 再根据 `activePlugin?.name` 或 `actions.has()` 逐步补专属动作
4. 对需要展示实时状态的插件，从 `sharedData` 里读取状态

## 示例参考

你可以直接参考仓库里的演示实现：

- `src/pages/FilePreviewPlugin/OfficePreviewDemo.tsx`

这个 demo 已经演示了：

- 关闭内置头部
- 自定义渲染 PPT 头部
- 调用 `download / previous / next / run("setImageDeckMode")`
- 根据 `sharedData` 显示当前页码和模式

## 常见问题

### 1. 为什么有的动作要用 `run(...)`

因为这类动作是插件专属能力，不适合强行做成全局统一命名。

例如：

- `setImageDeckMode`
- `setLanguage`
- `setTheme`
- `copy`
- `format`

### 2. `download()` 和 `save()` 有什么区别

- `download()` 倾向于下载原始文件
- `save()` 倾向于导出当前处理后的内容

如果某个插件没有专门实现 `save()`，它会回退到下载原文件。

### 3. 我能不能既保留默认头部，又渲染自己的头部

可以，直接使用 `defaultToolbar`：

```tsx
renderToolbar={({ defaultToolbar }) => (
  <div>
    {defaultToolbar}
    <div>我的业务按钮</div>
  </div>
)}
```

### 4. 我能不能完全不传 `renderToolbar`

可以。

```tsx
<Preview file={file} />
```

这时会继续使用插件默认头部。
