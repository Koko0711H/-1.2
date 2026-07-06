# 深柴动力网站 - GitHub + Cloudflare 部署指南

## 第一步：创建GitHub仓库

### 1. 登录GitHub
1. 访问 https://github.com/
2. 登录你的GitHub账户

### 2. 创建新仓库
1. 点击右上角 "+" 号 → "New repository"
2. 填写仓库信息：
   - Repository name: shenpower-website
   - Description: 深柴动力官方网站 - React + Vite
   - 选择 "Public" 或 "Private"
3. 勾选 "Add a README file"
4. 点击 "Create repository"

## 第二步：上传项目文件

### 方法1：使用GitHub网页界面（推荐新手）

1. 在仓库页面，点击 "Add file" → "Upload files"
2. 将整个 "深柴动力" 文件夹中的以下文件/文件夹拖拽到上传区域：
   `
   ├── src/                    # 源代码
   ├── public/                 # 公共资源
   ├── dist/                   # 编译后的文件（重要！）
   ├── package.json            # 项目配置
   ├── vite.config.js          # Vite配置
   ├── index.html              # 主页入口
   ├── README.md               # 项目说明
   └── .gitignore              # Git忽略文件
   `
3. 点击 "Commit changes"

### 方法2：使用Git命令行（推荐有经验的用户）

如果你已安装Git，可以使用以下命令：
`ash
# 1. 克隆仓库
git clone https://github.com/你的用户名/shenpower-website.git

# 2. 进入项目目录
cd shenpower-website

# 3. 复制项目文件到仓库目录
# （将"深柴动力"文件夹中的所有文件复制到仓库目录）

# 4. 添加所有文件
git add .

# 5. 提交更改
git commit -m "Initial commit: 深柴动力网站"

# 6. 推送到GitHub
git push origin main
`

## 第三步：连接Cloudflare Pages

### 1. 登录Cloudflare
1. 访问 https://dash.cloudflare.com/
2. 登录你的Cloudflare账户

### 2. 创建Pages项目
1. 进入 "Pages" 部分
2. 点击 "Create a project"
3. 选择 "Connect to Git"

### 3. 连接GitHub仓库
1. 选择 "GitHub"
2. 授权Cloudflare访问你的GitHub账户
3. 选择 shenpower-website 仓库
4. 点击 "Begin setup"

### 4. 配置构建设置
1. **Project name**: shenpower-website
2. **Production branch**: main
3. **Build command**: 
pm run build
4. **Build output directory**: dist
5. 点击 "Save and Deploy"

## 第四步：验证部署

### 1. 等待构建完成
- Cloudflare会自动从GitHub拉取代码
- 运行 
pm run build 构建项目
- 部署到全球CDN

### 2. 访问网站
1. 构建完成后，你会获得一个 *.pages.dev 域名
2. 点击该域名访问你的网站
3. 检查所有功能是否正常

## 第五步：配置自定义域名（可选）

### 1. 添加自定义域名
1. 在Pages项目设置中，点击 "Custom domains"
2. 输入你的域名（例如：www.shenpower.com）
3. 点击 "Continue"

### 2. 配置DNS记录
Cloudflare会提供DNS配置信息：
`
类型: CNAME
名称: www
内容: shenpower-website.pages.dev
`

### 3. 验证域名
1. 等待DNS传播（通常几分钟到几小时）
2. 访问你的自定义域名验证

## 自动部署设置

### 1. 启用自动部署
- 默认情况下，每次推送到 main 分支都会自动触发部署
- 你也可以在Pages设置中配置其他分支

### 2. 部署预览
- 每个Pull Request都会生成一个预览部署
- 方便测试新功能而不影响生产环境

## 常见问题

### Q: 为什么选择GitHub + Cloudflare？
A: 
- **GitHub**: 版本控制、代码协作、免费私有仓库
- **Cloudflare**: 全球CDN、自动HTTPS、无限带宽、免费SSL

### Q: 部署后视频无法播放？
A: 
- 检查 hero-video.mp4 文件是否在 public 文件夹中
- 确保文件大小不超过25MB（Cloudflare限制）
- 测试不同浏览器和设备

### Q: 如何更新网站？
A: 
1. 修改本地代码
2. 推送到GitHub main 分支
3. Cloudflare会自动重新部署

### Q: 如何查看部署日志？
A: 
1. 在Cloudflare Pages项目中
2. 点击 "Deployments" 标签
3. 查看每次部署的详细日志

## 项目结构说明

`
shenpower-website/
├── src/                    # React源代码
│   ├── components/         # 组件文件
│   ├── assets/             # 图片资源
│   └── index.css           # 全局样式
├── public/                 # 公共资源（视频、图片）
├── dist/                   # 编译后的文件（Cloudflare部署此文件夹）
├── package.json            # 项目依赖和脚本
├── vite.config.js          # Vite构建配置
└── index.html              # 主页入口
`

## 技术栈

- **前端框架**: React 19.2.7
- **构建工具**: Vite 8.1.1
- **样式**: CSS3 响应式设计
- **动画**: Canvas API
- **部署**: Cloudflare Pages + GitHub

## 联系支持

如果遇到问题：
1. 查看Cloudflare Pages文档：https://developers.cloudflare.com/pages/
2. 查看GitHub文档：https://docs.github.com/
3. 检查项目GitHub Issues
