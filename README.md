# 深柴动力统一站点

React 19 + Vite 8 构建的深柴动力双语统一站点。主站、关于我们和 5 个 3D 产品展厅共用一个同源项目与一个部署产物，页面采用工业蓝、冷白、大字号标题、技术编号与实色面板，支持中文和英文切换。

## 统一站点入口

| 地址 | 页面 |
| --- | --- |
| `/` | 主站首页 |
| `/about/` | 关于我们 |
| `/products/open-frame-500/` | 500kW 开放式机组 |
| `/products/open-frame-1200/` | 1200kW 开放式机组 |
| `/products/silent/` | 静音型机组 |
| `/products/mobile-trailer/` | 移动拖车型机组 |
| `/products/high-voltage/` | 高压/预留产品页 |

旧子站目录仍保留在部署文件夹中作为恢复源，不参与统一构建。

## 首页结构

| 编号 | 模块 | 锚点 | 组件 |
| --- | --- | --- | --- |
| 开屏 | 首页主视频 | `#top` | `src/components/Hero.jsx` |
| 01 | 为什么选择我们 / 资质矩阵 | `#advantages` | `src/components/Advantages.jsx` |
| 02 | 探索产品 | `#products` | `src/components/Products.jsx` |
| 03 | 聚焦行业 | `#industry` | `src/components/Industry.jsx` |
| 04 | 关于深柴动力 | `#about` | `src/components/About.jsx` |
| 05 | 项目案例 | `#cases` | `src/components/Cases.jsx` |
| 06 | 销售与服务 | `#contact` | `src/components/Contact.jsx` |

首页开屏只保留一个主视频和“探索产品”入口，不包含旧聚光灯互动页或左右切换页。

## 本地开发

```powershell
pnpm install
pnpm run dev
pnpm run check:videos
pnpm run lint
pnpm run build
```

- `pnpm run check:videos`：检查 6 个本地 MP4 文件和文件头，不依赖本地服务器。
- `pnpm run lint`：检查当前源码。
- `pnpm run build`：生成 `dist/` 生产目录。

项目只保留 `pnpm-lock.yaml`；不要提交 `node_modules/`、`dist/`、本地快照、压缩包或历史素材目录。

## Cloudflare Pages / 一键部署

- 构建命令：`pnpm run build`
- 输出目录：`dist`
- 根目录：项目根目录
- 依赖锁文件：`pnpm-lock.yaml`

Cloudflare Pages 只需要部署本项目构建出的 `dist`，不再分别配置主站和子站域名。当前统一构建会生成 `dist/index.html`、`dist/about/index.html` 和 5 个产品入口目录；没有单个文件超过 100 MB。

## 关键文件

- `src/App.jsx`：首页模块顺序和整体入口。
- `src/i18n.jsx`：中英文文案。
- `src/main-redesign.css`：主要页面视觉、覆盖转场和响应式样式。
- `src/components/Hero.jsx`：唯一首页开屏视频。
- `src/components/Advantages.jsx`：可信理由、真实项目图和资质矩阵。
- `src/components/Cases.jsx`：项目案例曲线与滚动插入效果。
- `src/components/Contact.jsx`：醒目的电话、邮箱和公司信息。
- `products/<slug>/`：各产品 3D 展厅的独立入口、组件和样式。
- `public/product-assets/<slug>/`：按产品隔离的模型与图片；`public/product-assets/shared/` 为共享模型依赖。
- `public/about/`：关于我们静态页面及其同源资源。
- `scripts/check-video-assets.mjs`：视频完整性检查。
- `项目交接文档.md`：设计决策、清理记录和维护注意事项。

## 素材与归档

- 线上资源只保留在 `public/` 和 `src/assets/`，均由当前源码引用。
- 原始素材、旧页面导出和本地恢复快照已移出项目，不参与 GitHub 或 Cloudflare 部署。
- 清理前恢复包：`E:\深柴网站总文件\部署文件\深柴动力主页1.0-清理归档\before-slim-20260723-204709.zip`
- 恢复包 SHA256：`1741E503C72C50FCBEDA38B0982AAF410AFB37C49DBF13BC3F69B061EA4FDFA6`

## 发布前检查

1. 运行 `pnpm run check:videos`、`pnpm run lint` 和 `pnpm run build`。
2. 检查中文和英文切换。
3. 检查桌面端与 390px 手机端无横向溢出、无缺图和不可读视频。
4. 确认首页顺序仍为：开屏视频 → 为什么选择我们 → 探索产品 → 聚焦行业 → 关于深柴动力 → 项目案例 → 销售与服务。
5. 检查待推送提交中没有 `.zip`、本地快照或超过平台限制的大文件。
