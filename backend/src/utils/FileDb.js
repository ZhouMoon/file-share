const fs = require("fs");
const path = require("path");
const os = require('os');

const EventDispatcher = require('./EventDispatcher');
const AppDatabase = require('./Database');

// 使用固定的键名，不再带有MAC地址
function getFileDBKey() {
    return "FileDb";
}

const addFileToDb = (fileName, fileInfo) => {
    let fileDb = getFileDb();
    fileDb[fileName] = fileInfo;
    AppDatabase.setStorageItem(getFileDBKey(), JSON.stringify(fileDb));
};

const removeFileToDb = (fileName) => {
    let fileDb = getFileDb();
    delete fileDb[fileName];
    AppDatabase.setStorageItem(getFileDBKey(), JSON.stringify(fileDb));
};

const getFileDb = () => {
    // 优先使用不带MAC地址的键，保持向后兼容性
    let fileDbStr = AppDatabase.getStorageItem(getFileDBKey(), null);
    
    // 如果不带MAC地址的键不存在，尝试从带MAC地址的键迁移数据
    if (fileDbStr === null) {
        // 生成带MAC地址的键名（用于迁移旧数据）
        const networkInterfaces = require('os').networkInterfaces();
        let macAddress = '';
        for (const interfaceName in networkInterfaces) {
            const networkInterface = networkInterfaces[interfaceName];
            for (const network of networkInterface) {
                if (network.mac && network.mac !== '00:00:00:00:00:00') {
                    macAddress = network.mac;
                    break;
                }
            }
            if (macAddress) break;
        }
        const oldKey = "FileDb:" + (macAddress || os.hostname());
        fileDbStr = AppDatabase.getStorageItem(oldKey, "{}");
        
        // 如果旧键有数据，迁移到新键
        if (fileDbStr !== "{}") {
            AppDatabase.setStorageItem(getFileDBKey(), fileDbStr);
        }
    }
    
    return JSON.parse(fileDbStr || "{}");
};

const addFile = (file) => {
    console.log("--- addFile ---", file);
    if (fs.lstatSync(file.path).isDirectory()) {
        let filename = file.path.substr(file.path.lastIndexOf(path.sep) + 1);
        let finalFilename = filename;
        // 文件名重复的话，添加后缀区分
        let suffix = 1;
        let fileDb = getFileDb();
        while (fileDb[finalFilename] && fileDb[finalFilename].path !== file.path) {
            finalFilename = filename + '_' + suffix++;
        }
        console.log(finalFilename, "finalFilename");
        addFileToDb(finalFilename, {type: 'directory', name: finalFilename, path: file.path, username: file.username});
    } else {
        addFileToDb(file.name, {type: 'file', name: file.name, path: file.path, username: file.username});
    }
    EventDispatcher.triggerEvent({type: 'fileDb.listChange'});
    return {success: true};
};

const addText = (text, username) => {
    console.log("--- addText ---", text);
    console.log("--- username ---", username);
    // 取文本前10位为名称
    let name = text.substring(0, Math.min(20, text.length));
    let intro = text.substring(0, Math.min(100, text.length));
    if (text.length > 20) {
        name += '...';
    }
    let textBody = {type: 'text', name: name, content: text, intro, username: username};
    addFileToDb(textBody.name, textBody);
    EventDispatcher.triggerEvent({type: 'fileDb.listChange'});
    return {success: true};
};

const removeFile = (file) => {
    console.log("removeFile: " + file.name);
    removeFileToDb(file.name);
    EventDispatcher.triggerEvent({type: 'fileDb.listChange'});
};

const listFiles = () => {
    return Object.values(getFileDb());
};

const getFile = (fileName) => {
    return getFileDb()[fileName];
};

exports.addFile = addFile;
exports.addText = addText;
exports.removeFile = removeFile;
exports.listFiles = listFiles;
exports.getFile = getFile;
