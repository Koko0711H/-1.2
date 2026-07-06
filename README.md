# 深柴动力官方网站

一个现代化的企业网站，使用React和Vite构建，具有响应式设计和丰富的动画效果。

## 功能特点

### ?? 现代化设计
- 深色主题设计，专业大气
- 响应式布局，适配所有设备
- 平滑的动画效果和过渡

### ?? 首页视频轮播
- 高清视频背景
- 自动播放和循环
- 视频播放完自动切换到聚光灯效果

### ?? 聚光灯效果
- 鼠标追踪的圆形聚光灯
- 动态能量管道特效
- 流畅的粒子动画

### ?? 移动端适配
- 完全响应式设计
- 触摸友好的交互
- 优化的移动端性能

### ?? 产品展示
- 四种产品类型展示
- 详细的展开介绍
- 中英文双语支持

### ?? 多语言支持
- 中文/英文切换
- 完整的国际化
- 本地化内容

### ?? 联系方式
- 浮动联系按钮
- 在线留言表单
- 社交媒体链接

## 技术栈

- **前端框架**: React 19.2.7
- **构建工具**: Vite 8.1.1
- **样式**: CSS3 响应式设计
- **动画**: Canvas API
- **部署**: Cloudflare Pages

## 项目结构

`
shenpower-website/
├── src/                    # 源代码
│   ├── components/         # React组件
│   ├── assets/             # 图片资源
│   └── index.css           # 全局样式
├── public/                 # 公共资源
├── dist/                   # 编译后的文件
├── package.json            # 项目配置
└── vite.config.js          # Vite配置
`

## 快速开始

### 1. 安装依赖
`ash
npm install
`

### 2. 启动开发服务器
`ash
npm run dev
`

### 3. 构建生产版本
`ash
npm run build
`

### 4. 预览生产版本
`ash
npm run preview
`

## 部署到Cloudflare

### 方法1：直接上传dist文件夹
1. 运行 
pm run build
2. 登录Cloudflare Pages
3. 上传整个 dist 文件夹

### 方法2：通过GitHub自动部署
1. 将代码推送到GitHub
2. 在Cloudflare Pages连接GitHub仓库
3. 配置构建设置：
   - Build command: 
pm run build
   - Build output directory: dist

详细步骤请参考 [GITHUB_CLOUDFLARE_GUIDE.md](./GITHUB_CLOUDFLARE_GUIDE.md)

## 主要功能模块

1. **Header** - 导航栏和语言切换
2. **Hero** - 首页视频/聚光灯轮播
3. **Products** - 产品中心展示
4. **Industry** - 聚焦行业案例
5. **About** - 关于我们
6. **Cases** - 项目案例
7. **Contact** - 联系我们
8. **Footer** - 页脚信息

## 自定义配置

### 修改公司信息
编辑 src/i18n.jsx 文件中的翻译内容

### 修改颜色主题
编辑 src/index.css 文件中的CSS变量

### 添加新产品
1. 在 src/i18n.jsx 中添加翻译
2. 在 src/components/Products.jsx 中添加组件

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 许可证

MIT License

## 联系方式

- 公司名称: 深柴动力
- 电话: 18205938836
- 地址: 福建省福州市仓山智能产业园C区1006
- 邮箱: info@shenpower.com

## 更新日志

### v1.0.0 (2026-07-06)
- 初始版本发布
- 完整的响应式设计
- 视频轮播和聚光灯效果
- 产品展示和项目案例
- 中英文双语支持
- Cloudflare部署配置


## 📱 手机端优化已完成！

### 优化内容
1. **首页视频** - 完整显示，高度调整为50vh
2. **产品中心** - 视频在上，文字在下；展开详情也是图片在上文字在下
3. **"为什么选择我们"** - 四个卡片改为两两上下排列
4. **"关于深柴电力"** - 四个模块两两上下排列
5. **联系我们和在线留言** - 改为上下排列，不再拥挤
6. **聚焦行业和项目案例** - 保持横向滚动，间距调整
7. **页脚和浮动按钮** - 适配手机屏幕

### 关键特点
- ✅ 所有修改只影响手机端（屏幕宽度≤768px）
- ✅ 电脑端显示完全不变
- ✅ 保持视觉效果，不会因为调整而影响美观

### 测试方法
1. 用手机打开网站查看效果
2. 检查各个模块的排版是否符合要求
3. 确保电脑端显示正常

### 文件更新
- src/mobile-optimized.css - 手机端专项优化样式
- src/index.css - 已引入手机端优化样式
- src/components/ - 所有组件已同步更新

### 部署步骤
如果需要重新部署到Cloudflare：
1. 运行 
pm run build 重新构建
2. 将 dist 文件夹内容上传到Cloudflare Pages
3. 或通过GitHub自动部署

### 注意事项
- 手机端优化已应用到所有主要模块
- 确保在不同手机设备上测试（iPhone、Android等）
- 如有需要，可以进一步微调特定模块的样式

