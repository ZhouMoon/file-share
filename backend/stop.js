#!/usr/bin/env node

// 停止服务器脚本
const fs = require('fs');
const path = require('path');

const pidFile = path.join(__dirname, 'server.pid');

console.log('🛑 File Share Backend 停止器');
console.log('=====================================');

if (!fs.existsSync(pidFile)) {
    console.log('❌ 未找到服务器进程ID文件');
    console.log('💡 服务器可能未在后台运行');
    process.exit(1);
}

try {
    const pid = fs.readFileSync(pidFile, 'utf8').trim();
    console.log(`🔍 找到服务器进程ID: ${pid}`);
    
    // 尝试停止进程
    try {
        process.kill(pid, 'SIGTERM');
        console.log('✅ 已发送停止信号');
        
        // 等待一下再检查
        setTimeout(() => {
            try {
                process.kill(pid, 0); // 检查进程是否还存在
                console.log('⚠️  进程仍在运行，强制停止...');
                process.kill(pid, 'SIGKILL');
            } catch (e) {
                // 进程已经停止
            }
            
            // 清理PID文件
            if (fs.existsSync(pidFile)) {
                fs.unlinkSync(pidFile);
                console.log('🧹 已清理PID文件');
            }
            
            console.log('✅ 服务器已停止');
        }, 2000);
        
    } catch (error) {
        if (error.code === 'ESRCH') {
            console.log('⚠️  进程不存在，可能已经停止');
        } else {
            console.error('❌ 停止进程失败:', error.message);
        }
        
        // 清理PID文件
        if (fs.existsSync(pidFile)) {
            fs.unlinkSync(pidFile);
            console.log('🧹 已清理PID文件');
        }
    }
    
} catch (error) {
    console.error('❌ 读取PID文件失败:', error.message);
    process.exit(1);
}
