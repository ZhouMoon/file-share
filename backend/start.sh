#!/bin/bash

echo "File Share Backend - 启动脚本"
echo

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js"
    echo "安装方法: https://nodejs.org/"
    exit 1
fi

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "依赖安装失败"
        exit 1
    fi
fi

# 启动服务
echo "正在启动文件共享服务..."
node src/index.js --start
