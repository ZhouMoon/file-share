#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const Setting = require('./utils/Setting');
const Server = require('./utils/Server');
const FileDb = require('./utils/FileDb');
const EventDispatcher = require('./utils/EventDispatcher');
const IpUtil = require('./utils/IpUtil');

// 初始化配置
console.log('正在初始化配置...');
Setting.getSetting();

// 命令行参数处理
const args = process.argv.slice(2);
let autoStart = false;

// 检查是否有 --start 参数
if (args.includes('--start')) {
    autoStart = true;
}

// 检查是否有 --port 参数
const portIndex = args.indexOf('--port');
if (portIndex !== -1 && args[portIndex + 1]) {
    const port = parseInt(args[portIndex + 1]);
    if (!isNaN(port)) {
        Setting.updatePort(port).then(() => {
            console.log(`端口已设置为: ${port}`);
        }).catch(err => {
            console.error('设置端口失败:', err);
        });
    }
}

// 检查是否有 --upload-path 参数
const uploadPathIndex = args.indexOf('--upload-path');
if (uploadPathIndex !== -1 && args[uploadPathIndex + 1]) {
    const uploadPath = args[uploadPathIndex + 1];
    Setting.updateUploadPath(uploadPath).then(() => {
        console.log(`上传路径已设置为: ${uploadPath}`);
    }).catch(err => {
        console.error('设置上传路径失败:', err);
    });
}

// 检查是否有 --auth 参数
if (args.includes('--auth')) {
    const passwordIndex = args.indexOf('--password');
    if (passwordIndex !== -1 && args[passwordIndex + 1]) {
        const password = args[passwordIndex + 1];
        Setting.updatePassword(password).then(() => {
            console.log('认证已启用');
        });
        Setting.updateAuthEnable(true).then(() => {
            console.log('密码已设置');
        });
    }
}

// 显示帮助信息
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
File Share Backend - 独立文件共享服务

用法: node src/index.js [选项]

选项:
  --start                自动启动服务器
  --port <端口号>        设置服务器端口 (默认: 5421)
  --upload-path <路径>   设置文件上传路径
  --auth --password <密码> 启用认证并设置密码
  --help, -h             显示此帮助信息

示例:
  node src/index.js --start
  node src/index.js --port 8080 --start
  node src/index.js --auth --password mypassword --start
  node src/index.js --upload-path /path/to/uploads --start
`);
    process.exit(0);
}

// 启动服务器
function startService() {
    console.log('正在启动文件共享服务...');
    
    // 获取当前配置
    const config = Setting.getSetting();
    console.log('当前配置:');
    console.log(`  端口: ${config.port}`);
    console.log(`  IP: ${config.ip}`);
    console.log(`  上传路径: ${config.uploadPath}`);
    console.log(`  认证: ${config.authEnable ? '启用' : '禁用'}`);
    if (config.authEnable) {
        console.log(`  密码: ${config.password}`);
    }
    console.log(`  访问地址: ${config.url}`);
    
    // 启动服务器
    try {
        const result = Server.startServer();
        if (result.success) {
            console.log('✅ 服务器启动成功!');
            console.log(`🌐 访问地址: ${result.url}`);
            console.log('📁 文件管理界面已就绪');
            
            // 注册事件监听器
            EventDispatcher.registryEventListener('server.statusChange', (event) => {
                console.log(`服务器状态变更: ${event.data.status}`);
            });
            
            EventDispatcher.registryEventListener('fileDb.listChange', (event) => {
                console.log('文件列表已更新');
            });
            
        } else {
            console.error('❌ 服务器启动失败:', result.message);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ 服务器启动失败:', error.message);
        process.exit(1);
    }
}

// 处理进程退出
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    Server.stopServer();
    console.log('服务器已关闭');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n正在关闭服务器...');
    Server.stopServer();
    console.log('服务器已关闭');
    process.exit(0);
});

// 错误处理
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    Server.stopServer();
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
    Server.stopServer();
    process.exit(1);
});

// 如果设置了自动启动，则启动服务
if (autoStart || Setting.getAutoStart()) {
    startService();
} else {
    console.log('File Share Backend 已就绪');
    console.log('使用 --start 参数启动服务器，或使用 --help 查看所有选项');
    console.log('示例: node src/index.js --start');
}
