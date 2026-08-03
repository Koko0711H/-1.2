# 深柴能源新闻后台

本目录是网站新闻模块的本机 Strapi 后台。当前默认使用 SQLite，购买服务器后通过 Strapi 数据导出/导入迁移到 PostgreSQL。

## 首次启动

```powershell
Copy-Item .env.example .env
pnpm install --frozen-lockfile
pnpm develop --no-watch-admin
```

打开 `http://localhost:1337/admin` 创建本机管理员。管理员密码只保存在本机数据库中，不要写入 Git 或交接文档。

后台已启用 Strapi 自带的中文（繁体）界面选项，并阻止 Chrome 自动翻译改写 React 页面节点。需要中文界面时请在个人资料中选择中文，不要对 `localhost:1337/admin` 使用浏览器网页翻译。

## 内容结构

- 新闻文章：标题、共用 URL 标识、摘要、正文、封面、分类、标签、作者、阅读时长、推荐状态和 SEO 字段。中文/英文版本共用同一 slug，切换语言时文章链接保持稳定。
- 新闻分类：建议建立“发电机组基础、选型指南、维护保养、常见故障、行业应用、公司动态”。
- 文章标签：用于内容检索和相关文章关联。
- 中文为默认语言；在“设置 → 国际化”中添加 English 后，可为同一文章录入英文版本。

只有已发布文章会通过公开只读 API 提供给新闻网站。后台的创建、修改、删除接口仍需要管理员权限。

## 本机地址

- 后台：`http://localhost:1337/admin`
- 新闻 API：`http://localhost:1337/api/articles`
- 网站开发地址通常为：`http://localhost:5173/news/`

## 数据备份

在项目根目录执行：

```powershell
New-Item -ItemType Directory -Force backups
pnpm cms:export
```

导出包包含内容和媒体，脚本使用未加密压缩包以便本机迁移不需要交互输入。`backups/` 不应提交到公共仓库。

## 服务器迁移

1. 服务器安装 Node.js、Strapi 依赖和 PostgreSQL。
2. 复制本目录源码，不复制本机 `.env`。
3. 根据 `.env.example` 创建服务器 `.env`，将 `DATABASE_CLIENT` 改为 `postgres`。
4. 初始化服务器 Strapi，然后使用 `strapi import --file flydeer-news.tar.gz --force` 导入本机导出包；导入前确认目标环境没有需要保留的数据。
5. 把网站的 `VITE_STRAPI_URL` 改为正式 CMS 地址并重新构建。

本地上传目录和数据库文件均已排除 Git，避免把文章素材、管理员数据和密钥提交到代码仓库。
