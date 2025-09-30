#!/usr/bin/env node

// 启动脚本 - 提供便捷的启动方式
const { spawn } = require('child_process');
const path = require('path');

// 默认启动参数
const defaultArgs = ['--start'];

// 获取命令行参数
const args = process.argv.slice(2);

// 如果没有提供参数，使用默认参数
const finalArgs = args.length > 0 ? args : defaultArgs;

// 启动服务器
const serverPath = path.join(__dirname, 'src', 'index.js');
const child = spawn('node', [serverPath, ...finalArgs], {
    stdio: 'inherit',
    cwd: __dirname
});

// 处理进程退出
child.on('exit', (code) => {
    if (code === 0) {
        console.log('服务器正常退出');
    } else {
        console.log(`服务器异常退出，退出码: ${code}`);
    }
    process.exit(code);
});

child.on('error', (error) => {
    console.error('启动失败:', error);
    process.exit(1);
});

// 处理Ctrl+C信号
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    child.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\n正在关闭服务器...');
    child.kill('SIGTERM');
});
