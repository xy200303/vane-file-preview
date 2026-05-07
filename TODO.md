**已覆盖**
- `AudioPreviewPlugin.tsx`：常见音频格式播放。
- `VideoPreviewPlugin.tsx`：常见视频格式播放。
- `PdfPreviewPlugin.tsx`：PDF 预览（iframe/embed）。
- `MarkdownPreviewPlugin.tsx`：Markdown 渲染，GFM/数学/高亮支持。
- `CodePreviewPlugin/`：代码高亮、主题与语言选择等。
- `OfficePreviewPlugin.tsx`：通过在线 Viewer 预览 Office 文档。
- `ZipPreviewPlugin.tsx`：使用 `JSZip` 列出真实 Zip 内容。

**优先拓展**
- 本地 Office 离线预览（`DocxPreviewPlugin.tsx`/`XlsxPreviewPlugin.tsx`/`PptxPreviewPlugin.tsx`）
  - 目标：摆脱在线 Viewer，支持离线解析与基础渲染。
  - 依赖参考：`mammoth`（docx→HTML）、`xlsx`（sheetjs）、`pptx-parser` 或转图片方案。
  - 要点：分页/表格渲染、图片/样式处理，文件较大时做懒加载。
- CSV/TSV 表格预览（`CsvPreviewPlugin.tsx`）
  - 依赖参考：`papaparse` 或 `xlsx`；支持分页、列宽、筛选、导出。
  - 要点：大文件分块解析、编码与分隔符自动识别。
- JSON 树视图（`JsonPreviewPlugin.tsx`）
  - 依赖参考：`react-json-view` 或自研树组件。
  - 要点：折叠/展开、搜索、路径复制，大 JSON 流式加载。
- XML 预览（`XmlPreviewPlugin.tsx`）
  - 依赖参考：`fast-xml-parser`；树形展开与属性高亮。
  - 要点：命名空间与实体处理、格式化与折叠。
- PDF.js 增强（`PdfJsPreviewPlugin.tsx`）
  - 依赖参考：`pdfjs-dist`；缩略图、页码跳转、文本搜索与复制。
  - 要点：自带工具栏，避免双重滚动与性能开销。

**次级拓展**
- 电子书：`EpubPreviewPlugin.tsx`（`epub.js`）。
- 更多压缩格式：`TarGzPreviewPlugin.tsx`（`fflate`/`tar-js`），与 Zip 统一交互。
- HTML/SVG 安全渲染：`HtmlPreviewPlugin.tsx` / `SvgPreviewPlugin.tsx`（sandbox、CSP、XSS 防护）。
- 大文本/日志：`TextPreviewPlugin.tsx`（虚拟列表、搜索、高亮、按行加载）。
- 3D 模型：`ModelPreviewPlugin.tsx`（`three.js` 支持 `glTF/OBJ/STL`）。
- 二进制/十六进制：`HexPreviewPlugin.tsx`（偏移、跳转、选区导出）。
- 字体：`FontPreviewPlugin.tsx`（`opentype.js` 显示字形、基本拉丁预览）。
- OpenDocument：`OdfPreviewPlugin.tsx`（`odf.js` 支持 `odt/ods/odp`）。

**推荐实施顺序**
- 先做“离线 Office + CSV/JSON/XML + PDF.js”，覆盖通用办公与数据文件。
- 再扩展“HTML/SVG 安全渲染 + 大文本日志 + TAR/GZ”，提升普适性。
- 视需求补充“3D 模型、十六进制、字体、EPUB、OpenDocument”。

如果你愿意，我可以直接为 CSV/JSON/XML 新增三个插件骨架并接入解析库，随后完善交互与性能细节。
