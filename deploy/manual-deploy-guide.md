# 个人主页项目混合部署指南

## 部署架构

本项目采用混合部署方案：
- **前端**: 手动部署到nginx静态目录
- **后端**: Docker容器化部署

这种方案的优势：
- 前端直接由nginx提供，性能更好
- 后端容器化，便于管理和更新
- 部署简单，维护方便

## 环境要求

- Linux服务器（Ubuntu 18.04+ / CentOS 7+ / Debian 9+）
- Docker & Docker Compose
- Nginx
- 至少512MB内存

## 快速部署

### 自动部署（推荐）

```bash
# 下载项目代码
git clone <your-repo-url> homepage
cd homepage/deploy

# 运行自动部署脚本
sudo ./manual-deploy.sh
```

脚本会自动完成：
1. 安装Docker和Nginx
2. 部署前端文件到nginx目录
3. 构建并启动Docker后端容器
4. 配置nginx反向代理
5. 设置开机自启动

### 手动部署步骤

如果你想手动控制每个步骤：

#### 1. 准备服务器环境

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo rm get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 安装Nginx
sudo apt install -y nginx git curl

# 启动服务
sudo systemctl enable docker nginx
sudo systemctl start docker nginx
```

#### 2. 部署项目文件

```bash
# 创建项目目录
sudo mkdir -p /opt/homepage
cd /opt/homepage

# 下载项目代码
sudo git clone <your-repo-url> .
# 或上传文件: scp -r ./homepage/* user@server:/opt/homepage/

# 设置权限
sudo chmod -R 755 /opt/homepage
```

#### 3. 配置Docker后端

```bash
cd /opt/homepage/deploy

# 创建环境变量文件
sudo tee .env > /dev/null << 'EOF'
ADMIN_PASSWORD=LongDz6299
EOF

# 构建并启动容器
sudo docker-compose up -d --build

# 检查容器状态
sudo docker-compose ps
```

#### 4. 配置前端文件

```bash
# 创建前端目录
sudo mkdir -p /var/www/homepage

# 复制前端文件
sudo cp -r /opt/homepage/frontend/* /var/www/homepage/

# 设置权限
sudo chown -R www-data:www-data /var/www/homepage
sudo chmod -R 755 /var/www/homepage
```

#### 5. 配置开机自启动

```bash
# 创建Docker管理服务
sudo tee /etc/systemd/system/homepage-docker.service > /dev/null << 'EOF'
[Unit]
Description=Homepage Docker Backend Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/homepage/deploy
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# 启用服务
sudo systemctl daemon-reload
sudo systemctl enable homepage-docker
```

#### 6. 配置Nginx

```bash
# 复制nginx配置文件
sudo cp /opt/homepage/deploy/nginx-site.conf /etc/nginx/sites-available/homepage

# 修改域名（替换为你的实际域名）
sudo sed -i 's/your-domain.com/你的域名/g' /etc/nginx/sites-available/homepage

# 启用站点
sudo ln -sf /etc/nginx/sites-available/homepage /etc/nginx/sites-enabled/

# 删除默认站点（可选）
sudo rm -f /etc/nginx/sites-enabled/default

# 测试nginx配置
sudo nginx -t

# 重启nginx
sudo systemctl restart nginx
```

#### 7. 配置防火墙

```bash
# 如果使用ufw
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS（如果需要）
sudo ufw enable

# 如果使用firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

#### 8. 验证部署

```bash
# 检查Docker后端
cd /opt/homepage/deploy
sudo docker-compose ps

# 检查后端API
curl http://localhost:5000/api/health

# 检查前端
curl http://localhost/

# 检查nginx状态
sudo systemctl status nginx

# 查看日志
sudo docker-compose logs -f
tail -f /var/log/nginx/homepage_access.log
```

## 管理命令

### Docker后端管理
```bash
# 进入项目目录
cd /opt/homepage/deploy

# 查看容器状态
sudo docker-compose ps

# 启动/停止/重启后端
sudo docker-compose up -d
sudo docker-compose stop
sudo docker-compose restart

# 查看日志
sudo docker-compose logs -f

# 重新构建容器
sudo docker-compose up -d --build

# 进入容器调试
sudo docker-compose exec homepage-backend bash
```

### 前端更新
```bash
# 更新前端文件
sudo cp -r /opt/homepage/frontend/* /var/www/homepage/
sudo chown -R www-data:www-data /var/www/homepage

# 重启nginx（如果需要）
sudo systemctl restart nginx
```

### 完整更新部署
```bash
# 更新代码
cd /opt/homepage
sudo git pull

# 更新前端
sudo cp -r frontend/* /var/www/homepage/
sudo chown -R www-data:www-data /var/www/homepage

# 更新后端
cd deploy
sudo docker-compose up -d --build
```

### 日志管理
```bash
# 查看Docker日志
cd /opt/homepage/deploy
sudo docker-compose logs -f

# 查看nginx日志
tail -f /var/log/nginx/homepage_access.log
tail -f /var/log/nginx/homepage_error.log

# 清理Docker日志
sudo docker system prune -f

# 清理nginx日志
sudo truncate -s 0 /var/log/nginx/homepage_*.log
```

## 故障排除

### 后端服务无法启动
```bash
# 检查Python环境
/home/homepage/homepage/backend/venv/bin/python --version

# 手动测试
cd /home/homepage/homepage/backend
source venv/bin/activate
python app.py

# 检查端口占用
sudo netstat -tlnp | grep :5000
```

### Nginx配置错误
```bash
# 测试配置
sudo nginx -t

# 检查语法错误
sudo nginx -T

# 重新加载配置
sudo systemctl reload nginx
```

### 权限问题
```bash
# 检查文件权限
ls -la /var/www/homepage/
ls -la /home/homepage/homepage/

# 修复权限
sudo chown -R www-data:www-data /var/www/homepage
sudo chown -R homepage:homepage /home/homepage/homepage
```

## 性能优化

### 系统级优化
```bash
# 增加文件句柄限制
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# 优化内核参数
echo "net.core.somaxconn = 1024" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 应用级优化
- 根据服务器配置调整gunicorn worker数量
- 启用nginx缓存
- 使用CDN加速静态资源
- 定期清理日志文件

## 安全建议

1. **修改默认密码**: 在systemd服务文件中修改`ADMIN_PASSWORD`
2. **使用HTTPS**: 配置SSL证书
3. **定期更新**: 保持系统和依赖包更新
4. **备份数据**: 定期备份配置文件和数据
5. **监控日志**: 定期检查访问和错误日志

这样就完成了手动部署！你的个人主页应该可以通过域名访问了。
