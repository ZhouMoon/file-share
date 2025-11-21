# 使用Node.js官方镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 创建上传目录并设置权限
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads

# 切换到非root用户
USER nodejs

# 暴露端口
EXPOSE 5421

# 设置环境变量
ENV NODE_ENV=production

# 启动命令
CMD ["node", "src/index.js", "--start"]