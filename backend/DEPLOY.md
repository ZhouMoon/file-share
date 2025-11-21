# File Share 部署指南

## 部署方式

我们提供了多种部署方式，您可以根据服务器环境和需求选择最适合的方案。

### 1. Docker 部署 (推荐)

这是最简单、最快速的部署方式，适合大多数场景。

#### 快速部署

```bash
# 1. 克隆或下载项目代码
git clone <项目地址>
cd file-share/backend

# 2. 构建Docker部署包
npm run build-deploy-docker-prod

# 3. 进入部署目录
cd dist

# 4. 启动服务
docker-compose up -d

# 5. 查看服务状态
docker-compose ps
```

#### 自定义配置

1. 修改 `docker-compose.yml` 中的端口映射和卷映射
2. 在 `config` 目录下创建 `storage.json` 配置文件
3. 重启容器使配置生效

### 2. 传统服务器部署

适用于没有Docker环境的服务器。

#### 自动部署 (Linux)

```bash
# 1. 构建部署包
npm run build-deploy-prod

# 2. 将部署包上传到服务器
scp dist/file-share-package.tar.gz user@server:/tmp/

# 3. 在服务器上执行部署
ssh user@server
cd /tmp
tar -xzf file-share-package.tar.gz
chmod +x deploy.sh
sudo ./deploy.sh
```

#### 手动部署

1. **准备环境**
   ```bash
   # 安装Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # 验证安装
   node -v
   npm -v
   ```

2. **部署应用**
   ```bash
   # 创建应用目录
   sudo mkdir -p /opt/file-share
   sudo chown $USER:$USER /opt/file-share
   
   # 解压部署包
   tar -xzf file-share-package.tar.gz -C /opt/file-share --strip-components=1
   
   # 安装依赖
   cd /opt/file-share
   npm ci --only=production
   
   # 创建上传目录
   mkdir -p uploads
   ```

3. **启动服务**
   ```bash
   # 前台启动
   npm start
   
   # 后台启动
   nohup npm start > /dev/null 2>&1 &
   
   # 使用PM2管理进程
   pm2 start ecosystem.config.js
   ```

4. **配置系统服务 (可选)**
   ```bash
   # 创建systemd服务文件
   sudo nano /etc/systemd/system/file-share.service
   
   # 服务内容参考 deploy.sh 中的 create_service 函数
   
   # 启用并启动服务
   sudo systemctl enable file-share
   sudo systemctl start file-share
   ```

### 3. Windows 服务器部署

1. **安装Node.js**
   - 从 [Node.js官网](https://nodejs.org/) 下载并安装LTS版本

2. **部署应用**
   ```cmd
   # 解压部署包到目标目录
   # 例如: C:\file-share
   
   # 进入目录
   cd C:\file-share
   
   # 安装依赖
   npm ci --only=production
   
   # 启动服务
   npm start
   ```

3. **安装为Windows服务 (可选)**
   - 使用 [node-windows](https://www.npmjs.com/package/node-windows) 或 [PM2](https://www.npmjs.com/package/pm2) 将应用安装为Windows服务

## 配置说明

### 基本配置

配置文件位置:
- Linux/Mac: `~/.file-share-backend/storage.json`
- Windows: `%USERPROFILE%\.file-share-backend\storage.json`

配置示例:
```json
{
  "port": 5421,
  "uploadPath": "~/Downloads",
  "authEnable": false,
  "password": "",
  "tusEnable": false,
  "chunkSize": 20,
  "autoStart": true
}
```

### 环境变量

- `NODE_ENV`: 运行环境 (production/development)
- `PORT`: 服务端口 (默认: 5421)

## 常见问题

### 1. 端口被占用

修改配置文件中的端口号，或者停止占用端口的服务。

### 2. 权限问题

确保应用有足够的权限访问上传目录和配置文件。

### 3. 防火墙设置

确保服务器防火墙开放了5421端口。

### 4. 性能优化

- 使用Nginx作为反向代理
- 启用文件压缩
- 配置适当的缓存策略

## 监控与维护

### 查看日志

```bash
# Docker部署
docker-compose logs -f file-share

# 系统服务
journalctl -u file-share -f

# PM2管理
pm2 logs file-share
```

### 更新应用

```bash
# 停止服务
systemctl stop file-share

# 备份配置
cp ~/.file-share-backend/storage.json /tmp/

# 更新代码
cd /opt/file-share
git pull origin main

# 安装新依赖
npm ci --only=production

# 恢复配置
cp /tmp/storage.json ~/.file-share-backend/

# 启动服务
systemctl start file-share
```

## 安全建议

1. 启用身份验证
2. 使用HTTPS (配置SSL证书)
3. 定期备份数据
4. 限制上传文件类型和大小
5. 定期更新依赖包

## 技术支持

如果遇到问题，请:
1. 查看日志文件
2. 检查配置文件
3. 确认系统环境
4. 提交Issue到项目仓库