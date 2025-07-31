#!/bin/bash
# 停止后端服务

echo "🛑 停止后端服务..."

if pgrep -f "python.*app.py" > /dev/null; then
    pkill -f "python.*app.py"
    echo "✅ 后端服务已停止"
else
    echo "ℹ️ 没有运行中的后端服务"
fi
