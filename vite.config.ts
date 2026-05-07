import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react";

const manualChunkGroups: Record<string, string[]> = {
  // PDF 相关
  pdf: ["pdfjs-dist", "react-pdf"],
  // Office 文档相关
  office: ["xlsx", "mammoth", "docx-preview", "pptx-parser"],
  // 代码高亮相关
  syntax: ["highlight.js", "react-syntax-highlighter"],
  // Markdown 相关
  markdown: [
    "react-markdown",
    "rehype-katex",
    "rehype-highlight",
    "remark-gfm",
    "remark-math",
  ],
  // 媒体相关
  media: ["react-player", "react-h5-audio-player"],
  // 数据解析相关
  data: ["papaparse", "jszip"],
  // 电子书相关
  epub: ["react-reader"],
  // JSON 相关
  json: ["@uiw/react-json-view"],
};

const __dirname = dirname(fileURLToPath(import.meta.url));

const libraryEntries = {
  index: resolve(__dirname, "src/components/FilePreviewPlugin/index.ts"),
  core: resolve(__dirname, "src/components/FilePreviewPlugin/core/index.ts"),
  plugins: resolve(__dirname, "src/components/FilePreviewPlugin/plugins/index.ts"),
};

const externalPackages = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  // 外部化大型第三方库
  "pdfjs-dist",
  "xlsx",
  "mammoth",
  "jszip",
  "highlight.js",
  "react-syntax-highlighter",
  "react-markdown",
  "react-pdf",
  "react-player",
  "react-reader",
  "react-h5-audio-player",
  "papaparse",
  "docx-preview",
  "pptx-parser",
  "@uiw/react-json-view",
  "rehype-katex",
  "rehype-highlight",
  "rehype-raw",
  "remark-gfm",
  "remark-math",
  "remark-breaks",
];

const getManualChunkName = (id: string) => {
  const normalizedId = id.replace(/\\/g, "/");

  for (const [chunkName, packages] of Object.entries(manualChunkGroups)) {
    if (
      packages.some((pkg) =>
        normalizedId.includes(`/node_modules/${pkg}/`)
      )
    ) {
      return chunkName;
    }
  }

  return undefined;
};

const getEntryFileName = (format: "es" | "cjs") =>
  ({ name }: { name: string }) =>
    name === "index"
      ? `index.${format === "es" ? "es.js" : "cjs"}`
      : `${name}/index.${format === "es" ? "es.js" : "cjs"}`;

const getChunkFileName = (format: "es" | "cjs") =>
  `chunks/[name]-[hash].${format === "es" ? "js" : "cjs"}`;

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDev = command === "serve";
  const isLib = mode === "lib" || process.env.BUILD_TARGET === "lib";

  // 基础插件配置
  const plugins = [...react()];

  // 只在库构建时添加 dts 插件
  if (isLib) {
    plugins.push(
      dts({
        processor: "ts",
        include: ["src/components/FilePreviewPlugin/**/*", "src/types/**/*"],
        exclude: ["public/**/*"],
        outDirs: ["dist"],
        tsconfigPath: "./tsconfig.app.json",
        staticImport: true,
        insertTypesEntry: true,
      }) as any
    );
  }

  // 开发模式配置
  if (isDev) {
    return {
      plugins,
      server: {
        port: 3000,
        open: true,
      },
      // 开发时不需要 esbuild 优化
      esbuild: false,
    };
  }

  // 库构建模式配置
  if (isLib) {
    return {
      plugins,
      // 禁用 public 目录复制，避免示例文件被打包
      publicDir: false,
      build: {
        minify: "terser",
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
        lib: {
          entry: libraryEntries,
        },
        rollupOptions: {
          output: [
            {
              format: "es",
              dir: "dist",
              entryFileNames: getEntryFileName("es"),
              chunkFileNames: getChunkFileName("es"),
              minifyInternalExports: true,
              manualChunks: getManualChunkName,
            },
            {
              format: "cjs",
              dir: "dist",
              entryFileNames: getEntryFileName("cjs"),
              chunkFileNames: getChunkFileName("cjs"),
              exports: "named",
              minifyInternalExports: true,
              manualChunks: getManualChunkName,
            },
          ],
          external: externalPackages,
        },
      },
    };
  }

  // 默认应用构建模式（用于演示页面）
  return {
    plugins,
    base: "./",
    build: {
      outDir: "vane-file-preview",
      rollupOptions: {
        input: "./index.html",
      },
    },
  };
});
