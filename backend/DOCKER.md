# Docker 部署指南

## 快速部署

### 使用 Docker Compose (推荐)

1. 创建必要的目录
```bash
mkdir -p uploads config
```

2. 启动服务
```bash
docker-compose up -d
```

3. 查看日志
```bash
docker-compose logs -f file-share
```

4. 停止服务
```bash
docker-compose down
```

### 使用 Docker 命令

1. 构建镜像
```bash
docker build -t file-share .
```

2. 运行容器
```bash
docker run -d \
  --name file-share \
  -p 5421:5421 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/config:/root/.file-share-backend \
  --restart unless-stopped \
  file-share
```

## 配置说明

### 环境变量

- `NODE_ENV`: 运行环境 (production/development)
- `PORT`: 服务端口 (默认: 5421)

### 数据卷

- `uploads`: 文件上传目录
- `config`: 配置文件目录 (存储在 ~/.file-share-backend)

### 自定义配置

1. 在 `config` 目录下创建 `storage.json` 文件
2. 配置示例:
```json
{
  "port": 5421,
  "uploadPath": "/app/uploads",
  "authEnable": false,
  "password": "",
  "tusEnable": false,
  "chunkSize": 20,
  "autoStart": true
}
```

## 访问服务

启动后，在浏览器中访问: http://服务器IP:5421

## 注意事项

1. 确保服务器防火墙开放了5421端口
2. 挂载的数据卷需要有足够的磁盘空间
3. 生产环境建议启用认证功能
4. 如果需要修改配置，请重启容器使配置生效