#!/bin/bash
# 后端Docker部署脚本 - 只部署后端到Docker

set -e

echo "🚀 开始部署后端到Docker..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 停止旧的后端容器
echo "🛑 停止旧的后端容器..."
docker-compose -f docker-compose.backend-only.yml down

# 清理旧镜像（可选）
read -p "是否清理旧的后端镜像？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 清理旧镜像..."
    docker image prune -f
    docker rmi $(docker images | grep homepage-backend | awk '{print $3}') 2>/dev/null || true
fi

# 构建后端镜像
echo "🔨 构建后端镜像..."
docker-compose -f docker-compose.backend-only.yml build --no-cache

# 启动后端服务
echo "🚀 启动后端服务..."
docker-compose -f docker-compose.backend-only.yml up -d

# 等待服务启动
echo "⏳ 等待后端服务启动..."
sleep 10

# 检查服务状态
echo "📊 检查后端服务状态..."
docker-compose -f docker-compose.backend-only.yml ps

# 测试后端健康检查
echo "🔍 测试后端健康检查..."
if curl -f http://127.0.0.1:5000/api/health >/dev/null 2>&1; then
    echo "✅ 后端服务健康检查通过"
else
    echo "⚠️ 后端服务健康检查失败，请检查日志"
fi

# 显示日志
echo "📋 显示最近日志..."
docker-compose -f docker-compose.backend-only.yml logs --tail=20

echo ""
echo "✅ 后端部署完成！"
echo "🔗 后端API地址: http://127.0.0.1:5000"
echo "🏥 健康检查: http://127.0.0.1:5000/api/health"
echo "📊 查看日志: docker-compose -f docker-compose.backend-only.yml logs -f"
echo "🛑 停止服务: docker-compose -f docker-compose.backend-only.yml down"
echo ""
echo "📝 接下来的步骤："
echo "1. 更新你的Nginx配置文件 /etc/nginx/sites-available/home.name666.top"
echo "2. 参考 nginx-site.conf 文件中的配置"
echo "3. 重新加载Nginx: sudo nginx -t && sudo systemctl reload nginx"
