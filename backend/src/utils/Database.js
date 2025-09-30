// ----- 本地文件数据库接口封装 k-v 存储 -----
const fs = require('fs');
const path = require('path');
const os = require('os');

// 数据库文件路径
const DB_DIR = path.join(os.homedir(), '.file-share-backend');
const DB_FILE = path.join(DB_DIR, 'storage.json');

// 确保数据库目录存在
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

// 读取存储数据
function loadStorage() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading storage:', error);
    }
    return {};
}

// 保存存储数据
function saveStorage(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving storage:', error);
    }
}

function setStorageItem(key, value) {
    const storage = loadStorage();
    storage[key] = value;
    saveStorage(storage);
}

function getStorageItem(key, defaultValue = null) {
    const storage = loadStorage();
    let value = storage[key];
    
    // 存在直接返回
    if (value !== undefined && value !== null) {
        return value;
    }
    
    // 不存在且没有默认值
    if (defaultValue === null) {
        return null;
    }
    
    // 使用默认值
    if (defaultValue !== null && typeof defaultValue === 'function') {
        defaultValue = defaultValue();
    }
    setStorageItem(key, defaultValue);
    return defaultValue;
}

exports.setStorageItem = setStorageItem;
exports.getStorageItem = getStorageItem;
