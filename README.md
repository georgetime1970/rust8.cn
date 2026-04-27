<div align="center">

<img style="height: 350px;" src="./docs/public/assets/logo/logo.png" />

<div style=" padding: 0 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;">
  
<img style="height:200px; margin-right: 10px;" src="./docs/public/assets/img/1.webp" />
<img style="height:200px; margin-right: 10px;" src="./docs/public/assets/img/2.webp" />
<img style="height:200px; margin-right: 10px;" src="./docs/public/assets/img/3.webp" />
<img style="height:200px; margin-right: 10px;" src="./docs/public/assets/img/4.webp" />
</div>

<br/>

![Rust](https://img.shields.io/badge/Rust-orange?logo=rust&logoColor=white) ![GitHub](https://img.shields.io/badge/GitHub-000?logo=github) ![License](https://img.shields.io/badge/License-MIT-green) ![Chinese](https://img.shields.io/badge/Language-Chinese-red)

</div>

## 教程介绍

本教程是根据 [官方 Rust 教程](https://doc.rust-lang.org/stable/book/index.html) 、视频资料和相关书籍 **整理** 而成，章节结构顺序基本参照官方教程，但融入了合理的调整和补充,以减轻学习难度。某些章节也加入了知识点的补充和个人理解。你可以独立阅读此教程，也可以配合官方教程使用。

我的目标是让这个教程成为一个**更符合中国人学习习惯的 Rust 入门资源**，降低学习难度，提供更清晰的概念解释和逻辑顺序,也希望成为 Rust 学习者的枕边书,遇到概念上的问题随时查找.

**此教程目前仍在持续更新、整理中...**

目前对最后高级的几节整理的比较满意,知识点没有遗漏,主要是逻辑顺序整理的比较好

[**在线阅读**](https://rust8.cn/)

## 学习前置条件

本教程不要求你有 `C/C++` 等系统级语言基础，也不要求你深入理解内存堆栈。但完全零基础学习的难度会更高，某些知识点需要基础计算机科学知识作为前置知识。

## 为什么要整理这个教程

我本身喜欢做笔记,同时在学习的过程中发现了一些对初学者不友好的问题,本质原因是目前国内 Rust 的商业动力不够强,所以人们的动力也就不够强,但有些事情总需要有人去做.

现有的 Rust 教程资源虽然众多，但存在几个问题：

- 中文资源较少，多数是翻译作品，表达方式不符合中文学习逻辑
- 大多教程默认读者有系统开发基础，缺乏必要的前置知识说明
- Rust 学习曲线陡峭，现有教程在重难点讲解上不够充分,尤其是最后几章的高级部分,很不友好

本教程采用**中国教科书式**的讲解方式：**先阐明概念本质，再举例说明**，同时根据知识点的逻辑关系重新梳理顺序，希望能降低学习难度。

## 本教程的主要优势

- **更易学**：遵循"概念→原理→示例"的教学逻辑，符合中文学习习惯
- **更完整**：覆盖 Rust 核心知识点，对难点章节进行补充和详细讲解
- **更清晰**：直接剖析概念本质，加入辅助理解和总结，帮助理解设计理念
- **更逻辑**：按照知识逻辑重新梳理顺序，帮助理解和记忆

## 学习方式

本教程采用现代化的 [VitePress](https://vitepress.dev/zh/) 构建,页面**左边**是总的章节目录，**右边**是章节目录大纲。手机和 PC 端都做了适配,你可以点击目录中的章节标题来快速查看对应的内容。每个章节都包含了概念解释、原理分析和示例代码，帮助你更好地理解 Rust 的设计理念和使用方法。

## 建议和修改

个人难免有理解偏差和表达不清的地方，希望宽容.如果你发现了任何问题或者有更好的建议，欢迎提交 [issue](https://github.com/georgetime1970/rust8.cn/issues) 来改进这个教程。

## 支持与贡献

如果你觉得这个教程对你有帮助，欢迎给它一个 star ⭐，或者分享给更多的 Rust 学习者。如果你想参与改进这个教程，也欢迎提交 [pull request](https://github.com/georgetime1970/rust8.cn/pulls) 来贡献你的想法和修改,我比任何人都需要你。

非常感谢以下贡献者:

- [@georgetime1970](https://github.com/georgetime1970)

## 本地部署

**环境要求**

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/)

**安装依赖**

```bash
pnpm install
```

**启动开发服务器**

```bash
pnpm docs:dev
```

启动后访问 `http://localhost:5173` 即可在本地预览。

**构建静态文件**

```bash
pnpm docs:build
```

**预览构建结果**

```bash
pnpm docs:preview
```
