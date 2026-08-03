# 深柴能源轻量新闻后台

这是网站自带的单管理员新闻后台。它面向低频企业新闻与发电机组科普内容，避免通用 CMS 的插件、权限和内容模型配置负担。

## 本机启动

```powershell
Copy-Item .env.example .env
pnpm install --frozen-lockfile
pnpm dev
```

打开 `http://127.0.0.1:3001/admin/`。第一次打开时建立管理员账户，随后可以：

- 新建、保存草稿、发布和撤回文章；
- 上传封面和正文图片；
- 管理中英文、栏目、标签、作者、阅读时间和 SEO；
- 导出包含文章与图片的 ZIP 备份；
- 在另一台电脑或服务器的新后台恢复 ZIP。

运行自动化接口测试：

```powershell
pnpm test
```

## 本机数据

- 数据库：`.data/news.sqlite`
- 图片：`.data/uploads/`
- 管理员密码使用 `scrypt` 加盐哈希保存；浏览器登录使用 HttpOnly 会话 Cookie。
- `.data/` 和 `.env` 已被 Git 忽略，不会上传到仓库。

请定期点击后台右上角“导出备份”，并把 ZIP 复制到另一块磁盘。

## 迁移服务器

1. 在服务器安装 Node.js 22 或更高版本并复制项目。
2. 复制 `.env.example` 为 `.env`，将 `HOST` 改为 `127.0.0.1`，设置正式 `PUBLIC_BASE_URL`、`SITE_PREVIEW_URL`、`SITE_ORIGINS`，启用 `COOKIE_SECURE=true`，并把 `TRUST_PROXY` 设置为反向代理的本机地址（通常是 `127.0.0.1`）。
3. 执行 `pnpm install --frozen-lockfile` 与 `pnpm start`。
4. 使用 Nginx 或 Caddy 把正式 API 域名反向代理到 `127.0.0.1:3001`，并配置 HTTPS。
5. 在新后台建立管理员，随后恢复本机导出的 ZIP。
6. 将网站构建变量 `VITE_NEWS_API_URL` 指向正式 API，重新构建并部署静态网站。

`cms/` 中的旧 Strapi 当前仅作为回退保留，不参与这套后台运行。
