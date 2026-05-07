#!/usr/bin/env node

/**
 * 优化构建脚本
 * 构建 npm 发布包并输出产物体积
 */

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runPackageScript = (scriptName) => {
  const packageManagerPath = process.env.npm_execpath;

  if (packageManagerPath) {
    const command = packageManagerPath.endsWith(".js")
      ? `"${process.execPath}" "${packageManagerPath}" run ${scriptName}`
      : `"${packageManagerPath}" run ${scriptName}`;

    execSync(command, { stdio: "inherit" });
    return;
  }

  execSync(`bun run ${scriptName}`, { stdio: "inherit" });
};

console.log("🚀 开始优化构建...\n");

// 1. 构建 npm 发布包（主入口 + core + plugins）
console.log("📦 构建 npm 发布包...");
runPackageScript("build:lib");

// 2. 生成包大小报告
console.log("📊 生成包大小报告...");
const distPath = path.join(__dirname, "../dist");
const files = [];

const collectFiles = (dirPath) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      collectFiles(fullPath);
      return;
    }

    files.push(fullPath);
  });
};

collectFiles(distPath);

console.log("\n📈 构建产物大小:");
files
  .sort((left, right) => left.localeCompare(right))
  .forEach((filePath) => {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    const relativePath = path.relative(distPath, filePath);
    console.log(`  ${relativePath}: ${sizeKB} KB`);
  });

console.log("\n✅ 优化构建完成！");
console.log("\n💡 使用建议:");
console.log("  - 主入口: 使用 @dev_xiaoyun/vane-file-preview");
console.log("  - 轻量核心: 使用 @dev_xiaoyun/vane-file-preview/core");
console.log("  - 插件集合: 使用 @dev_xiaoyun/vane-file-preview/plugins");

