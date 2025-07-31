#!/bin/bash
# 启动后端服务

cd backend
echo "🚀 启动后端服务..."

# 检查是否有旧进程
if pgrep -f "python.*app.py" > /dev/null; then
    echo "🛑 停止旧进程..."
    pkill -f "python.*app.py"
    sleep 2
fi

# 启动服务
nohup python3 app.py > ../app.log 2>&1 &
echo "✅ 后端服务已启动，PID: $!"
echo "📋 查看日志: tail -f ../app.log"
