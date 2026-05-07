/**
 * 语言检测和映射配置
 * 支持 100+ 种文件扩展名和 70+ 种编程语言
 */

// 扩展的语言检测函数（支持 100+ 种编程语言）
export function getLanguageFromExtension(extension: string): string {
  const langMap: Record<string, string> = {
    // JavaScript 生态
    ".js": "javascript",
    ".jsx": "jsx",
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".ts": "typescript",
    ".tsx": "tsx",
    ".vue": "vue",
    ".svelte": "svelte",

    // Web 开发
    ".html": "html",
    ".htm": "html",
    ".xhtml": "html",
    ".css": "css",
    ".scss": "scss",
    ".sass": "sass",
    ".less": "less",
    ".styl": "stylus",

    // Python
    ".py": "python",
    ".pyw": "python",
    ".pyx": "python",
    ".pyi": "python",

    // Java 生态
    ".java": "java",
    ".kt": "kotlin",
    ".kts": "kotlin",
    ".groovy": "groovy",
    ".scala": "scala",

    // C/C++
    ".c": "c",
    ".h": "c",
    ".cpp": "cpp",
    ".cc": "cpp",
    ".cxx": "cpp",
    ".hpp": "cpp",
    ".hh": "cpp",
    ".hxx": "cpp",

    // C#/.NET
    ".cs": "csharp",
    ".vb": "vbnet",
    ".fs": "fsharp",

    // Shell/Bash
    ".sh": "bash",
    ".bash": "bash",
    ".zsh": "bash",
    ".fish": "bash",

    // PHP
    ".php": "php",
    ".php3": "php",
    ".php4": "php",
    ".php5": "php",
    ".phtml": "php",

    // Ruby
    ".rb": "ruby",
    ".rake": "ruby",
    ".gemspec": "ruby",

    // Go
    ".go": "go",

    // Rust
    ".rs": "rust",

    // Swift
    ".swift": "swift",

    // Objective-C
    ".m": "objectivec",
    ".mm": "objectivec",

    // 数据格式
    ".json": "json",
    ".json5": "json",
    ".jsonc": "json",
    ".xml": "xml",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".toml": "toml",
    ".ini": "ini",
    ".cfg": "ini",
    ".conf": "ini",

    // Markdown & 文档
    ".md": "markdown",
    ".markdown": "markdown",
    ".rst": "rst",
    ".tex": "latex",

    // SQL
    ".sql": "sql",
    ".mysql": "sql",
    ".pgsql": "sql",

    // 其他流行语言
    ".r": "r",
    ".R": "r",
    ".lua": "lua",
    ".pl": "perl",
    ".pm": "perl",
    ".dart": "dart",
    ".ex": "elixir",
    ".exs": "elixir",
    ".erl": "erlang",
    ".hrl": "erlang",
    ".clj": "clojure",
    ".cljs": "clojure",
    ".elm": "elm",
    ".hs": "haskell",
    ".lhs": "haskell",
    ".ml": "ocaml",
    ".mli": "ocaml",

    // 配置文件
    ".dockerfile": "dockerfile",
    ".dockerignore": "dockerfile",
    ".gitignore": "bash",
    ".env": "bash",
    ".editorconfig": "ini",
    ".prettierrc": "json",
    ".eslintrc": "json",

    // 构建工具
    ".makefile": "makefile",
    ".cmake": "cmake",
    ".gradle": "groovy",

    // 其他
    ".asm": "nasm",
    ".s": "nasm",
    ".vim": "vim",
    ".diff": "diff",
    ".patch": "diff",
    ".log": "log",
  };

  // 兼容不带点的扩展名（如 "tsx"），统一转换为带点的形式
  const normalized = extension.startsWith(".")
    ? extension.toLowerCase()
    : `.${extension.toLowerCase()}`;
  return langMap[normalized] || "text";
}

// 从文件名检测语言（无扩展名的特殊文件）
export function detectLanguageFromFilename(filename: string): string | null {
  const name = filename.toLowerCase();

  // 常见的无扩展名配置文件
  const filenameMap: Record<string, string> = {
    dockerfile: "dockerfile",
    makefile: "makefile",
    rakefile: "ruby",
    gemfile: "ruby",
    vagrantfile: "ruby",
    brewfile: "ruby",
    ".bashrc": "bash",
    ".zshrc": "bash",
    ".vimrc": "vim",
    ".gitconfig": "ini",
    ".npmrc": "ini",
    ".yarnrc": "ini",
    "cmakelists.txt": "cmake",
    "package.json": "json",
    "tsconfig.json": "json",
    "composer.json": "json",
  };

  for (const [key, lang] of Object.entries(filenameMap)) {
    if (name.includes(key)) {
      return lang;
    }
  }

  return null;
}

// 可用语言列表（工具栏选择）
export const AVAILABLE_LANGUAGES = [
  // JavaScript/TypeScript
  { value: "javascript", label: "JavaScript" },
  { value: "jsx", label: "JSX (React)" },
  { value: "typescript", label: "TypeScript" },
  { value: "tsx", label: "TSX (React)" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },

  // Web
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "sass", label: "Sass" },
  { value: "less", label: "Less" },
  { value: "stylus", label: "Stylus" },

  // Python
  { value: "python", label: "Python" },

  // Java ecosystem
  { value: "java", label: "Java" },
  { value: "kotlin", label: "Kotlin" },
  { value: "groovy", label: "Groovy" },
  { value: "scala", label: "Scala" },

  // C/C++
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },

  // C#/.NET
  { value: "csharp", label: "C#" },
  { value: "vbnet", label: "VB.NET" },
  { value: "fsharp", label: "F#" },

  // Shell
  { value: "bash", label: "Bash/Shell" },

  // PHP
  { value: "php", label: "PHP" },

  // Ruby
  { value: "ruby", label: "Ruby" },

  // Go
  { value: "go", label: "Go" },

  // Rust
  { value: "rust", label: "Rust" },

  // Swift
  { value: "swift", label: "Swift" },

  // Objective-C
  { value: "objectivec", label: "Objective-C" },

  // Data formats
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
  { value: "toml", label: "TOML" },
  { value: "ini", label: "INI" },

  // Markdown
  { value: "markdown", label: "Markdown" },
  { value: "rst", label: "reStructuredText" },
  { value: "latex", label: "LaTeX" },

  // SQL
  { value: "sql", label: "SQL" },

  // Other popular languages
  { value: "r", label: "R" },
  { value: "lua", label: "Lua" },
  { value: "perl", label: "Perl" },
  { value: "dart", label: "Dart" },
  { value: "elixir", label: "Elixir" },
  { value: "erlang", label: "Erlang" },
  { value: "clojure", label: "Clojure" },
  { value: "elm", label: "Elm" },
  { value: "haskell", label: "Haskell" },
  { value: "ocaml", label: "OCaml" },

  // Config/Build
  { value: "dockerfile", label: "Dockerfile" },
  { value: "makefile", label: "Makefile" },
  { value: "cmake", label: "CMake" },

  // Other
  { value: "nasm", label: "Assembly (NASM)" },
  { value: "vim", label: "Vim Script" },
  { value: "diff", label: "Diff" },
  { value: "log", label: "Log" },
  { value: "text", label: "Plain Text" },
];

// 获取语言显示名称
export function getLanguageDisplayName(extension: string): string {
  const langMap: Record<string, string> = {
    ".js": "JavaScript",
    ".jsx": "React JSX",
    ".ts": "TypeScript",
    ".tsx": "React TSX",
    ".py": "Python",
    ".java": "Java",
    ".cpp": "C++",
    ".c": "C",
    ".html": "HTML",
    ".css": "CSS",
    ".json": "JSON",
    ".xml": "XML",
    ".yaml": "YAML",
    ".yml": "YAML",
  };
  const normalized = extension.startsWith(".")
    ? extension.toLowerCase()
    : `.${extension.toLowerCase()}`;
  return langMap[normalized] || "Text";
}
