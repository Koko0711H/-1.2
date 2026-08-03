# 深柴能源统一站点

React 19 + Vite 8 构建的深柴能源双语统一站点。主站、关于我们和 5 个 3D 产品展厅共用一个同源项目与一个部署产物，页面采用工业蓝、冷白、大字号标题、技术编号与实色面板，支持中文和英文切换。

## 统一站点入口

| 地址 | 页面 |
| --- | --- |
| `/` | 主站首页 |
| `/about/` | 关于我们 |
| `/products/open-frame-500/` | 500kW 开放式机组 |
| `/products/open-frame-1200/` | 1200kW 开放式机组 |
| `/products/silent/` | 静音型机组 |
| `/products/mobile-trailer/` | 移动拖车型机组 |
| `/products/high-voltage/` | 高压配电系统 |

旧子站目录仍保留在部署文件夹中作为恢复源，不参与统一构建。

## 首页结构

| 编号 | 模块 | 锚点 | 组件 |
| --- | --- | --- | --- |
| 开屏 | 首页主视频 | `#top` | `src/components/Hero.jsx` |
| 01 | 为什么选择我们 / 资质矩阵 | `#advantages` | `src/components/Advantages.jsx` |
| 02 | 探索产品 | `#products` | `src/components/Products.jsx` |
| 03 | 聚焦行业 | `#industry` | `src/components/Industry.jsx` |
| 04 | 关于深柴能源 | `#about` | `src/components/About.jsx` |
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

- `pnpm run check:videos`：检查 8 个本地 MP4 文件和文件头，不依赖本地服务器。
- `pnpm run lint`：检查当前源码。
- `pnpm run build`：生成 `dist/` 生产目录。

## 新闻动态子站（本机 Strapi）

新闻动态是独立的 `/news/` 入口，内容由本机 Strapi 后台管理；前台通过 REST API 读取已发布文章。当前默认使用 SQLite，后续购买服务器后可将数据库切换为 PostgreSQL 并迁移导出包。

首次使用时复制环境模板（已有 `cms/.env` 时无需覆盖）：

```powershell
Copy-Item .env.example .env
Copy-Item cms/.env.example cms/.env
pnpm --dir cms install --frozen-lockfile
```

启动后台（终端一）：

```powershell
pnpm cms:dev
```

启动网站（终端二）：

```powershell
pnpm dev -- --host 127.0.0.1
```

- 后台管理：`http://localhost:1337/admin`
- 新闻前台：`http://localhost:5173/news/?lang=zh`
- 内容模型：文章、分类、标签；文章支持封面、富文本块、草稿/发布、中文/英文语言版本。
- 备份：`pnpm cms:export`，备份文件写入根目录 `backups/flydeer-news.tar.gz`；迁移到新环境后使用 `pnpm cms:import`（导入会覆盖目标环境数据，请先确认）。

服务器部署时，把 `cms/.env` 中的 `DATABASE_CLIENT` 改为 `postgres`，填写 PostgreSQL 连接参数；另复制根目录 `.env.example` 为 `.env`，将其中的 `VITE_STRAPI_URL` 指向正式 API 地址，再执行 `pnpm run build`。

项目只保留 `pnpm-lock.yaml`；不要提交 `node_modules/`、`dist/`、本地快照、压缩包或历史素材目录。

## Cloudflare Pages / 一键部署

- 构建命令：`pnpm run build`
- 输出目录：`dist`
- 根目录：项目根目录
- 依赖锁文件：`pnpm-lock.yaml`

Cloudflare Pages 只需要部署本项目构建出的 `dist`，不再分别配置主站和子站域名。当前统一构建会生成 `dist/index.html`、`dist/about/index.html` 和 5 个产品入口目录。2026-07-31 的生产构建共 161 个文件、约 95.26 MiB，最大单文件约 6.39 MiB，低于 Cloudflare Pages 的 25 MiB 单文件限制。

## 关键文件

- `src/App.jsx`：首页模块顺序和整体入口。
- `src/i18n.jsx`：中英文文案。
- `src/main-redesign.css`：主要页面视觉、覆盖转场和响应式样式。
- `src/mobile-site.css`：主站手机端媒体视窗、横向卡片、触控尺寸和正常阅读流。
- `src/mobile-header.css`：主站与 5 个产品页共用的手机顶部栏规格。
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
3. 检查桌面端与 360px、390px、412px 手机端无横向溢出、无缺图和不可读视频。
4. 确认首页顺序仍为：开屏视频 → 为什么选择我们 → 探索产品 → 聚焦行业 → 关于深柴能源 → 项目案例 → 销售与服务。
5. 检查待推送提交中没有 `.zip`、本地快照或超过平台限制的大文件。

## 2026-07-31 媒体清晰度与手机端重构

- 首页手机端开屏改为完整的 16:9 视频视窗，标题、说明和“探索产品”按钮进入正常文档流，不再通过放大裁切填满竖屏，也不再产生首屏后的大段空白。
- “聚焦行业”改为可横向滑动的完整比例图片卡片；项目案例和销售服务图片降低遮罩、提高亮度，同时保留工业蓝层级和文字对比度。
- 5 个产品展厅共用 `products/shared/product-mobile.css`：手机端 3D 模型放入独立圆角展示台，自适应相机距离与模型比例，确保机组完整可见；阶段导航为底部横向触控条，按钮高度满足 44px 以上。
- 修复产品页手机端 `html/body/#root` 固定高度导致页面无法滚动的问题。阶段按钮现在会推进到对应内容，上滑也可正常返回。
- 高压产品页已由占位内容更新为正式的“高压配电系统”中英文说明；所有产品页统一使用 `FLYDEER POWER · 始于 2002` 和“产品总览 / Product Overview”。
- 关于我们页面的项目、公司介绍、工厂、交付和服务模块在手机端改为正常阅读流或横向图片卡片，不再沿用桌面端粘性舞台的位移和透明度，避免重叠、裁切和空白段。
- 媒体采用桌面/手机自适应版本、WebP 图片、懒加载和 Cloudflare 长缓存头；视频校验脚本当前覆盖 8 个 MP4。
- 实际浏览器回归已覆盖 360×800、390×844、412×915 和桌面 1440×900；7 个入口的菜单、语言保持、产品阶段导航、触控尺寸、滚动和横向溢出检查全部通过。
