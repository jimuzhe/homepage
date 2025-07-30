// 配置管理服务器 - 用于直接修改config.json
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 中间件
app.use(cors());
app.use(express.json({
    limit: '10mb'
}));
app.use(express.static('.'));

// 配置文件路径
const CONFIG_PATH = path.join(__dirname, 'config.json');
const BACKUP_DIR = path.join(__dirname, 'backups');

// 确保备份目录存在
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, {
        recursive: true
    });
}

// 创建备份文件
function createBackup() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(BACKUP_DIR, `config.backup.${timestamp}.json`);
            fs.copyFileSync(CONFIG_PATH, backupPath);
            console.log(`✅ 备份文件已创建: ${path.basename(backupPath)}`);
            return backupPath;
        }
    } catch (error) {
        console.error('❌ 创建备份失败:', error);
    }
    return null;
}

// 读取配置文件
app.get('/api/config', (req, res) => {
    try {
        if (!fs.existsSync(CONFIG_PATH)) {
            return res.status(404).json({
                error: '配置文件不存在',
                message: 'config.json文件未找到'
            });
        }

        const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
        const config = JSON.parse(configData);

        console.log('📖 配置文件读取成功');
        res.json({
            success: true,
            data: config,
            message: '配置加载成功'
        });
    } catch (error) {
        console.error('❌ 读取配置文件失败:', error);
        res.status(500).json({
            error: '读取配置文件失败',
            message: error.message
        });
    }
});

// 保存配置文件
app.post('/api/config', (req, res) => {
    try {
        const newConfig = req.body;

        // 验证数据
        if (!newConfig || typeof newConfig !== 'object') {
            return res.status(400).json({
                error: '无效的配置数据',
                message: '请提供有效的JSON配置对象'
            });
        }

        // 创建备份
        const backupPath = createBackup();

        // 格式化并写入新配置
        const configJson = JSON.stringify(newConfig, null, 2);
        fs.writeFileSync(CONFIG_PATH, configJson, 'utf8');

        console.log('💾 配置文件已更新');
        res.json({
            success: true,
            message: '配置保存成功！文件已直接更新',
            backup: backupPath ? path.basename(backupPath) : null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ 保存配置文件失败:', error);
        res.status(500).json({
            error: '保存配置文件失败',
            message: error.message
        });
    }
});

// 主页路由
app.get('/', (req, res) => {
    try {
        const indexPath = path.join(__dirname, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send('主页未找到');
        }
    } catch (error) {
        console.error('访问主页失败:', error);
        res.status(500).send('服务器错误');
    }
});

// 管理后台路由
app.get('/admin', (req, res) => {
    try {
        const adminPath = path.join(__dirname, 'admin.html');
        if (fs.existsSync(adminPath)) {
            res.sendFile(adminPath);
        } else {
            res.status(404).send('管理页面未找到');
        }
    } catch (error) {
        console.error('访问管理页面失败:', error);
        res.status(500).send('服务器错误');
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '服务运行正常',
        timestamp: new Date().toISOString(),
        configExists: fs.existsSync(CONFIG_PATH)
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 配置管理服务器启动成功!`);
    console.log(`📍 主页地址: http://localhost:${PORT}`);
    console.log(`🔧 管理后台: http://localhost:${PORT}/admin`);
    console.log(`📁 配置文件: ${CONFIG_PATH}`);
    console.log(`\n🔧 页面路由:`);
    console.log(`   GET  /              - 主页`);
    console.log(`   GET  /admin         - 管理后台页面`);
    console.log(`\n🔧 API端点:`);
    console.log(`   GET  /api/config    - 读取配置`);
    console.log(`   POST /api/config    - 保存配置`);
    console.log(`   GET  /api/health    - 健康检查`);
    console.log(`\n💡 使用说明:`);
    console.log(`   1. 访问主页: http://localhost:${PORT}`);
    console.log(`   2. 管理配置: http://localhost:${PORT}/admin (密码: LongDz)`);
    console.log(`   3. 在管理后台修改配置后，刷新主页即可看到更新!`);
});