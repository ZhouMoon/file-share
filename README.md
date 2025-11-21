# 文件分享系统

一个高效、安全的文件分享工具，支持网页端和桌面端，提供文件上传、下载、管理等功能。

## 📋 功能特点

### 核心功能
- 🌐 **局域网文件共享**：快速在局域网内分享文件
- 📤 **文件上传**：支持单个或批量文件拖放上传
- 📥 **文件下载**：直接从浏览器下载共享文件
- 📋 **文件管理**：查看、删除已上传的文件
- 📝 **文本消息分享**：支持纯文本内容分享
- 📦 **目录压缩下载**：支持整个目录打包下载
- 🎯 **实时事件推送**：使用SSE实现实时文件状态更新

### 系统特性
- 🚀 **高性能传输**：高效的文件传输机制，支持大文件
- 🔒 **可选密码认证**：增强安全性
- 📱 **响应式设计**：支持桌面和移动设备访问
- 🔧 **灵活配置选项**：端口、上传路径等均可自定义
- 💻 **后台运行**：支持服务在后台稳定运行

## 📁 项目结构

```
├── backend/              # 完整版后端服务
├── file-share-web-only/  # 独立网页版本（精简版）
│   ├── backend/          # 精简版后端
│   └── page_web/         # 精简版前端
└── page_web/             # 完整版前端
```

## 🛠 技术栈

### 后端
- Node.js
- Express
- Multer (文件上传)
- SSE (Server-Sent Events)

### 前端
- Vue 3
- Element Plus
- Axios
- Vite

## 📋 环境要求

- **Node.js**: 14.0 或更高版本
- **npm**: 6.0 或更高版本
- **推荐**: Node.js 18+

## 🚀 使用指南

### 独立网页版本（推荐）

```bash
# 进入目录
cd file-share-web-only/backend

# 安装依赖
npm install

# 前台启动服务
npm start

# 后台启动服务
npm run start-bg

# 停止后台服务
npm run stop
```

### 完整版项目

```bash
# 进入目录
cd backend

# 安装依赖
npm install

# 前台启动服务
npm start

# 后台启动服务
npm run run-bg

# 后台启动（跳过前端构建）
npm run run-bg-no-build

# 停止后台服务
npm run stop
```

## 📦 打包命令

### 独立网页版本打包

```bash
# 进入目录
cd file-share-web-only/backend

# 构建部署包
npm run build-deploy-prod

# 打包后启动服务
cd dist/backend
node run.js --start
# 或后台运行
node run.js --start --background
```

### 完整版项目打包

```bash
# 进入目录
cd backend

# 传统服务器部署
npm run build-deploy-prod
# 部署包位于 dist/file-share-package.tar.gz
```

## ⚙️ 配置说明

### 配置文件位置
- **Linux/Mac**: `~/.file-share-backend/storage.json`
- **Windows**: `%USERPROFILE%\.file-share-backend\storage.json`

### 配置示例
```json
{
  "port": 5421,
  "uploadPath": "~/Downloads",
  "authEnable": false,
  "password": "",
  "autoStart": true
}
```

### 命令行参数
- `--start`: 自动启动服务器
- `--port <端口号>`: 设置服务器端口 (默认: 5421)
- `--upload-path <路径>`: 设置文件上传路径
- `--auth --password <密码>`: 启用认证并设置密码
- `--background`, `-b`: 后台运行模式

## 🔧 开发说明

### 前端开发

```bash
# 完整版前端
cd page_web
npm install
npm run dev

# 精简版前端
cd file-share-web-only/page_web
npm install
npm run dev
```

### 后端开发

```bash
# 完整版后端
cd backend
npm install
npm run dev

# 精简版后端
cd file-share-web-only/backend
npm install
npm run dev
```

## 🌐 部署指南

### 传统服务器部署

1. **构建部署包**
```bash
cd backend  # 或 cd file-share-web-only/backend
npm run build-deploy-prod
```

2. **服务器配置**
```bash
# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 部署应用
sudo mkdir -p /opt/file-share
sudo chown $USER:$USER /opt/file-share
tar -xzf file-share-package.tar.gz -C /opt/file-share --strip-components=1
cd /opt/file-share
npm ci --only=production

# 创建上传目录
mkdir -p uploads

# 启动服务
# 前台: npm start
# 后台: nohup npm start > /dev/null 2>&1 &
# 使用PM2: pm2 start ecosystem.config.js
```

## 🛡️ 安全建议

1. 启用身份验证
2. 使用HTTPS (配置SSL证书)
3. 定期备份数据
4. 限制上传文件类型和大小
5. 定期更新依赖包

## 📄 许可证

MIT License