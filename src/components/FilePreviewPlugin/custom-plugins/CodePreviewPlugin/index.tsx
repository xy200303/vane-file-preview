/**
 * 代码预览插件 - 主入口
 * 支持 100+ 种文件类型，50 个主题，智能语言识别，用户偏好持久化
 */

import { CodePreviewComponent } from "./CodePreviewComponent";
import { CodePreviewToolbar } from "./CodePreviewToolbar";
import type { FilePreviewPlugin } from "../../plugins/types";
import React from "react";

export interface CodePreviewPluginConfig {
  showLineNumbers?: boolean;
  enableCopy?: boolean;
  enableLanguageSelection?: boolean;
  enableThemeSelection?: boolean;
}

export function createCodePreviewPlugin(
  config: CodePreviewPluginConfig = {}
): FilePreviewPlugin {
  const {
    showLineNumbers = true,
    enableCopy = true,
    enableLanguageSelection = true,
    enableThemeSelection = true,
  } = config;

  return {
    name: "CodePreviewPlugin",
    version: "2.0.0",
    description:
      "Code preview with syntax highlighting, 100+ languages, 50 themes",
    supportedTypes: [
      // JavaScript/TypeScript
      "text/javascript",
      "application/javascript",
      "text/typescript",
      "application/typescript",
      "text/jsx",
      "text/tsx",

      // Web
      "text/html",
      "application/xhtml+xml",
      "text/css",
      "text/x-scss",
      "text/x-sass",
      "text/x-less",

      // Python
      "text/x-python",
      "application/x-python",

      // Java ecosystem
      "text/x-java-source",
      "text/x-kotlin",
      "text/x-scala",
      "text/x-groovy",

      // C/C++
      "text/x-c",
      "text/x-c++",
      "text/x-csrc",
      "text/x-c++src",

      // C#/.NET
      "text/x-csharp",
      "text/x-vb",
      "text/x-fsharp",

      // Data formats (JSON handled by JsonPreviewPlugin)
      // "application/json",
      "text/xml",
      "application/xml",
      "text/yaml",
      "application/x-yaml",
      "text/x-toml",

      // Markdown
      "text/markdown",
      "text/x-markdown",

      // Shell
      "text/x-sh",
      "application/x-sh",

      // SQL
      "text/x-sql",
      "application/sql",

      // Other languages
      "text/x-php",
      "text/x-ruby",
      "text/x-go",
      "text/x-rust",
      "text/x-swift",
      "text/x-dart",
      "text/x-lua",
      "text/x-perl",
      "text/x-r",

      // Config files
      "text/plain",
      "application/x-yaml",
      "application/toml",
    ],
    supportedExtensions: [
      // JavaScript ecosystem
      ".js",
      ".jsx",
      ".mjs",
      ".cjs",
      ".ts",
      ".tsx",
      ".vue",
      ".svelte",

      // Web
      ".html",
      ".htm",
      ".xhtml",
      ".css",
      ".scss",
      ".sass",
      ".less",
      ".styl",

      // Python
      ".py",
      ".pyw",
      ".pyx",
      ".pyi",

      // Java ecosystem
      ".java",
      ".kt",
      ".kts",
      ".groovy",
      ".gradle",
      ".scala",

      // C/C++
      ".c",
      ".h",
      ".cpp",
      ".cc",
      ".cxx",
      ".hpp",
      ".hh",
      ".hxx",

      // C#/.NET
      ".cs",
      ".vb",
      ".fs",

      // Shell
      ".sh",
      ".bash",
      ".zsh",
      ".fish",

      // PHP
      ".php",
      ".php3",
      ".php4",
      ".php5",
      ".phtml",

      // Ruby
      ".rb",
      ".rake",
      ".gemspec",

      // Go
      ".go",

      // Rust
      ".rs",

      // Swift
      ".swift",

      // Objective-C
      ".m",
      ".mm",

      // Data formats (JSON handled by JsonPreviewPlugin)
      // ".json",
      ".json5",
      ".jsonc",
      ".xml",
      ".yaml",
      ".yml",
      ".toml",
      ".ini",
      ".cfg",
      ".conf",

      // Markdown & Docs
      ".md",
      ".markdown",
      ".rst",
      ".tex",

      // SQL
      ".sql",
      ".mysql",
      ".pgsql",

      // Other languages
      ".r",
      ".R",
      ".lua",
      ".pl",
      ".pm",
      ".dart",
      ".ex",
      ".exs",
      ".erl",
      ".hrl",
      ".clj",
      ".cljs",
      ".elm",
      ".hs",
      ".lhs",
      ".ml",
      ".mli",

      // Config files
      ".dockerfile",
      ".dockerignore",
      ".gitignore",
      ".env",
      ".editorconfig",
      ".prettierrc",
      ".eslintrc",

      // Build tools
      ".makefile",
      ".cmake",

      // Other
      ".asm",
      ".s",
      ".vim",
      ".diff",
      ".patch",
      ".log",
    ],
    config,

    hooks: {
      getPriority: () => 8,

      render: (context) => {
        return <CodePreviewComponent context={context} />;
      },

      renderToolbar: (context) => {
        return (
          <CodePreviewToolbar
            context={context}
            enableCopy={enableCopy}
            enableLanguageSelection={enableLanguageSelection}
            enableThemeSelection={enableThemeSelection}
          />
        );
      },
    },
  };
}

// 导出类型和工具函数
export * from "./themes";
export * from "./languages";
export * from "./preferences";
