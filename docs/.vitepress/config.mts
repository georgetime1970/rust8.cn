import { defineConfig } from "vitepress";
import rustDirectory from "../Rust";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Rust 八股文🦀",
  description: "Rust 八股文 -- 更适合中国人的 Rust 教程,你的中文 Rust 枕边书",

  // base: '/Tutorial/', // GitHub 页面下部署站点，则需要设置此项,注意斜杠开头和结尾不能少！
  head: [
    // 站点图标
    // ['link', { rel: 'icon', href: '/Tutorial/logo/will-o.ico' }], // 如果使用github的域名,构建到GitHub 页面,需要加仓库的名字
    ["link", { rel: "icon", href: "/assets/logo/will.ico" }],
    // 关键词 (Keywords)
    ["meta", { name: "keywords", content: "rust, 编程, 教程, 八股文, 手册, rust 编程, rust 八股文, rust 教程, rust 手册" }],
    // 作者信息
    ["meta", { name: "author", content: "Amazing George" }],
    // --- Open Graph / Facebook (用于社交分享卡片) ---
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "Rust 八股文🦀" }],
    ["meta", { property: "og:description", content: "Rust 八股文 -- 更适合中国人的 Rust 教程,你的中文 Rust 枕边书" }],
    ["meta", { property: "og:image", content: "https://rust8.cn/assets/logo/logo.webp" }], // 替换为你的封面图链接
    ["meta", { property: "og:url", content: "https://rust8.cn" }],
    // --- Twitter Card ---
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: "Rust 八股文🦀" }],
    ["meta", { name: "twitter:description", content: "Rust 八股文 -- 更适合中国人的 Rust 教程,你的中文 Rust 枕边书" }],
    ["meta", { name: "twitter:image", content: "https://rust8.cn/assets/logo/logo.webp" }],
    // 站点验证
    ["meta", { name: "msvalidate.01", content: "AB30D4CB3862B6C86DAC6EF49D710C6A" }],
    ["meta", { name: "google-site-verification", content: "697GvCEem1STAYS7y5BDIpz7Y28YdoKxouo3UStRfr4" }],
    ["meta", { name: "baidu-site-verification", content: "codeva-6fA4CDeEqo" }],
  ],

  // markdown 配置
  markdown: {
    lineNumbers: true, // 启用行号
    image: {
      // 默认禁用；设置为 true 可为所有图片启用懒加载。
      lazyLoading: true,
    },
  },
  // 站点地图
  sitemap: {
    hostname: "https://rust8.cn",
  },
  // 主题级选项
  themeConfig: {
    // 导航栏上显示的 Logo，位于站点标题前。
    logo: "/assets/logo/will.ico",

    // 社交链接
    socialLinks: [{ icon: "github", link: "https://github.com/georgetime1970/rust8.cn" }],

    // 启用本地搜索
    search: {
      provider: "local",
    },

    //  最后更新于
    lastUpdated: {
      text: "Updated at",
      formatOptions: {
        dateStyle: "full",
        timeStyle: "medium",
      },
    },

    // 编辑链接配置
    editLink: {
      // GitHub (最常用)
      pattern: "https://github.com/georgetime1970/rust8.cn/tree/main/docs/:path",
      text: "在 GitHub 上编辑此页",
    },

    // 添加自定义的 Codespaces 链接
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },

    // 配置右侧目录大纲
    outline: {
      level: [2, 6], // 显示 h2 到 h6 的标题
      label: "目录大纲",
    },
    // 页脚信息
    footer: {
      message: "基于 MIT 协议发布",
      copyright: "Copyright © 2026-Rust 八股文 社区贡献者",
    },
    // 顶部导航栏
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "首页", link: "/" },
      { text: "Rust 八股文", link: "/Rust/前言" },
      { text: "学习资料", link: "/Rust/学习资料" },
    ],

    // 侧边栏是文档的主要导航块
    sidebar: [rustDirectory],
  },
});
