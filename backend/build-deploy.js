#!/usr/bin/env node

const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const os = require('os');

// 获取命令行参数
const args = process.argv.slice(2);
const isProduction = args.includes('--production') || args.includes('-p');
const isDocker = args.includes('--docker') || args.includes('-d');
const targetDir = args.find(arg => arg.startsWith('--target='))?.split('=')[1] || './dist';

console.log('🚀 File Share 打包部署工具');
console.log('=====================================');

// 创建打包目录
const packageDir = path.resolve(targetDir);
const backendDir = path.join(packageDir, 'backend');
const frontendDir = path.join(backendDir, 'electron', 'dist', 'page_web');

console.log(`📦 打包目录: ${packageDir}`);

// 清理并创建目录
if (fs.existsSync(packageDir)) {
    console.log('🗑️  清理旧打包目录...');
    fs.rmSync(packageDir, { recursive: true, force: true });
}

fs.mkdirSync(packageDir, { recursive: true });
fs.mkdirSync(backendDir, { recursive: true });

try {
    // 如果是Docker打包，则只准备Docker相关文件
    if (isDocker) {
        console.log('\n🐳 准备Docker部署文件...');
        
        // 复制Dockerfile和docker-compose.yml
        const dockerFiles = ['Dockerfile', 'docker-compose.yml', 'DOCKER.md'];
        dockerFiles.forEach(file => {
            const srcPath = path.join(__dirname, file);
            const destPath = path.join(packageDir, file);
            if (fs.existsSync(srcPath)) {
                fs.copyFileSync(srcPath, destPath);
                console.log(`  ✓ 复制: ${file}`);
            }
        });
        
        // 创建Docker部署说明
        const dockerReadme = `# File Share Docker 部署包

## 快速开始

1. 确保已安装 Docker 和 Docker Compose
2. 运行以下命令启动服务:

\`\`\`bash
docker-compose up -d
\`\`\`

3. 访问 http://服务器IP:5421

## 更多信息

请查看 DOCKER.md 文件获取详细部署指南
`;
        
        fs.writeFileSync(path.join(packageDir, 'README.md'), dockerReadme);
        
        console.log('\n✅ Docker部署包准备完成!');
        console.log(`📁 部署包目录: ${packageDir}`);
        console.log('📖 请查看 README.md 和 DOCKER.md 了解部署说明');
        
        if (isProduction) {
            console.log('\n🗜️  创建压缩包...');
            const archive = archiver('zip', { zlib: { level: 9 } });
            const output = fs.createWriteStream(path.join(packageDir, '..', 'file-share-docker.zip'));
            
            output.on('close', () => {
                console.log(`✅ 压缩包已创建: ${path.join(packageDir, '..', 'file-share-docker.zip')} (${archive.pointer()} bytes)`);
            });
            
            archive.on('error', (err) => {
                throw err;
            });
            
            archive.pipe(output);
            archive.directory(packageDir, false);
            archive.finalize();
        }
        
        return;
    }
    
    // 1. 构建前端项目
    console.log('\n🔨 构建前端项目...');
    const pageWebPath = path.join(__dirname, '..', 'page_web');
    
    // 检查依赖
    const nodeModulesPath = path.join(pageWebPath, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        console.log('📦 安装前端依赖...');
        execSync('npm install', { cwd: pageWebPath, stdio: 'inherit' });
    }
    
    // 构建前端
    console.log('🏗️  执行前端构建...');
    execSync('npm run build:desktop', { cwd: pageWebPath, stdio: 'inherit' });
    
    // 2. 复制后端文件
    console.log('\n📋 复制后端文件...');
    const sourceBackendPath = path.join(__dirname, '..');
    
    // 创建必要的目录结构
    fs.mkdirSync(path.join(backendDir, 'src', 'utils'), { recursive: true });
    fs.mkdirSync(path.join(backendDir, 'electron', 'dist', 'page_web'), { recursive: true });
    
    // 复制后端核心文件
    const backendFilesToCopy = [
        'package.json',
        'package-lock.json',
        'src/index.js',
        'run.js',
        'start.js',
        'stop.js'
    ];
    
    backendFilesToCopy.forEach(file => {
        const srcPath = path.join(__dirname, file);
        const destPath = path.join(backendDir, file);
        // 确保目标目录存在
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`  ✓ 复制: ${file}`);
        } else {
            console.warn(`  ⚠️  未找到: ${srcPath}`);
        }
    });
    
    // 复制工具类
    const utilsDir = path.join(__dirname, 'src', 'utils');
    const destUtilsDir = path.join(backendDir, 'src', 'utils');
    fs.readdirSync(utilsDir).forEach(file => {
        const srcPath = path.join(utilsDir, file);
        const destPath = path.join(destUtilsDir, file);
        if (fs.statSync(srcPath).isFile()) {
            fs.copyFileSync(srcPath, destPath);
        }
    });
    
    // 复制 open-file-explorer 目录及其所有子目录和文件
    const explorerDir = path.join(utilsDir, 'open-file-explorer');
    const destExplorerDir = path.join(destUtilsDir, 'open-file-explorer');
    if (fs.existsSync(explorerDir)) {
        console.log(`  📂 复制 open-file-explorer 目录...`);
        
        // 递归复制目录函数
        const copyDirectory = (src, dest) => {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }
            
            fs.readdirSync(src).forEach(item => {
                const srcPath = path.join(src, item);
                const destPath = path.join(dest, item);
                
                try {
                    if (fs.statSync(srcPath).isDirectory()) {
                        // 如果是目录，递归复制
                        copyDirectory(srcPath, destPath);
                    } else {
                        // 如果是文件，直接复制
                        fs.copyFileSync(srcPath, destPath);
                        // console.log(`    ✓ 复制: ${path.relative(explorerDir, srcPath)}`);
                    }
                } catch (error) {
                    console.warn(`    ⚠️  复制失败: ${srcPath}`, error.message);
                }
            });
        };
        
        // 执行递归复制
        copyDirectory(explorerDir, destExplorerDir);
        console.log(`  ✓ open-file-explorer 目录复制完成`);
    } else {
        console.warn(`  ⚠️  未找到 open-file-explorer 目录: ${explorerDir}`);
    }
    
    // 复制前端构建结果
    const sourceFrontendPath = path.join(sourceBackendPath, 'electron', 'dist', 'page_web');
    
    // 检查前端构建目录是否存在，如果不存在则尝试直接复制page_web目录
    let actualFrontendPath = sourceFrontendPath;
    if (!fs.existsSync(sourceFrontendPath)) {
        console.warn(`  ⚠️  未找到构建后的前端目录: ${sourceFrontendPath}`);
        // 尝试直接复制page_web的dist目录
        const alternativeFrontendPath = path.join(sourceBackendPath, 'page_web', 'dist');
        if (fs.existsSync(alternativeFrontendPath)) {
            console.log(`  🔄 使用替代前端目录: ${alternativeFrontendPath}`);
            actualFrontendPath = alternativeFrontendPath;
        }
    }
    
    if (fs.existsSync(actualFrontendPath)) {
        console.log(`  📂 从 ${actualFrontendPath} 复制前端文件`);
        const copyFrontend = (srcDir, destDir) => {
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }
            
            fs.readdirSync(srcDir).forEach(file => {
                const srcPath = path.join(srcDir, file);
                const destPath = path.join(destDir, file);
                
                try {
                    if (fs.statSync(srcPath).isDirectory()) {
                        copyFrontend(srcPath, destPath);
                    } else {
                        fs.copyFileSync(srcPath, destPath);
                    }
                } catch (error) {
                    console.warn(`  ⚠️  复制文件失败: ${srcPath}`, error.message);
                }
            });
        };
        
        copyFrontend(actualFrontendPath, frontendDir);
        console.log('  ✓ 复制前端构建文件完成');
    } else {
        console.warn('  ⚠️  无法找到前端构建文件，将跳过前端文件复制');
        // 创建空的前端目录以避免运行时错误
        fs.mkdirSync(frontendDir, { recursive: true });
    }
    
    // 3. 创建配置文件
    console.log('\n⚙️  创建配置文件...');
    const configPath = path.join(backendDir, 'config.json');
    const defaultConfig = {
        port: 5421,
        uploadPath: "~/Downloads",
        authEnable: false,
        password: "",
        tusEnable: false,
        chunkSize: 20,
        autoStart: true,
        comment: "这是部署配置文件，根据需要修改"
    };
    
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log('  ✓ 创建配置文件');
    
    // 4. 创建部署脚本
    console.log('\n📜 创建部署脚本...');
    
    // Linux/Mac 启动脚本
    const startShScript = `#!/bin/bash
# File Share 部署启动脚本

echo "🚀 启动 File Share 服务..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动服务
echo "🌐 启动服务..."
node run.js --start

echo "✅ 服务已启动"
`;
    
    fs.writeFileSync(path.join(backendDir, 'start.sh'), startShScript);
    fs.chmodSync(path.join(backendDir, 'start.sh'), '755');
    
    // Windows 启动脚本
    const startBatScript = `@echo off
REM File Share 部署启动脚本

echo 🚀 启动 File Share 服务...

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

REM 安装依赖
if not exist "node_modules" (
    echo 📦 安装依赖...
    npm install
)

REM 启动服务
echo 🌐 启动服务...
node run.js --start

echo ✅ 服务已启动
pause
`;
    
    fs.writeFileSync(path.join(backendDir, 'start.bat'), startBatScript);
    
    // 5. 创建部署说明文档
    console.log('\n📄 创建部署说明文档...');
    const readmeContent = `# File Share 部署说明

## 快速启动

### Linux/Mac
\`\`\`bash
chmod +x start.sh
./start.sh
\`\`\`

### Windows
\`\`\`cmd
start.bat
\`\`\`

## 手动启动

1. 安装依赖
\`\`\`bash
npm install
\`\`\`

2. 启动服务
\`\`\`bash
node run.js --start
\`\`\`

## 配置说明

配置文件位于 \`config.json\`，可以修改以下配置：

- \`port\`: 服务端口 (默认: 5421)
- \`uploadPath\`: 文件上传路径 (默认: ~/Downloads)
- \`authEnable\`: 是否启用认证 (默认: false)
- \`password\`: 认证密码
- \`autoStart\`: 是否自动启动服务 (默认: true)

## 访问服务

启动后，在浏览器中访问: http://服务器IP:5421

## 停止服务

\`\`\`bash
node stop.js
\`\`\`

## 后台运行 (Linux/Mac)

\`\`\`bash
nohup node run.js --start > /dev/null 2>&1 &
\`\`\`

## 注意事项

1. 确保服务器防火墙开放了配置的端口
2. 确保上传路径有足够的磁盘空间
3. 生产环境建议启用认证功能
`;
    
    fs.writeFileSync(path.join(packageDir, 'README.md'), readmeContent);
    
    // 6. 创建压缩包
    if (isProduction) {
        console.log('\n🗜️  创建压缩包...');
        const archive = archiver('zip', { zlib: { level: 9 } });
        const output = fs.createWriteStream(path.join(packageDir, '..', 'file-share-deploy.zip'));
        
        output.on('close', () => {
            console.log(`✅ 压缩包已创建: ${path.join(packageDir, '..', 'file-share-deploy.zip')} (${archive.pointer()} bytes)`);
        });
        
        archive.on('error', (err) => {
            throw err;
        });
        
        archive.pipe(output);
        archive.directory(packageDir, false);
        archive.finalize();
    }
    
    console.log('\n✅ 打包完成!');
    console.log(`📁 打包目录: ${packageDir}`);
    console.log('📖 请查看 README.md 了解部署说明');
    
} catch (error) {
    console.error('❌ 打包失败:', error.message);
    process.exit(1);
}