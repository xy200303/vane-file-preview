#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "../dist");

const entryTypeFiles = [
  {
    outputPath: path.join(distPath, "index.d.ts"),
    content:
      "export * from './src/components/FilePreviewPlugin/index'\nexport {}\n",
  },
  {
    outputPath: path.join(distPath, "core/index.d.ts"),
    content:
      "export * from '../src/components/FilePreviewPlugin/core/index'\nexport {}\n",
  },
  {
    outputPath: path.join(distPath, "plugins/index.d.ts"),
    content:
      "export * from '../src/components/FilePreviewPlugin/plugins/index'\nexport {}\n",
  },
];

entryTypeFiles.forEach(({ outputPath, content }) => {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, "utf8");
});

const requiredEntries = [
  "index.es.js",
  "index.cjs",
  "core/index.es.js",
  "core/index.cjs",
  "plugins/index.es.js",
  "plugins/index.cjs",
];

requiredEntries.forEach((relativePath) => {
  const absolutePath = path.join(distPath, relativePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing build artifact: ${relativePath}`);
  }
});

console.log("✅ 已生成 npm 子入口类型文件");
