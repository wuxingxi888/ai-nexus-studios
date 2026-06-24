<p align="center">
  <img src="web/public/logo.svg" width="96" alt="logo">
</p>

<h1 align="center">Nexus Studios</h1>

<p align="center">
  <a href="https://linux.do/"><img src="https://img.shields.io/badge/Linux.do-Community-2b6de8?style=flat-square" alt="Linux.do"></a>
  <a href="https://render.com/deploy?repo=https://github.com/basketikun/infinite-canvas"><img src="https://img.shields.io/badge/Render-Deploy-46e3b7?style=flat-square&logo=render&logoColor=111111" alt="Deploy to Render"></a>
  <a href="VERSION"><img src="https://img.shields.io/badge/version-v0.1.0-2563eb?style=flat-square" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-f97316?style=flat-square" alt="License"></a>
  <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Vercel-ready-000000?style=flat-square&logo=vercel" alt="Vercel ready"></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=nextdotjs" alt="Next.js"></a>
</p>

Nexus Studios 是一款面向 AI 创作的开源工作台。它把画布编排、AI 图片生成、AI 视频生成、参考图编辑、对话助手、提示词库和素材管理放在同一个工作区里，帮助你把灵感、生成结果和迭代过程串成一条连续的创作流程。

## 核心功能

- 画布编排：多画布项目、节点拖拽缩放、连线、小地图、撤销重做、导入导出。
- AI 创作：浏览器前台直连你配置的 OpenAI 兼容接口，支持文生图、图生图、参考图编辑、文本问答、音频和视频生成；Seedance 2.0 可通过火山方舟 Agent Plan 接入。
- 画布助手：围绕选中节点和上游节点对话、生图，并把结果插回画布。
- 本地 Agent：通过本机 Canvas Agent 连接 Codex / Claude Code，让 Agent 通过 MCP 操作当前画布。
- 提示词库：Next.js route 抓取多个 GitHub 开源项目，并缓存在运行实例内存中。

完整功能说明见 [功能介绍](docs/content/docs/overview/features.mdx)。

如果你在为担心没有合适的生图API来发愁，可以查看该免费生图项目：[chatgpt2api](https://github.com/basketikun/chatgpt2api)

## 目录架构

```txt
web/src/
├── app/                      # Next.js 路由入口、layout、route handler
│   ├── (workspace)/          # 工作台路由组，不影响 URL
│   │   ├── page.tsx          # 首页路由壳
│   │   ├── canvas/          # /canvas 与 /canvas/[id]
│   │   ├── image/           # /image 生图工作台
│   │   ├── video/           # /video 视频工作台
│   │   ├── prompts/         # /prompts 提示词库
│   │   └── assets/          # /assets 我的素材
│   ├── api/                  # 仅保留少量 API route
│   │   └── prompts/         # 提示词抓取与缓存
│   └── webdav-proxy/         # WebDAV 代理，保留原路径
├── features/                 # 按业务领域拆分的页面与私有模块
│   ├── home/                 # 首页内容
│   ├── canvas/               # 画布项目、编辑器、状态、工具函数
│   ├── image/                # 生图工作台
│   ├── video/                # 视频工作台
│   ├── prompts/              # 提示词库页面与组件
│   └── assets/               # 素材管理与导入导出
├── components/               # 跨领域可复用组件
│   ├── layout/               # 顶部导航、配置弹窗、全局外壳
│   └── ui/                   # 基础 UI 组件
├── services/                 # API 请求、同步、文件存储
├── stores/                   # 跨页面状态
├── hooks/                    # 跨页面复用 hooks
├── lib/                      # 工具库和主题配置
├── constant/                 # 全局常量
└── types/                    # 全局类型
```

## 技术栈

- 前端：Next.js App Router、React、TypeScript、Tailwind CSS、Ant Design、Zustand、TanStack Query。
- 领域组织：`web/src/features` + `web/src/components` + `web/src/services`。
- 运行与部署：Vercel 或 Docker。

## 快速开始

推荐直接导入仓库到 Vercel，根目录已提供 `vercel.json`，会构建 `web/`。AI API Key、Base URL、画布、素材和生成记录默认保存在浏览器本地。

```bash
git clone https://github.com/wuxingxi888/ai-nexus-studios
cd ai-nexus-studios
cd web
bun install
bun run dev
```

Docker 运行：

```bash
docker build -t ai-nexus-studios .
docker run --rm -p 3000:3000 ai-nexus-studios
```

运行后默认端口3000，可访问 `http://localhost:3000`。

首次打开后进入右上角配置，填入自己的 OpenAI 兼容 `Base URL` 和 `API Key`。

## New API 自动配置

如果使用 New API，可在 `系统设置 -> 聊天方式 -> 添加聊天设置` 中填入：

```text
https://canvas.best?apiKey={key}&baseUrl={address}
```

跳转后会自动打开配置弹窗并填入 API Key 和 Base URL。
如果自己部署了，可以把 `https://studios.ainexusplus.com` 替换成你部署的地址。

## 效果展示

<table width="100%">
  <tr>
    <td width="50%"><img src="https://i.ibb.co/TDFvGWDT/image.png" alt="image" border="0"></td>
    <td width="50%"><img src="https://i.ibb.co/zVwJq3YS/image.png" alt="image" border="0"></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://i.ibb.co/PvY3qhhK/image.png" alt="image" border="0"></td>
    <td width="50%"><img src="https://i.ibb.co/7D04LwN/image.png" alt="image" border="0"></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://i.ibb.co/bj30FtS5/5.png" alt="5" border="0"></td>
    <td width="50%"><img src="https://i.ibb.co/hxRvjw51/image.png" alt="image" border="0"></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://i.ibb.co/jkWsF8q1/image.png" alt="image" border="0"></td>
    <td width="50%"><img src="https://i.ibb.co/XrnfXHx7/image.png" alt="image" border="0"></td>
  </tr>
</table>
