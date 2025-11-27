# 文件分享系统

一个高效、安全的网页版文件分享工具，提供文件上传、下载、管理等功能。

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
├── backend/     # 后端服务
└── page_web/    # 前端页面
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

## 📋 环境要求

- **Node.js**: 14.0 或更高版本
- **npm**: 6.0 或更高版本
- **推荐**: Node.js 18+

## 🚀 使用指南

### 安装与启动

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 前台启动服务
node src/index.js --start

# 后台启动服务
node run.js --start --background

# 停止服务
node stop.js
```

## 📦 打包命令

```bash
# 进入后端目录
cd backend

# 构建部署包
npm run build-deploy-prod

# 打包后启动服务
cd dist/backend
node run.js --start
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

## 🛡️ 安全建议

1. 启用身份验证
2. 使用HTTPS (配置SSL证书)
3. 定期备份数据
4. 限制上传文件类型和大小
5. 定期更新依赖包

## 📄 许可证

MIT License