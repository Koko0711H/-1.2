@echo off
echo ========================================
echo   深柴动力网站 - GitHub部署脚本
echo ========================================
echo.

echo 1. 检查项目文件...
if not exist "package.json" (
    echo ? 错误：package.json不存在！
    pause
    exit /b 1
)

if not exist "src" (
    echo ? 错误：src文件夹不存在！
    pause
    exit /b 1
)

if not exist "public" (
    echo ? 错误：public文件夹不存在！
    pause
    exit /b 1
)

echo ? 项目文件检查通过

echo.
echo 2. 显示项目结构...
dir /b
echo.

echo 3. GitHub部署步骤...
echo.
echo ========================================
echo   步骤1：创建GitHub仓库
echo ========================================
echo 1. 访问 https://github.com/
echo 2. 点击 "+" → "New repository"
echo 3. 仓库名称：shenpower-website
echo 4. 点击 "Create repository"
echo.
echo ========================================
echo   步骤2：上传项目文件
echo ========================================
echo 1. 在仓库页面点击 "Add file" → "Upload files"
echo 2. 将以下文件/文件夹拖拽到上传区域：
echo    ├── src/
echo    ├── public/
echo    ├── package.json
echo    ├── vite.config.js
echo    ├── index.html
echo    ├── README.md
echo    └── .gitignore
echo 3. 点击 "Commit changes"
echo.
echo ========================================
echo   步骤3：连接Cloudflare Pages
echo ========================================
echo 1. 访问 https://dash.cloudflare.com/
echo 2. 进入 "Pages" → "Create a project"
echo 3. 选择 "Connect to Git"
echo 4. 选择 "GitHub"
echo 5. 选择 shenpower-website 仓库
echo 6. 配置构建设置：
echo    - Build command: npm run build
echo    - Build output directory: dist
echo 7. 点击 "Save and Deploy"
echo.
echo ========================================
echo   完成！
echo ========================================
echo 部署完成后，你将获得一个 *.pages.dev 域名
echo.
pause
