#!/bin/bash

# LenovoTool 启动脚本

echo "=== LenovoTool 电池监控工具 ==="
echo ""

# 设置路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 检查并激活虚拟环境
if [ -d ".venv" ]; then
    source .venv/bin/ activate
fi

# 启动后端
echo "正在启动后端服务..."
cd backend
python3 main.py &
BACKEND_PID=$!

cd ..

# 等待后端启动
sleep 2

# 启动前端
echo "正在启动前端服务..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=== 服务已启动 ==="
echo "前端: http://localhost:5173"
echo "后端: http://localhost:8000"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 捕获退出信号
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# 等待
wait