#!/bin/bash
# 简单部署脚本 - 后端直接运行Python

set -e

echo "🚀 开始部署个人主页..."

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3未安装"
    exit 1
fi

# 进入后端目录
cd backend

# 安装Python依赖
echo "📦 安装Python依赖..."
if command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
else
    pip install -r requirements.txt
fi

# 检查是否有旧的进程在运行
echo "🔍 检查现有进程..."
if pgrep -f "python.*app.py" > /dev/null; then
    echo "🛑 停止旧的后端进程..."
    pkill -f "python.*app.py" || true
    sleep 2
fi

# 启动后端服务
echo "🚀 启动后端服务..."
nohup python3 app.py > ../app.log 2>&1 &
BACKEND_PID=$!

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 3

# 检查服务是否正常启动
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ 后端服务启动成功！PID: $BACKEND_PID"
    
    # 测试健康检查
    sleep 2
    if curl -f http://127.0.0.1:3001/api/health >/dev/null 2>&1; then
        echo "✅ 后端健康检查通过"
    else
        echo "⚠️ 后端健康检查失败，请检查日志"
    fi
else
    echo "❌ 后端服务启动失败"
    exit 1
fi

echo ""
echo "✅ 部署完成！"
echo "🔗 后端API地址: http://127.0.0.1:3001"
echo "🏥 健康检查: http://127.0.0.1:3001/api/health"
echo "📋 查看日志: tail -f ../app.log"
echo "🛑 停止服务: pkill -f 'python.*app.py'"
echo ""
echo "📝 接下来的步骤："
echo "1. 更新Nginx配置文件 /etc/nginx/sites-available/home.name666.top"
echo "2. 修改API代理地址为: http://127.0.0.1:3001"
echo "3. 重新加载Nginx: sudo nginx -t && sudo systemctl reload nginx"
