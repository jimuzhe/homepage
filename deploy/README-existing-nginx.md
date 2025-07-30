# 个人主页项目部署指南 - 适用于已有nginx的服务器

本指南适用于已经安装了nginx的Linux服务器。

## 前置要求

- Linux服务器（Ubuntu/CentOS/Debian等）
- 已安装nginx
- 已安装Docker和Docker Compose
- 有sudo权限

## 快速部署

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd homepage
```

### 2. 运行部署脚本
```bash
cd deploy
chmod +x deploy-with-existing-nginx.sh
./deploy-with-existing-nginx.sh
```

按照提示输入：
- 域名（如：homepage.example.com）
- 项目路径（默认：/var/www/homepage）
- 管理员密码（默认：LongDz6299）

### 3. 访问网站
- 主页：http://your-domain.com
- 管理后台：http://your-domain.com/admin

## 手动部署

如果自动脚本有问题，可以手动部署：

### 1. 复制前端文件
```bash
sudo mkdir -p /var/www/homepage
sudo cp -r ../frontend/* /var/www/homepage/
sudo chown -R www-data:www-data /var/www/homepage
sudo chmod -R 755 /var/www/homepage
```

### 2. 配置nginx
```bash
# 复制nginx配置
sudo cp nginx-site.conf /etc/nginx/sites-available/homepage

# 修改域名
sudo sed -i 's/your-domain.com/你的域名/g' /etc/nginx/sites-available/homepage

# 启用站点
sudo ln -sf /etc/nginx/sites-available/homepage /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载nginx
sudo systemctl reload nginx
```

### 3. 启动Docker容器
```bash
# 创建环境变量文件
echo "ADMIN_PASSWORD=你的密码" > .env

# 启动容器
docker-compose up -d

# 查看状态
docker-compose ps
```

## 配置说明

### nginx配置要点
- 前端文件路径：`/var/www/homepage`
- 后端API代理：`http://127.0.0.1:5000`
- 支持Cloudflare真实IP获取
- 包含安全头和缓存优化

### Docker配置要点
- 容器名：`homepage-backend`
- 端口：`127.0.0.1:5000:5000`（只绑定本地）
- 环境变量：`ADMIN_PASSWORD`
- 数据持久化：配置文件和日志

### 目录结构
```
/var/www/homepage/          # 前端文件
├── index.html              # 主页
├── admin.html              # 管理后台
├── public/
│   └── config.json         # 配置文件
└── src/                    # 前端源码

./deploy/                   # 部署文件
├── data/
│   └── config.json         # 持久化配置
└── logs/                   # 日志目录
```

## 常用命令

### Docker管理
```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启容器
docker-compose restart

# 停止容器
docker-compose down

# 重新构建并启动
docker-compose up -d --build
```

### nginx管理
```bash
# 测试配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx

# 重启nginx
sudo systemctl restart nginx

# 查看nginx状态
sudo systemctl status nginx
```

### 日志查看
```bash
# nginx日志
sudo tail -f /var/log/nginx/homepage_access.log
sudo tail -f /var/log/nginx/homepage_error.log

# 容器日志
docker-compose logs -f homepage-backend

# 应用日志
tail -f ./logs/gunicorn_access.log
tail -f ./logs/gunicorn_error.log
```

## 安全建议

1. **修改默认密码**
   ```bash
   # 修改环境变量文件
   echo "ADMIN_PASSWORD=你的强密码" > .env
   docker-compose restart
   ```

2. **配置SSL证书**
   - 使用Let's Encrypt或其他SSL证书
   - 修改nginx配置启用HTTPS

3. **配置防火墙**
   ```bash
   # 只开放必要端口
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

4. **定期备份**
   ```bash
   # 备份配置文件
   cp ./data/config.json ./backup/config-$(date +%Y%m%d).json
   ```

## 故障排除

### 1. 容器启动失败
```bash
# 查看详细日志
docker-compose logs homepage-backend

# 检查端口占用
sudo netstat -tlnp | grep :5000
```

### 2. nginx配置错误
```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 3. API无法访问
```bash
# 检查容器状态
docker-compose ps

# 测试API
curl http://localhost:5000/api/health
```

### 4. 前端文件404
```bash
# 检查文件权限
ls -la /var/www/homepage/

# 检查nginx配置
sudo nginx -t
```

## 更新部署

### 更新前端
```bash
# 复制新的前端文件
sudo cp -r ../frontend/* /var/www/homepage/
sudo chown -R www-data:www-data /var/www/homepage
```

### 更新后端
```bash
# 重新构建并启动容器
docker-compose up -d --build
```

## 联系支持

如果遇到问题，请检查：
1. 系统日志
2. nginx日志
3. Docker容器日志
4. 应用程序日志

或者提交Issue到项目仓库。
