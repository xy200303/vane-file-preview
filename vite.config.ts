import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDev = command === "serve";
  const isLib = mode === "lib" || process.env.BUILD_TARGET === "lib";

  // 基础插件配置
  const plugins = [react()];

  // 只在库构建时添加 dts 插件
  if (isLib) {
    plugins.push(
      dts({
        include: ["src/components/FilePreviewPlugin/**/*"],
        outDir: "dist",
        // Windows 下 rollup 打包类型文件可能触发 EPERM（文件占用/权限），关闭以避免写入后清理目录失败
        rollupTypes: false,
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
      esbuild: {
        drop: ["console", "debugger"],
      },
      build: {
        minify: "esbuild",
        lib: {
          entry: "./src/components/FilePreviewPlugin/index.ts",
          name: "VaneFilePreview",
          fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
          output: [
            {
              format: "es",
              dir: "dist",
              entryFileNames: "index.es.js",
              // 关键：在输出配置中添加更多优化
              minifyInternalExports: true, // 压缩内部导出
              compact: true,
              generatedCode: {
                constBindings: true,
                objectShorthand: true,
                symbols: true,
              },
            },
            {
              format: "umd",
              dir: "dist",
              entryFileNames: "index.umd.js",
              name: "VaneFilePreview",
              globals: {
                react: "React",
                "react-dom": "ReactDOM",
                "react-router-dom": "ReactRouterDOM",
              },
            },
          ],
          // 外部化大型依赖，让用户自己安装
          external: [
            "react",
            "react-dom",
            "react-router-dom",
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
          ],
          // 代码分割配置
          manualChunks: {
            // 核心库
            core: ["react", "react-dom"],
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
          },
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
