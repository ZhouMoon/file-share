#!/usr/bin/env node

// 简单的功能测试脚本
const path = require('path');

// 测试模块导入
console.log('🧪 开始测试模块导入...');

try {
    const Setting = require('./src/utils/Setting');
    console.log('✅ Setting模块导入成功');
    
    const Server = require('./src/utils/Server');
    console.log('✅ Server模块导入成功');
    
    const FileDb = require('./src/utils/FileDb');
    console.log('✅ FileDb模块导入成功');
    
    const Database = require('./src/utils/Database');
    console.log('✅ Database模块导入成功');
    
    const EventDispatcher = require('./src/utils/EventDispatcher');
    console.log('✅ EventDispatcher模块导入成功');
    
    const IpUtil = require('./src/utils/IpUtil');
    console.log('✅ IpUtil模块导入成功');
    
    const FileUtil = require('./src/utils/FileUtil');
    console.log('✅ FileUtil模块导入成功');
    
    const ZipUtil = require('./src/utils/ZipUtil');
    console.log('✅ ZipUtil模块导入成功');
    
    const SseUtil = require('./src/utils/SseUtil');
    console.log('✅ SseUtil模块导入成功');
    
} catch (error) {
    console.error('❌ 模块导入失败:', error.message);
    process.exit(1);
}

// 测试基本功能
console.log('\n🔧 测试基本功能...');

try {
    const Setting = require('./src/utils/Setting');
    const IpUtil = require('./src/utils/IpUtil');
    const Database = require('./src/utils/Database');
    
    // 测试IP获取
    const ip = IpUtil.getIpAddress();
    console.log(`✅ IP地址获取成功: ${ip}`);
    
    // 测试配置获取
    const config = Setting.getSetting();
    console.log(`✅ 配置获取成功: 端口=${config.port}, IP=${config.ip}`);
    
    // 测试数据库存储
    Database.setStorageItem('test', 'test-value');
    const value = Database.getStorageItem('test');
    if (value === 'test-value') {
        console.log('✅ 数据库存储测试成功');
    } else {
        throw new Error('数据库存储测试失败');
    }
    
} catch (error) {
    console.error('❌ 基本功能测试失败:', error.message);
    process.exit(1);
}

// 测试文件路径
console.log('\n📁 测试文件路径...');

try {
    const pageWebPath = path.resolve(__dirname, '../page_web');
    const fs = require('fs');
    
    if (fs.existsSync(pageWebPath)) {
        console.log('✅ page_web目录存在');
        
        const indexPath = path.join(pageWebPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            console.log('✅ index.html文件存在');
        } else {
            console.log('⚠️  index.html文件不存在，请确保page_web目录包含前端文件');
        }
    } else {
        console.log('⚠️  page_web目录不存在，请确保前端文件在正确位置');
    }
    
} catch (error) {
    console.error('❌ 文件路径测试失败:', error.message);
}

console.log('\n🎉 测试完成！');
console.log('\n📋 启动说明:');
console.log('  1. 安装依赖: npm install');
console.log('  2. 启动服务: npm run start-server');
console.log('  3. 访问地址: http://localhost:5421');
console.log('  4. 自定义启动: node src/index.js --port 8080 --start');
