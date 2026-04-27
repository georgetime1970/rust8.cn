<div align="center">

# 🦀 Rust 八股文

<img style="height: 350px;" src="./docs/public/assets/logo/logo.jpg" />

<div style=" padding: 0 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;">
<img style="height:200px; margin-right: 10px;" src="./docs/public/assets/img/1.jpg" />
<img style="height:200px; margin-right: 10px;" src="./docs/public/assets/img/2.jpg" />
<img style="height:200px; margin-right: 10px;" src="./docs/public/assets/img/3.jpg" />
<img style="height:200px; margin-right: 10px;" src="./docs/public/assets/img/4.jpg" />
</div>

![Rust](https://img.shields.io/badge/Rust-orange?logo=rust&logoColor=white)

</div>

---

本教程根据官方 Rust 教程、视频资料和相关书籍**整理**而成，章节结构基本参照官方教程，但融入了合理的调整和补充。你可以独立阅读，也可以配合官方教程使用。

目标是让这个教程成为更符合中国人学习习惯的 Rust 入门资源，降低学习难度，提供更清晰的概念解释和逻辑顺序，也希望成为 Rust 学习者的枕边书，遇到概念上的问题随时查找。

## 特点

- **更易学**：遵循"概念→原理→示例"的教学逻辑，符合中文学习习惯
- **更完整**：覆盖 Rust 核心知识点，对难点章节进行补充和详细讲解
- **更清晰**：直接剖析概念本质，加入辅助理解和总结，帮助理解设计理念
- **更逻辑**：按照知识逻辑重新梳理顺序，帮助理解和记忆

## 前置条件

本教程不要求有 `C/C++` 等系统级语言基础，也不要求深入理解内存堆栈。但完全零基础学习的难度会更高，某些知识点需要基础计算机科学知识作为前置知识。

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

## 建议与贡献

个人难免有理解偏差和表达不清的地方，如果你发现了任何问题或者有更好的建议，欢迎提交 [Issue](../../issues) 或 [Pull Request](../../pulls) 来改进这个教程。

如果这个教程对你有帮助，欢迎给它一个 Star ⭐，或者分享给更多的 Rust 学习者。
