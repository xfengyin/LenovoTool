"""
LenovoTool Battery Monitor Backend
FastAPI server providing battery information and control
"""
import os
import json
import time
import random
from datetime import datetime
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Data storage path
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)
HISTORY_FILE = DATA_DIR / "battery_history.json"
SETTINGS_FILE = DATA_DIR / "settings.json"


class BatteryInfo(BaseModel):
    """Battery information model"""
    percentage: int
    voltage: float
    current: int
    temperature: float
    cycle_count: int
    design_capacity: int
    current_capacity: int
    is_charging: bool
    charging_mode: str
    health: float
    timestamp: str


class ChargingMode(BaseModel):
    """Charging mode settings"""
    mode: str  # "fast", "night", "smart"


class BatteryHistory(BaseModel):
    """Battery history record"""
    timestamp: str
    percentage: int
    voltage: float
    current: int
    temperature: float
    is_charging: bool


app = FastAPI(title="LenovoTool Battery Monitor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_history() -> list:
    """Load battery history from file"""
    if HISTORY_FILE.exists():
        try:
            with open(HISTORY_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    return []


def save_history(history: list):
    """Save battery history to file"""
    # Keep only last 1000 records
    history = history[-1000:]
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f)


def load_settings() -> dict:
    """Load settings from file"""
    default = {
        "charging_mode": "smart",
        "design_capacity": 50000,  # mWh
        "cycle_count": 150,
    }
    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, 'r') as f:
                return {**default, **json.load(f)}
        except:
            pass
    return default


def save_settings(settings: dict):
    """Save settings to file"""
    with open(SETTINGS_FILE, 'w') as f:
        json.dump(settings, f)


def get_battery_info() -> BatteryInfo:
    """
    Get current battery information.
    On Linux, reads from /sys/class/power_supply/BAT*
    Falls back to simulated data if not available
    """
    settings = load_settings()
    history = load_history()
    
    # Try to read from Linux battery sysfs
    battery_path = None
    for bat in os.listdir("/sys/class/power_supply"):
        if bat.startswith("BAT"):
            battery_path = f"/sys/class/power_supply/{bat}"
            break
    
    if battery_path and os.path.exists(battery_path):
        try:
            def read_val(name: str, default=0):
                path = os.path.join(battery_path, name)
                if os.path.exists(path):
                    try:
                        return int(open(path).read().strip())
                    except:
                        pass
                return default
            
            def read_float(name: str, default=0.0):
                path = os.path.join(battery_path, name)
                if os.path.exists(path):
                    try:
                        return float(open(path).read().strip())
                    except:
                        pass
                return default
            
            def read_str(name: str, default=""):
                path = os.path.join(battery_path, name)
                if os.path.exists(path):
                    try:
                        return open(path).read().strip()
                    except:
                        pass
                return default
            
            # Get values from sysfs
            energy_now = read_val("energy_now", settings.get("design_capacity", 50000) * random.randint(30, 90) // 100)
            energy_full = read_val("energy_full", settings.get("design_capacity", 50000))
            voltage_now = read_val("voltage_now", 11000000 + random.randint(-200000, 200000)) / 1000000  # Convert to V
            current_now = read_val("current_now", random.randint(-2000, 1500))  # mA, negative = discharging
            charge_now = read_val("charge_now", energy_now * 1000 // voltage_now)
            charge_full = read_val("charge_full", energy_full * 1000 // voltage_now)
            cycle_count = read_val("cycle_count", settings.get("cycle_count", 150))
            
            # Try to get temperature
            temp = 0
            for temp_file in ["temp", "temp_now", "temperature"]:
                temp_path = os.path.join(battery_path, temp_file)
                if os.path.exists(temp_path):
                    try:
                        temp = int(open(temp_path).read().strip()) / 10.0
                        break
                    except:
                        pass
            
            # Calculate percentage
            percentage = int((energy_now / energy_full) * 100) if energy_full > 0 else 50
            percentage = max(0, min(100, percentage))
            
            # Determine charging status
            status = read_str("status", "Unknown")
            is_charging = status.lower() == "charging"
            
            # Calculate health based on cycle count
            health = max(0, min(100, 100 - (cycle_count / 1000) * 100))
            
            return BatteryInfo(
                percentage=percentage,
                voltage=round(voltage_now, 2),
                current=current_now,
                temperature=round(temp if temp > 0 else 35 + random.uniform(-5, 10), 1),
                cycle_count=cycle_count,
                design_capacity=settings.get("design_capacity", 50000),
                current_capacity=energy_now,
                is_charging=is_charging,
                charging_mode=settings.get("charging_mode", "smart"),
                health=round(health, 1),
                timestamp=datetime.now().isoformat()
            )
        except Exception as e:
            print(f"Error reading battery: {e}")
    
    # Fallback to simulated data
    last_record = history[-1] if history else None
    
    if last_record:
        # Simulate gradual changes
        percentage = last_record["percentage"]
        if random.random() > 0.7:
            change = random.choice([-1, 0, 1])
            percentage = max(0, min(100, percentage + change))
    else:
        percentage = random.randint(30, 90)
    
    is_charging = percentage < 95 and random.random() > 0.3
    current = random.randint(500, 2000) if is_charging else random.randint(-2000, -500)
    voltage = 11.1 + random.uniform(-0.3, 0.5)
    
    return BatteryInfo(
        percentage=percentage,
        voltage=round(voltage, 2),
        current=current,
        temperature=round(35 + random.uniform(-5, 10), 1),
        cycle_count=settings.get("cycle_count", 150),
        design_capacity=settings.get("design_capacity", 50000),
        current_capacity=int(settings.get("design_capacity", 50000) * percentage / 100),
        is_charging=is_charging,
        charging_mode=settings.get("charging_mode", "smart"),
        health=round(max(0, 100 - settings.get("cycle_count", 150) / 10), 1),
        timestamp=datetime.now().isoformat()
    )


@app.get("/api/battery", response_model=BatteryInfo)
async def get_battery():
    """Get current battery information"""
    return get_battery_info()


@app.get("/api/history", response_model=list[BatteryHistory])
async def get_history(limit: int = 100):
    """Get battery history"""
    history = load_history()
    return history[-limit:]


@app.post("/api/charging-mode")
async def set_charging_mode(mode: ChargingMode):
    """Set charging mode"""
    valid_modes = ["fast", "night", "smart"]
    if mode.mode not in valid_modes:
        return {"error": f"Invalid mode. Choose from: {valid_modes}"}
    
    settings = load_settings()
    settings["charging_mode"] = mode.mode
    save_settings(settings)
    
    return {"success": True, "mode": mode.mode}


@app.get("/api/charging-mode")
async def get_charging_mode():
    """Get current charging mode"""
    settings = load_settings()
    return {"mode": settings.get("charging_mode", "smart")}


@app.get("/api/health-prediction")
async def get_health_prediction():
    """Get battery health prediction"""
    settings = load_settings()
    history = load_history()
    
    cycle_count = settings.get("cycle_count", 150)
    
    # Simple prediction based on cycle count
    # Li-ion batteries typically last 300-500 cycles at 80% capacity
    max_cycles = 500
    health_percent = max(0, min(100, (1 - cycle_count / max_cycles) * 100))
    
    # Estimate remaining cycles
    remaining_cycles = max(0, max_cycles - cycle_count)
    
    # Estimate years remaining (assuming 1 cycle per day)
    years_remaining = remaining_cycles / 365
    
    return {
        "current_health": round(health_percent, 1),
        "cycle_count": cycle_count,
        "max_cycles": max_cycles,
        "remaining_cycles": remaining_cycles,
        "estimated_years_remaining": round(years_remaining, 1),
        "recommendation": get_health_recommendation(health_percent)
    }


def get_health_recommendation(health: float) -> str:
    """Get health recommendation"""
    if health >= 80:
        return "电池状态良好，继续保持常规使用习惯。"
    elif health >= 60:
        return "电池容量有所下降，建议避免高温充电。"
    elif health >= 40:
        return "电池明显老化，考虑更换电池。"
    else:
        return "电池严重老化，建议立即更换电池。"


@app.post("/api/simulate")
async def simulate_charge(charge: bool):
    """Trigger a simulated charge/discharge event"""
    settings = load_settings()
    history = load_history()
    
    # Simulate a reading
    info = get_battery_info()
    
    # Record to history
    record = {
        "timestamp": info.timestamp,
        "percentage": info.percentage,
        "voltage": info.voltage,
        "current": info.current,
        "temperature": info.temperature,
        "is_charging": info.is_charging
    }
    history.append(record)
    save_history(history)
    
    return {"success": True, "record": record}


# WebSocket for real-time updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass


manager = ConnectionManager()


@app.websocket("/ws/battery")
async def websocket_battery(websocket: WebSocket):
    """WebSocket for real-time battery updates"""
    await manager.connect(websocket)
    try:
        while True:
            info = get_battery_info()
            
            # Record to history every 10 seconds
            history = load_history()
            record = {
                "timestamp": info.timestamp,
                "percentage": info.percentage,
                "voltage": info.voltage,
                "current": info.current,
                "temperature": info.temperature,
                "is_charging": info.is_charging
            }
            history.append(record)
            save_history(history)
            
            await websocket.send_json(info.model_dump())
            
            # Update cycle count slowly
            settings = load_settings()
            if random.random() < 0.001:  # Very slow increment
                settings["cycle_count"] = settings.get("cycle_count", 150) + 1
                save_settings(settings)
            
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


import asyncio


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)