#!/bin/bash

# File Share 服务器部署脚本
# 适用于 Linux 服务器

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "请使用 root 权限运行此脚本"
        exit 1
    fi
}

# 检查系统
check_system() {
    print_info "检查系统环境..."
    
    # 检查操作系统
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        print_error "无法检测操作系统版本"
        exit 1
    fi
    
    print_info "操作系统: $OS $VER"
    
    # 检查Node.js是否已安装
    if ! command -v node &> /dev/null; then
        print_warn "Node.js 未安装，将尝试安装..."
        install_nodejs
    else
        NODE_VERSION=$(node -v | cut -d'v' -f2)
        print_info "Node.js 版本: $NODE_VERSION"
    fi
    
    # 检查npm是否已安装
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装"
        exit 1
    fi
}

# 安装Node.js
install_nodejs() {
    print_info "安装 Node.js..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt-get update
        apt-get install -y curl
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        yum install -y curl
        curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
        yum install -y nodejs
    else
        print_error "不支持的操作系统，请手动安装 Node.js"
        exit 1
    fi
    
    print_info "Node.js 安装完成"
}

# 创建用户和目录
setup_user_and_dirs() {
    print_info "设置用户和目录..."
    
    # 创建file-share用户
    if ! id -u file-share &> /dev/null; then
        useradd -r -s /bin/false file-share
        print_info "创建用户: file-share"
    fi
    
    # 创建应用目录
    APP_DIR="/opt/file-share"
    mkdir -p $APP_DIR
    
    # 创建上传目录
    UPLOAD_DIR="/opt/file-share/uploads"
    mkdir -p $UPLOAD_DIR
    
    # 创建日志目录
    LOG_DIR="/var/log/file-share"
    mkdir -p $LOG_DIR
    
    # 设置权限
    chown -R file-share:file-share $APP_DIR
    chown -R file-share:file-share $UPLOAD_DIR
    chown -R file-share:file-share $LOG_DIR
    
    print_info "目录设置完成"
}

# 部署应用
deploy_app() {
    print_info "部署应用..."
    
    # 解压部署包
    if [ -f "file-share-package.tar.gz" ]; then
        tar -xzf file-share-package.tar.gz -C $APP_DIR --strip-components=1
        print_info "解压部署包到 $APP_DIR"
    else
        print_error "找不到部署包 file-share-package.tar.gz"
        exit 1
    fi
    
    # 安装依赖
    cd $APP_DIR
    sudo -u file-share npm ci --only=production
    
    print_info "应用部署完成"
}

# 创建systemd服务
create_service() {
    print_info "创建系统服务..."
    
    cat > /etc/systemd/system/file-share.service << EOF
[Unit]
Description=File Share Service
After=network.target

[Service]
Type=simple
User=file-share
WorkingDirectory=/opt/file-share
ExecStart=/usr/bin/node src/index.js --start
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=file-share
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
    
    # 重新加载systemd
    systemctl daemon-reload
    
    # 启用服务
    systemctl enable file-share
    
    print_info "系统服务创建完成"
}

# 配置防火墙
setup_firewall() {
    print_info "配置防火墙..."
    
    # 检查防火墙状态
    if command -v ufw &> /dev/null; then
        # Ubuntu/Debian
        ufw allow 5421/tcp
        print_info "已开放端口 5421 (ufw)"
    elif command -v firewall-cmd &> /dev/null; then
        # CentOS/RHEL
        firewall-cmd --permanent --add-port=5421/tcp
        firewall-cmd --reload
        print_info "已开放端口 5421 (firewalld)"
    else
        print_warn "无法自动配置防火墙，请手动开放端口 5421"
    fi
}

# 启动服务
start_service() {
    print_info "启动服务..."
    
    systemctl start file-share
    
    # 检查服务状态
    if systemctl is-active --quiet file-share; then
        print_info "服务启动成功!"
    else
        print_error "服务启动失败"
        journalctl -u file-share --no-pager -l
        exit 1
    fi
}

# 显示完成信息
show_completion_info() {
    IP=$(hostname -I | awk '{print $1}')
    
    echo ""
    echo "========================================"
    echo "🎉 File Share 部署完成!"
    echo "========================================"
    echo "服务地址: http://$IP:5421"
    echo ""
    echo "常用命令:"
    echo "  查看状态: systemctl status file-share"
    echo "  重启服务: systemctl restart file-share"
    echo "  停止服务: systemctl stop file-share"
    echo "  查看日志: journalctl -u file-share -f"
    echo ""
    echo "配置文件位置: /home/file-share/.file-share-backend/storage.json"
    echo "上传目录: /opt/file-share/uploads"
    echo "========================================"
}

# 主函数
main() {
    print_info "开始部署 File Share 服务..."
    
    check_root
    check_system
    setup_user_and_dirs
    deploy_app
    create_service
    setup_firewall
    start_service
    show_completion_info
    
    print_info "部署完成!"
}

# 执行主函数
main "$@"