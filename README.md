# 🏠 个人主页项目

一个现代化的个人主页，包含音乐播放器、管理后台和炫酷的激光效果。

## ✨ 功能特点

- 🎵 **音乐播放器** - 支持网易云音乐API，进入网站自动播放
- 🎬 **视频背景** - 支持右侧背景视频，自动循环播放
- 🎨 **激光效果** - 鼠标悬停时的炫酷白色激光边框
- 📱 **响应式设计** - 完美适配桌面和移动设备
- ⚙️ **管理后台** - 可视化配置管理界面
- 🔄 **自动保存** - 配置修改实时保存
- 🎯 **点击特效** - 鼠标点击时的粒子动画
- 🔊 **智能播放** - 自动播放音乐和视频，支持用户交互启动

## 🚀 一键部署

### Linux服务器部署

1. **上传项目文件到服务器**
```bash
# 使用scp上传（在本地执行）
scp -r homepage/ user@your-server:/home/user/

# 或者使用git克隆
git clone https://github.com/your-username/homepage.git
cd homepage
```

2. **运行一键部署脚本**
```bash
# 给脚本执行权限
chmod +x deploy-linux.sh

# 基础部署
./deploy-linux.sh

# 带域名和SSL的部署
./deploy-linux.sh --domain yourdomain.com --email your@email.com

# 自定义端口部署
./deploy-linux.sh --port 8080
```

3. **访问网站**
- 主页：`http://your-server-ip`
- 管理后台：`http://your-server-ip/admin`
- 登录密码：`LongDz`

## 📋 系统要求

- **操作系统**：Ubuntu 18.04+、Debian 10+、CentOS 7+、Rocky Linux 8+
- **内存**：至少 512MB RAM
- **存储**：至少 1GB 可用空间
- **网络**：需要访问外网（下载依赖）

## 🛠️ 手动部署

如果一键脚本不适用，可以手动部署：

### 1. 安装依赖
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm nginx

# CentOS/RHEL
sudo yum install -y nodejs npm nginx
```

### 2. 安装项目依赖
```bash
cd homepage
npm install
```

### 3. 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
NODE_ENV=production node server.js
```

### 4. 配置Nginx（可选）
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📁 项目结构

```
homepage/
├── index.html          # 主页面
├── admin.html          # 管理后台
├── script.js           # 主页脚本
├── admin.js            # 管理脚本
├── styles.css          # 样式文件
├── config.json         # 配置文件
├── server.js           # 后端服务器
├── package.json        # 项目配置
├── deploy-linux.sh     # 一键部署脚本
└── README.md           # 说明文档
```

## ⚙️ 配置说明

### 个人信息配置
在管理后台或直接编辑 `config.json`：
- 姓名、职位、描述
- 头像和背景图片
- 联系方式

### 音乐配置
- 当前播放歌曲ID
- 播放列表（网易云音乐歌曲ID）
- 支持自动播放和循环

### 背景配置
- **图片背景** - 支持个人资料区域和右侧内容区域背景图片
- **视频背景** - 支持右侧背景视频（MP4、WebM、OGG格式）
- **智能切换** - 在管理后台可选择图片或视频背景
- **自动播放** - 视频背景自动循环播放，静音模式

### 技能、项目、友链
- 可视化添加/编辑/删除
- 支持拖拽排序
- 实时预览效果

## 🎬 视频背景使用指南

### 支持的视频格式
- **MP4** - 推荐格式，兼容性最好
- **WebM** - 现代浏览器支持
- **OGG** - 开源格式

### 视频要求
- **文件大小**：建议小于10MB
- **分辨率**：建议1920x1080或以下
- **时长**：建议30秒以内（会自动循环）
- **编码**：H.264（MP4）或VP8/VP9（WebM）

### 配置方法
1. 进入管理后台：`http://your-domain/admin`
2. 点击"背景设置"标签
3. 在"右侧背景"部分选择"视频背景"
4. 输入视频URL
5. 点击"保存背景设置"

### 测试页面
项目包含 `test-video.html` 测试页面，可以：
- 预览视频背景效果
- 测试不同视频URL
- 验证自动播放功能

## 🔧 常用命令

```bash
# 查看服务状态
sudo systemctl status homepage

# 重启服务
sudo systemctl restart homepage

# 查看日志
sudo journalctl -u homepage -f

# 重启Nginx
sudo systemctl restart nginx

# 更新项目
cd /var/www/homepage
git pull
npm install
sudo systemctl restart homepage
```

## 🐛 故障排除

### 服务无法启动
```bash
# 检查端口占用
netstat -tlnp | grep 3001

# 检查服务日志
sudo journalctl -u homepage -n 50
```

### Nginx配置错误
```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 权限问题
```bash
# 修复文件权限
sudo chown -R $USER:$USER /var/www/homepage
sudo chmod -R 755 /var/www/homepage
```

## 📞 技术支持

如果遇到问题，请检查：
1. 系统是否满足要求
2. 网络连接是否正常
3. 防火墙设置是否正确
4. 服务日志中的错误信息

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 🎉 享受您的个人主页！

部署完成后，您将拥有一个功能完整、界面美观的个人主页。记得在管理后台自定义您的个人信息！
