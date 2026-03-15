# LenovoTool 电池监控工具

LenovoTool 是一款专为联想笔记本设计的电池监控工具，支持实时电池状态监控、充电模式切换、寿命预测等功能。

## 功能特性

### 1. 电池监控面板
- 电量百分比显示
- 电压 (V)
- 电流 (mA)
- 温度 (°C)
- 循环次数
- 设计容量 / 当前容量

### 2. 可视化界面
- 电量实时曲线图
- 电压电流变化图
- 健康度仪表盘
- 充电状态指示

### 3. 充电模式切换
- 快充模式 - 快速充满
- 夜充模式 - 缓慢充电保护电池
- 智能模式 - AI智能调节

### 4. 电池寿命预测
- 基于循环次数的寿命估算
- 健康度百分比
- 剩余可用循环次数
- 使用建议

### 5. LOG 查看器
- 历史数据记录
- 充电/放电状态追踪
- 详细参数查看

## 技术栈

- **后端**: Python 3.11+ + FastAPI + Pydantic
- **前端**: React 19 + Vite 8 + Tailwind CSS 4 + Recharts
- **包管理**: UV (Python) + pnpm (Node.js)

## 快速开始

### 安装依赖

#### Python 依赖 (使用 UV)
```bash
# 安装 UV (如果未安装)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 安装 Python 依赖
uv sync
# 或
pip install -r backend/requirements.txt
```

#### 前端依赖 (使用 pnpm)
```bash
# 安装 pnpm (如果未安装)
npm install -g pnpm

# 安装前端依赖
cd frontend
pnpm install
```

### 启动服务

#### 方式一: 使用启动脚本
```bash
# 确保 Python 依赖已安装
uv sync

# 启动前端
cd frontend
pnpm run dev
```

#### 方式二: 手动启动

终端 1 - 启动后端:
```bash
cd backend
python3 main.py
# 或使用 uv
uv run python main.py
```

终端 2 - 启动前端:
```bash
cd frontend
pnpm run dev
```

### 访问

打开浏览器访问: http://localhost:5173

## 生产构建

```bash
# 构建前端
cd frontend
pnpm run build
```

构建产物将生成在 `frontend/dist/` 目录。

## 项目结构

```
LenovoTool/
├── backend/
│   ├── main.py           # FastAPI 后端主程序
│   ├── requirements.txt  # Python 依赖
│   └── data/             # 数据存储目录
├── frontend/
│   ├── src/
│   │   ├── components/   # React 组件
│   │   │   ├── BatteryMonitor.jsx
│   │   │   ├── BatteryChart.jsx
│   │   │   ├── ChargingModeSelector.jsx
│   │   │   ├── HealthPrediction.jsx
│   │   │   └── LogViewer.jsx
│   │   ├── App.jsx       # 主应用组件
│   │   ├── main.jsx      # 入口文件
│   │   └── index.css     # 全局样式
│   ├── index.html
│   ├── vite.config.js    # Vite 配置
│   └── package.json
├── pyproject.toml       # Python 项目配置
├── start.sh             # 启动脚本
└── README.md
```

## API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/battery | 获取当前电池信息 |
| GET | /api/history | 获取历史记录 |
| GET | /api/health-prediction | 获取健康预测 |
| GET | /api/charging-mode | 获取当前充电模式 |
| POST | /api/charging-mode | 设置充电模式 |

## Tauri 打包 (可选)

如需打包为桌面应用，需要先安装 Rust:

```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 添加 Tauri CLI
cd frontend
pnpm add -D @tauri-apps/cli@latest

# 初始化 Tauri
npx tauri init
```

然后运行:
```bash
cd frontend
npx tauri build
```

## 许可证

MIT License