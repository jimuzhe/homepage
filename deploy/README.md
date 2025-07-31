# 个人主页项目部署文件

## 部署方案

本项目采用**混合部署**方案：
- **前端**: 手动部署到nginx静态目录，性能更好
- **后端**: Docker容器化部署，便于管理

## 快速部署

### 自动部署（推荐）

```bash
# 1. 下载项目
git clone <your-repo-url> homepage
cd homepage/deploy

# 2. 运行部署脚本
sudo ./manual-deploy.sh
```

### 手动部署

详细步骤请参考：[manual-deploy-guide.md](./manual-deploy-guide.md)

## 文件说明

- `manual-deploy.sh` - 自动部署脚本
- `manual-deploy-guide.md` - 详细部署指南
- `docker-compose.yml` - Docker后端配置
- `Dockerfile` - 后端镜像构建文件
- `nginx-site.conf` - Nginx站点配置模板

## 部署后管理

### 查看状态
```bash
# Docker后端状态
cd /opt/homepage/deploy
sudo docker-compose ps

# Nginx状态
sudo systemctl status nginx
```

### 更新部署
```bash
# 更新代码
cd /opt/homepage
sudo git pull

# 更新前端
sudo cp -r frontend/* /var/www/homepage/

# 更新后端
cd deploy
sudo docker-compose up -d --build
```

### 查看日志
```bash
# 后端日志
cd /opt/homepage/deploy
sudo docker-compose logs -f

# Nginx日志
tail -f /var/log/nginx/homepage_access.log
```

## 访问地址

- 主页: http://your-domain.com
- 管理后台: http://your-domain.com/admin
- API健康检查: http://your-domain.com/api/health

## 默认配置

- 管理员密码: `LongDz6299`
- 后端端口: `5000` (仅本地访问)
- 前端目录: `/var/www/homepage`
- 项目目录: `/opt/homepage`

## 故障排除

### 后端无法访问
```bash
# 检查容器状态
sudo docker-compose ps

# 查看容器日志
sudo docker-compose logs

# 重启容器
sudo docker-compose restart
```

### 前端无法访问
```bash
# 检查nginx状态
sudo systemctl status nginx

# 检查nginx配置
sudo nginx -t

# 重启nginx
sudo systemctl restart nginx
```

### 端口冲突
```bash
# 检查端口占用
sudo netstat -tlnp | grep :5000
sudo netstat -tlnp | grep :80

# 修改docker-compose.yml中的端口映射
```

## 性能优化

- 后端默认限制CPU 0.5核心，内存256MB
- 可根据服务器配置调整 `docker-compose.yml` 中的资源限制
- nginx已启用gzip压缩和静态文件缓存
- 建议定期清理Docker日志和nginx日志

## 安全建议

1. 修改默认管理员密码
2. 配置HTTPS证书
3. 设置防火墙规则
4. 定期更新系统和依赖
5. 监控访问日志
