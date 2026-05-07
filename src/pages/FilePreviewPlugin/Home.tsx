import React, { ReactNode } from "react";

import { Link } from "react-router-dom";

// 设计升级版首页：更强的视觉层次、卡片化信息架构、清晰 CTA
export default function FilePreviewHome() {
  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: ReactNode;
  }) => (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{title}</h2>
      <div style={{ marginTop: 14 }}>{children}</div>
    </section>
  );

  const Card = ({
    title,
    children,
  }: {
    title: string;
    children: ReactNode;
  }) => (
    <div
      style={{
        padding: 16,
        borderRadius: 14,
        border: "1px solid #e7e9ee",
        background:
          "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(249,250,255,1) 100%)",
        boxShadow: "0 6px 20px rgba(30, 41, 59, 0.08)",
        transition: "transform 200ms ease, box-shadow 200ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 12px 28px rgba(30, 41, 59, 0.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 6px 20px rgba(30, 41, 59, 0.08)";
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ color: "#4b5563" }}>{children}</div>
    </div>
  );

  const NavItem = ({ to, children }: { to: string; children: ReactNode }) => (
    <Link
      to={to}
      style={{
        display: "block",
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        color: "#111827",
        textDecoration: "none",
        background:
          "linear-gradient(180deg, rgba(249,250,251,1) 0%, rgba(243,244,246,1) 100%)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background =
          "linear-gradient(180deg, rgba(243,244,246,1) 0%, rgba(229,231,235,1) 100%)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background =
          "linear-gradient(180deg, rgba(249,250,251,1) 0%, rgba(243,244,246,1) 100%)";
      }}
    >
      {children}
    </Link>
  );

  return (
    <div style={{ padding: 24, maxWidth: 1120, margin: "0 auto" }}>
      {/* Hero 区：品牌标题 + 副标题 + 主 CTA */}
      <div
        style={{
          padding: 28,
          borderRadius: 18,
          background:
            "linear-gradient(120deg, rgba(67,97,238,0.12) 0%, rgba(67,97,238,0.06) 40%, rgba(16,185,129,0.08) 100%)",
          border: "1px solid rgba(67,97,238,0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>📄</span>
          <h1 style={{ margin: 0, fontSize: 24 }}>
            Vane File Preview · 文件预览组件
          </h1>
        </div>
        <p style={{ marginTop: 8, color: "#334155", fontSize: 15 }}>
          一个功能强大、高度可扩展的 React 文件预览组件库，支持 15+
          种文件格式，基于插件化架构，提供统一的预览体验。
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <Link
            to="/file-preview/image"
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              background: "#4361ee",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
              boxShadow: "0 6px 18px rgba(67, 97, 238, 0.2)",
            }}
          >
            立即体验图片预览
          </Link>
          <Link
            to="/readme"
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              background: "#fff",
              color: "#111827",
              textDecoration: "none",
              border: "1px solid #e5e7eb",
              fontWeight: 700,
            }}
          >
            查看文档
          </Link>
        </div>
      </div>

      {/* 系统概览 */}
      <Section title="系统概览">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          <Card title="🔌 插件化架构">
            <div>
              - 基于事件总线的插件系统，支持灵活组合
              <br />- 15+ 内置预览插件，覆盖主流文件格式
              <br />- 易于扩展，支持自定义插件开发
            </div>
          </Card>
          <Card title="📄 丰富的文件格式">
            <div>
              - 文档类：PDF、Word、PowerPoint、Excel、Markdown、EPUB
              <br />- 代码类：JavaScript、TypeScript、Python 等 180+ 语言
              <br />- 媒体类：图片、音频、视频
            </div>
          </Card>
          <Card title="⚡ 性能优化">
            <div>
              - 懒加载机制，按需渲染
              <br />- 虚拟滚动支持大文件预览
              <br />- 内存缓存优化，响应式设计
            </div>
          </Card>
          <Card title="🛡️ 稳健性">
            <div>
              - 完善的错误处理机制
              <br />- 文件格式自动检测
              <br />- TypeScript 类型安全
            </div>
          </Card>
        </div>
      </Section>

      {/* 快速导航 */}
      <Section title="快速导航">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          <Card title="🖼️ 基础预览专区">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              <NavItem to="/file-preview/image">图片预览</NavItem>
              <NavItem to="/file-preview/pdf">PDF预览</NavItem>
              <NavItem to="/file-preview/video">视频预览</NavItem>
              <NavItem to="/file-preview/audio">音频预览</NavItem>
            </div>
          </Card>

          <Card title="📝 文档预览专区">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              <NavItem to="/file-preview/code">代码预览</NavItem>
              <NavItem to="/file-preview/markdown">Markdown预览</NavItem>
              <NavItem to="/file-preview/office">Office文档预览</NavItem>
            </div>
          </Card>

          <Card title="📊 数据预览专区">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              <NavItem to="/file-preview/csv">CSV预览</NavItem>
              <NavItem to="/file-preview/json">JSON预览</NavItem>
            </div>
          </Card>

          <Card title="🗜️ 压缩文件专区">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              <NavItem to="/file-preview/zip">ZIP预览</NavItem>
              <NavItem to="/file-preview/epub">EPUB预览</NavItem>
            </div>
          </Card>

          <Card title="🚀 综合示例专区">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              <NavItem to="/fp-plugin/example">综合示例</NavItem>
            </div>
          </Card>
        </div>
      </Section>

      {/* 文档与示例 CTA */}
      <Section title="文档与示例">
        <div
          style={{
            padding: 16,
            borderRadius: 14,
            background: "#f6f9ff",
            border: "1px solid #dbeafe",
          }}
        >
          <div style={{ fontWeight: 700 }}>📖 项目 README</div>
          <div style={{ marginTop: 8, color: "#4b5563" }}>
            查看 <Link to="/readme">README</Link>{" "}
            获取完整说明，或浏览侧边栏的演示路由。
          </div>
        </div>
      </Section>
    </div>
  );
}
