# 深柴动力网站 - GitHub + Cloudflare 部署完成

## ? 部署准备完成！

你的项目已经准备好通过GitHub上传到Cloudflare。

## ?? 文件夹结构

`
深柴动力/
├── src/                    # React源代码
│   ├── components/         # 组件文件
│   ├── assets/             # 图片资源
│   └── index.css           # 全局样式
├── public/                 # 公共资源（视频、图片）
├── dist/                   # 编译后的文件（Cloudflare部署此文件夹）
├── package.json            # 项目配置
├── vite.config.js          # Vite配置
├── index.html              # 主页入口
├── README.md               # 项目说明
├── .gitignore              # Git忽略文件
├── GITHUB_CLOUDFLARE_GUIDE.md # 详细部署指南
└── deploy-github.bat       # 快速部署脚本
`

## ?? 快速部署步骤

### 第一步：创建GitHub仓库
1. 访问 https://github.com/
2. 点击 "+" → "New repository"
3. 仓库名称：shenpower-website
4. 点击 "Create repository"

### 第二步：上传项目文件
1. 在仓库页面点击 "Add file" → "Upload files"
2. 将整个 "深柴动力" 文件夹中的以下内容拖拽到上传区域：
   - src/ 文件夹
   - public/ 文件夹
   - dist/ 文件夹
   - package.json
   - ite.config.js
   - index.html
   - README.md
   - .gitignore
3. 点击 "Commit changes"

### 第三步：连接Cloudflare Pages
1. 访问 https://dash.cloudflare.com/
2. 进入 "Pages" → "Create a project"
3. 选择 "Connect to Git"
4. 选择 "GitHub"
5. 选择 shenpower-website 仓库
6. 配置构建设置：
   - **Build command**: 
pm run build
   - **Build output directory**: dist
7. 点击 "Save and Deploy"

### 第四步：验证部署
1. 等待构建完成（通常1-3分钟）
2. 获得 *.pages.dev 域名
3. 访问网站检查功能

## ?? 部署检查清单

- [ ] GitHub仓库已创建
- [ ] 所有文件已上传
- [ ] Cloudflare Pages项目已创建
- [ ] GitHub仓库已连接
- [ ] 构建设置已配置
- [ ] 网站已成功部署
- [ ] 所有功能正常工作

## ?? 常见问题

### Q: 为什么选择GitHub + Cloudflare？
A: 
- **GitHub**: 版本控制、代码协作、免费私有仓库
- **Cloudflare**: 全球CDN、自动HTTPS、无限带宽

### Q: 如何更新网站？
A: 
1. 修改本地代码
2. 推送到GitHub main 分支
3. Cloudflare会自动重新部署

### Q: 部署后视频无法播放？
A: 
- 检查视频文件是否在 public 文件夹中
- 确保文件大小不超过25MB

## ?? 联系支持

如果遇到问题：
1. 查看详细指南：GITHUB_CLOUDFLARE_GUIDE.md
2. 运行快速脚本：deploy-github.bat
3. 查看Cloudflare文档：https://developers.cloudflare.com/pages/

## ?? 部署成功！

部署完成后，你将获得：
- ? 全球CDN加速的网站
- ? 自动HTTPS安全连接
- ? 无限带宽
- ? 自动构建和部署
- ? 预览部署功能

**现在你可以通过GitHub将项目上传到Cloudflare了！**
