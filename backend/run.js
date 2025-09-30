#!/usr/bin/env node

// 后台运行脚本
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 获取命令行参数
const args = process.argv.slice(2);

// 检查是否是后台运行模式
const isBackground = args.includes('--background') || args.includes('-b');

// 移除后台运行参数
const cleanArgs = args.filter(arg => arg !== '--background' && arg !== '-b');

// 默认参数
const defaultArgs = ['--start'];

// 最终参数
const finalArgs = cleanArgs.length > 0 ? cleanArgs : defaultArgs;

console.log('🚀 File Share Backend 启动器');
console.log('=====================================');

if (isBackground) {
    console.log('🔄 后台模式启动...');
    
    // 后台运行
    const serverPath = path.join(__dirname, 'src', 'index.js');
    const child = spawn('node', [serverPath, ...finalArgs], {
        detached: true,
        stdio: 'ignore',
        cwd: __dirname
    });
    
    child.unref();
    
    console.log(`✅ 服务器已在后台启动 (PID: ${child.pid})`);
    console.log('📝 日志文件: logs/server.log');
    console.log('🛑 停止服务: node stop.js');
    
    // 创建日志目录
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // 保存PID
    fs.writeFileSync(path.join(__dirname, 'server.pid'), child.pid.toString());
    
} else {
    console.log('🖥️  前台模式启动...');
    console.log('💡 提示: 使用 Ctrl+C 停止服务');
    console.log('💡 后台运行: node run.js --background');
    console.log('=====================================\n');
    
    // 前台运行
    const serverPath = path.join(__dirname, 'src', 'index.js');
    const child = spawn('node', [serverPath, ...finalArgs], {
        stdio: 'inherit',
        cwd: __dirname
    });
    
    // 处理进程退出
    child.on('exit', (code) => {
        if (code === 0) {
            console.log('\n✅ 服务器正常退出');
        } else {
            console.log(`\n❌ 服务器异常退出，退出码: ${code}`);
        }
        process.exit(code);
    });
    
    child.on('error', (error) => {
        console.error('❌ 启动失败:', error);
        process.exit(1);
    });
    
    // 处理Ctrl+C信号
    process.on('SIGINT', () => {
        console.log('\n🛑 正在关闭服务器...');
        child.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 正在关闭服务器...');
        child.kill('SIGTERM');
    });
}
