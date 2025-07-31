# 混合部署指南 - 后端Docker + 前端Nginx

## 🎯 部署架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   用户请求      │───▶│   Nginx (Host)   │───▶│ Docker Backend  │
│                 │    │  静态文件服务    │    │   Flask API     │
│                 │    │  反向代理        │    │   端口: 5000    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 快速部署

### 1. 部署后端到Docker
```bash
chmod +x deploy-backend.sh
./deploy-backend.sh
```

### 2. 配置Nginx
```bash
# 备份现有配置
sudo cp /etc/nginx/sites-available/home.name666.top /etc/nginx/sites-available/home.name666.top.backup

# 参考 nginx-site.conf 更新你的配置
sudo nano /etc/nginx/sites-available/home.name666.top

# 测试配置
sudo nginx -t

# 重新加载Nginx
sudo systemctl reload nginx
```

## 📁 关键配置文件

### docker-compose.backend-only.yml
- 只部署后端Flask应用
- 端口绑定到 `127.0.0.1:5000`
- 资源限制：CPU 0.5核，内存256M

### nginx-site.conf
- 静态文件直接由Nginx服务
- API请求代理到Docker后端
- 性能优化配置

## 🔧 Nginx配置要点

### 关键配置项
```nginx
# 网站根目录 - 修改为你的实际路径
root /path/to/your/homepage/frontend;

# API代理到Docker后端
location /api/ {
    proxy_pass http://127.0.0.1:5000/;
    # ... 其他代理配置
}
```

### 需要修改的地方
1. **root路径**: 改为你的前端文件实际路径
2. **server_name**: 确认域名正确
3. **SSL配置**: 如果有HTTPS证书，取消注释相关配置

## ⚡ 性能优势

### 后端Docker化优势
- **资源隔离**: 限制CPU和内存使用
- **易于管理**: 容器化部署，便于更新和回滚
- **环境一致**: 避免环境差异问题

### 前端Nginx直接服务优势
- **高性能**: 直接文件系统访问，无容器开销
- **低延迟**: 减少网络层级
- **简单配置**: 利用现有Nginx配置

## 📊 监控和管理

### 后端服务管理
```bash
# 查看状态
docker-compose -f docker-compose.backend-only.yml ps

# 查看日志
docker-compose -f docker-compose.backend-only.yml logs -f

# 重启后端
docker-compose -f docker-compose.backend-only.yml restart

# 停止后端
docker-compose -f docker-compose.backend-only.yml down
```

### 健康检查
```bash
# 后端健康检查
curl http://127.0.0.1:5000/api/health

# 前端访问测试
curl http://home.name666.top/health
```

## 🔒 安全配置

### 后端安全
- 只绑定到本地IP (127.0.0.1)
- 非root用户运行
- 资源限制防止资源耗尽

### 前端安全
- 安全头配置
- 敏感文件访问限制
- HTTPS支持（可选）

## 🛠️ 故障排除

### 常见问题

1. **后端连接失败**
   ```bash
   # 检查后端是否运行
   docker ps | grep homepage-backend
   
   # 检查端口监听
   netstat -tulpn | grep :5000
   
   # 查看后端日志
   docker logs homepage-backend
   ```

2. **Nginx配置错误**
   ```bash
   # 测试配置语法
   sudo nginx -t
   
   # 查看Nginx错误日志
   sudo tail -f /var/log/nginx/error.log
   ```

3. **权限问题**
   ```bash
   # 检查前端文件权限
   ls -la /path/to/your/homepage/frontend/
   
   # 修复权限（如果需要）
   sudo chown -R www-data:www-data /path/to/your/homepage/frontend/
   ```

## 📈 扩展建议

### 生产环境优化
1. **SSL证书**: 配置HTTPS
2. **日志轮转**: 配置日志自动清理
3. **监控**: 添加Prometheus/Grafana监控
4. **备份**: 定期备份配置和数据

### 高可用部署
1. **多后端实例**: 扩展Docker后端实例
2. **负载均衡**: Nginx upstream配置
3. **健康检查**: 自动故障转移
