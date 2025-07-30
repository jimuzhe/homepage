# 个人主页 Linux 服务器部署指南

## 📋 部署概述

本指南将帮助您在 Linux 服务器上部署个人主页项目，支持 Ubuntu 和 CentOS 系统。

### 🏗️ 架构说明

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   用户浏览器     │────│      Nginx       │────│  Python Flask   │
│                │    │   (反向代理)      │    │    (后端API)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   静态文件服务    │
                       │  (前端HTML/CSS)  │
                       └──────────────────┘
```

## 🚀 快速部署

### 1. 准备工作

**服务器要求：**
- Ubuntu 18.04+ 或 CentOS 7+
- 至少 1GB RAM
- 至少 10GB 磁盘空间
- Root 权限

**域名准备：**
- 购买域名并解析到服务器IP
- 确保 A 记录指向您的服务器

### 2. 上传项目文件

```bash
# 方法1: 使用 scp 上传
scp -r ./homepage root@your-server-ip:/tmp/

# 方法2: 使用 git 克隆
git clone https://github.com/your-username/homepage.git /tmp/homepage
```

### 3. 修改配置

编辑部署脚本中的配置：

```bash
cd /tmp/homepage/deploy
nano deploy.sh
```

修改以下变量：
```bash
DOMAIN="your-domain.com"          # 改为您的域名
EMAIL="your-email@example.com"    # 改为您的邮箱
```

### 4. 执行部署

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 执行部署
sudo ./deploy.sh
```

### 5. 安装SSL证书（可选但推荐）

```bash
sudo ./deploy.sh ssl
```

## 📁 目录结构

部署后的目录结构：

```
/var/www/homepage/
├── backend/
│   ├── app.py              # Flask 应用
│   ├── requirements.txt    # Python 依赖
│   ├── venv/              # Python 虚拟环境
│   └── app.log            # 应用日志
├── frontend/
│   ├── index.html         # 主页
│   ├── admin.html         # 管理页面
│   ├── src/               # 源码文件
│   └── public/            # 静态资源
└── logs/
    ├── nginx_access.log   # Nginx 访问日志
    └── nginx_error.log    # Nginx 错误日志
```

## 🔧 手动部署步骤

如果自动脚本失败，可以按以下步骤手动部署：

### 1. 安装依赖

**Ubuntu:**
```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv nginx git
```

**CentOS:**
```bash
sudo yum update -y
sudo yum install -y python3 python3-pip nginx git
```

### 2. 创建项目目录

```bash
sudo mkdir -p /var/www/homepage/{backend,frontend,logs}
```

### 3. 部署后端

```bash
# 复制后端文件
sudo cp -r ./backend/* /var/www/homepage/backend/

# 创建虚拟环境
cd /var/www/homepage/backend
sudo python3 -m venv venv
sudo venv/bin/pip install -r requirements.txt
sudo venv/bin/pip install gunicorn

# 设置权限
sudo chown -R www-data:www-data /var/www/homepage
```

### 4. 配置 Systemd 服务

创建服务文件：
```bash
sudo nano /etc/systemd/system/homepage-backend.service
```

内容：
```ini
[Unit]
Description=Homepage Backend Service
After=network.target

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=/var/www/homepage/backend
Environment=PATH=/var/www/homepage/backend/venv/bin
ExecStart=/var/www/homepage/backend/venv/bin/gunicorn --bind 127.0.0.1:5000 --workers 3 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable homepage-backend
sudo systemctl start homepage-backend
```

### 5. 配置 Nginx

创建站点配置：
```bash
sudo nano /etc/nginx/sites-available/homepage
```

### 6. 部署前端

```bash
sudo cp -r ./frontend/* /var/www/homepage/frontend/
sudo chown -R www-data:www-data /var/www/homepage/frontend
```

## 🔍 故障排除

### 检查服务状态

```bash
# 检查后端服务
sudo systemctl status homepage-backend

# 检查 Nginx
sudo systemctl status nginx

# 查看日志
sudo journalctl -u homepage-backend -f
sudo tail -f /var/www/homepage/logs/nginx_error.log
```

### 常见问题

**1. 后端服务启动失败**
```bash
# 检查 Python 依赖
cd /var/www/homepage/backend
sudo venv/bin/pip list

# 手动测试
sudo -u www-data venv/bin/python app.py
```

**2. Nginx 配置错误**
```bash
# 测试配置
sudo nginx -t

# 重新加载配置
sudo systemctl reload nginx
```

**3. 权限问题**
```bash
# 重新设置权限
sudo chown -R www-data:www-data /var/www/homepage
sudo chmod -R 755 /var/www/homepage
```

## 🔒 安全建议

1. **防火墙配置**
   ```bash
   # Ubuntu UFW
   sudo ufw allow ssh
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. **定期更新**
   ```bash
   # 系统更新
   sudo apt update && sudo apt upgrade  # Ubuntu
   sudo yum update                      # CentOS
   ```

3. **SSL 证书自动续期**
   ```bash
   # 添加到 crontab
   echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
   ```

## 📊 监控和维护

### 日志监控

```bash
# 实时查看访问日志
sudo tail -f /var/www/homepage/logs/nginx_access.log

# 查看应用日志
sudo tail -f /var/www/homepage/backend/app.log
```

### 性能优化

1. **启用 Gzip 压缩**（在 Nginx 配置中）
2. **配置缓存策略**
3. **使用 CDN**（可选）

### 备份策略

```bash
# 创建备份脚本
sudo nano /usr/local/bin/backup-homepage.sh
```

## 🆘 获取帮助

如果遇到问题：

1. 检查日志文件
2. 确认服务状态
3. 验证网络连接
4. 检查防火墙设置

## 🐳 Docker 部署（推荐）

### 快速开始

1. **安装 Docker 和 Docker Compose**
   ```bash
   # Ubuntu
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo apt install docker-compose

   # CentOS
   sudo yum install -y docker docker-compose
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

2. **克隆项目并部署**
   ```bash
   git clone https://github.com/your-username/homepage.git
   cd homepage/deploy

   # 创建必要目录
   mkdir -p data logs ssl

   # 复制配置文件
   cp ../frontend/public/config.json ./data/

   # 启动服务
   docker-compose up -d
   ```

3. **查看状态**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

### Docker 部署优势

- ✅ 环境一致性
- ✅ 快速部署
- ✅ 易于维护
- ✅ 自动重启
- ✅ 资源隔离

## 📝 更新部署

### 传统部署更新

```bash
# 更新后端
sudo systemctl stop homepage-backend
sudo cp -r ./backend/* /var/www/homepage/backend/
sudo systemctl start homepage-backend

# 更新前端
sudo cp -r ./frontend/* /var/www/homepage/frontend/
sudo systemctl reload nginx
```

### Docker 部署更新

```bash
# 重新构建并部署
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 或者仅更新代码
docker-compose restart
```
