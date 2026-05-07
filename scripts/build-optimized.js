#!/usr/bin/env node

/**
 * 优化构建脚本
 * 分别构建核心包和插件包
 */

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 开始优化构建...\n");

// 1. 构建核心包（无第三方依赖）
console.log("📦 构建核心包...");
execSync("npm run build:core", { stdio: "inherit" });

// 2. 构建插件包（按需加载）
console.log("🔌 构建插件包...");
execSync("npm run build:plugins", { stdio: "inherit" });

// 3. 构建完整包（向后兼容）
console.log("📚 构建完整包...");
execSync("npm run build:full", { stdio: "inherit" });

// 4. 生成包大小报告
console.log("📊 生成包大小报告...");
const distPath = path.join(__dirname, "../dist");
const files = fs.readdirSync(distPath);

console.log("\n📈 构建产物大小:");
files.forEach((file) => {
  const filePath = path.join(distPath, file);
  const stats = fs.statSync(filePath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  console.log(`  ${file}: ${sizeKB} KB`);
});

console.log("\n✅ 优化构建完成！");
console.log("\n💡 使用建议:");
console.log("  - 轻量级应用: 使用 vane-file-preview/core + 特定插件");
console.log("  - 完整功能: 使用 vane-file-preview (全量包)");
console.log("  - 按需加载: 使用动态导入插件");
