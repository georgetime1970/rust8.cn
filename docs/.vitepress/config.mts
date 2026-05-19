import { defineConfig } from "vitepress";
import rustDirectory from "../Rust";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Rust 八股文🦀",
  description: "Rust 八股文 -- 更适合中国人的 Rust 教程,你的中文 Rust 枕边书",

  // base: '/Tutorial/', // GitHub 页面下部署站点,则需要设置此项,注意斜杠开头和结尾不能少！
  head: [
    // 站点图标
    // ['link', { rel: 'icon', href: '/Tutorial/logo/80.ico' }], // 如果使用github的域名,构建到GitHub 页面,需要加仓库的名字
    ["link", { rel: "icon", href: "/assets/logo/80.ico" }],
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
    // Baidu Analytics (百度统计)
    // 百度统计
    [
      "script",
      {
        defer: "true",
        src: "https://hm.baidu.com/hm.js?3fe7d816e724c32010c7e0e8f8c8c288",
      },
    ],
  ],

  // markdown 配置
  markdown: {
    lineNumbers: true, // 启用行号
    image: {
      // 默认禁用；设置为 true 可为所有图片启用懒加载.
      lazyLoading: true,
    },
  },
  // 站点地图
  sitemap: {
    hostname: "https://rust8.cn",
  },
  // 主题级选项
  themeConfig: {
    // 导航栏上显示的 Logo,位于站点标题前.
    logo: "/assets/logo/80.ico",

    // 社交链接
    socialLinks: [{ icon: "github", link: "https://github.com/georgetime1970/rust8.cn" }],

    // 启用本地搜索
    search: {
      provider: "local",
      options: {
        // 国际化配置: 将搜索框的提示文字改为中文
        locales: {
          root: {
            // 如果你想翻译默认语言,请将此处设为 `root`
            translations: {
              button: {
                buttonText: "搜索",
                buttonAriaLabel: "搜索",
              },
              modal: {
                displayDetails: "显示详细列表",
                resetButtonTitle: "重置搜索",
                backButtonTitle: "关闭搜索",
                noResultsText: "没有结果",
                footer: {
                  selectText: "选择",
                  selectKeyAriaLabel: "输入",
                  navigateText: "导航",
                  navigateUpKeyAriaLabel: "上箭头",
                  navigateDownKeyAriaLabel: "下箭头",
                  closeText: "关闭",
                  closeKeyAriaLabel: "Esc",
                },
              },
            },
          },
        },

        // 传递给 MiniSearch 的高级配置
        miniSearch: {
          // 基础配置
          options: {
            /**
             * 自定义中文分词器
             * 使用浏览器原生的 Intl.Segmenter 按中文词汇/字进行粒度切分
             */
            tokenize: (str) => {
              if (typeof str !== "string") return [];

              // 兼容不支持 Intl.Segmenter 的旧版本环境
              if (!globalThis.Intl || !globalThis.Intl.Segmenter) {
                return str.split(/[\s\p{P}]+/u).filter(Boolean);
              }

              // 使用中文分词器进行精确拆分
              const segmenter = new globalThis.Intl.Segmenter("zh-CN", {
                granularity: "word", // 按词（Word）切分,如“可反驳性”会被合理拆分
              });

              const segments = segmenter.segment(str);
              return Array.from(segments)
                .filter((seg) => seg.isWordLike) // 过滤标点符号和空白
                .map((seg) => seg.segment);
            },
          },
          // 搜索行为配置（核心: 开启模糊搜索）
          searchOptions: {
            // 确保搜索时的输入也采用相同的中文分词规则
            processTerm: (term) => term.trim().toLowerCase(),

            /*
               fuzzy 决定模糊匹配的程度: 
               - 数字表示允许拼错的字符数.
               - 也可以是一个函数,例如: (term) => term.length > 4 ? 1 : 0 (长度大于4允许错1个字).
               - 设置为 0.2 代表允许一定比例的拼写错误.
            */
            fuzzy: 0.2,
            // 开启前缀匹配（例如输入 "vit" 可以匹配到 "vitepress"）
            prefix: true,
            // 权重配置: 提升标题的匹配优先级,让搜索结果更精准
            boost: {
              title: 5, // 一级标题（最高优先级,权重最大）
              titles: 3, // 二级、三级等副标题（优先级高于正文）
              text: 1, // 纯正文内容（基础优先级）
            },
          },
        },
      },
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
