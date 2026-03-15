import { useState, useEffect } from 'react';
import { Battery, Zap, Thermometer, Activity, Heart, Clock } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function BatteryMonitor() {
  const [battery, setBattery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBattery();
    const interval = setInterval(fetchBattery, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchBattery = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/battery`);
      if (!response.ok) throw new Error('Failed to fetch battery data');
      const data = await response.json();
      setBattery(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBatteryColor = (percentage) => {
    if (percentage > 60) return 'text-green-400';
    if (percentage > 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBatteryBgColor = (percentage) => {
    if (percentage > 60) return 'from-green-500 to-green-600';
    if (percentage > 20) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-400">连接错误: {error}</p>
        <p className="text-gray-400 text-sm mt-2">请确保后端服务正在运行 (python backend/main.py)</p>
      </div>
    );
  }

  const stats = [
    {
      label: '电量',
      value: `${battery.percentage}%`,
      icon: Battery,
      color: getBatteryColor(battery.percentage),
      bg: getBatteryBgColor(battery.percentage),
    },
    {
      label: '电压',
      value: `${battery.voltage.toFixed(2)} V`,
      icon: Zap,
      color: 'text-blue-400',
      bg: 'from-blue-500 to-blue-600',
    },
    {
      label: '电流',
      value: `${battery.current} mA`,
      icon: Activity,
      color: battery.current > 0 ? 'text-green-400' : 'text-orange-400',
      bg: battery.current > 0 ? 'from-green-500 to-green-600' : 'from-orange-500 to-orange-600',
    },
    {
      label: '温度',
      value: `${battery.temperature} °C`,
      icon: Thermometer,
      color: battery.temperature > 40 ? 'text-red-400' : 'text-purple-400',
      bg: battery.temperature > 40 ? 'from-red-500 to-red-600' : 'from-purple-500 to-purple-600',
    },
    {
      label: '循环次数',
      value: battery.cycle_count,
      icon: Clock,
      color: 'text-cyan-400',
      bg: 'from-cyan-500 to-cyan-600',
    },
    {
      label: '健康度',
      value: `${battery.health}%`,
      icon: Heart,
      color: battery.health > 60 ? 'text-green-400' : 'text-red-400',
      bg: battery.health > 60 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Battery Visual */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Battery Icon with Animation */}
          <div className="relative">
            <div className={`w-32 h-48 rounded-2xl border-4 border-gray-600 bg-gray-800 relative overflow-hidden ${battery.is_charging ? 'animate-pulse-glow' : ''}`}>
              <div 
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getBatteryBgColor(battery.percentage)} transition-all duration-500`}
                style={{ height: `${battery.percentage}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-white drop-shadow-lg">
                  {battery.percentage}%
                </span>
              </div>
            </div>
            {/* Battery Cap */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-gray-500 rounded-t-lg"></div>
            {battery.is_charging && (
              <div className="absolute top-2 right-2">
                <Zap className="text-yellow-400 animate-bounce" size={24} />
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.slice(0, 6).map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} className={stat.color} />
                    <span className="text-gray-400 text-sm">{stat.label}</span>
                  </div>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Capacity Info */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <h3 className="text-gray-400 text-sm mb-3">容量信息</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">设计容量</span>
              <span className="text-white">{battery.design_capacity} mWh</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">当前容量</span>
              <span className="text-white">{battery.current_capacity} mWh</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className={`bg-gradient-to-r ${getBatteryBgColor(Math.round(battery.current_capacity / battery.design_capacity * 100))} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${Math.round(battery.current_capacity / battery.design_capacity * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl p-4 flex items-center gap-3 ${
        battery.is_charging 
          ? 'bg-green-500/20 border border-green-500/30' 
          : 'bg-blue-500/20 border border-blue-500/30'
      }`}>
        {battery.is_charging ? (
          <>
            <Zap className="text-green-400" />
            <span className="text-green-300">正在充电</span>
          </>
        ) : (
          <>
            <Battery className="text-blue-400" />
            <span className="text-blue-300">使用电池供电</span>
          </>
        )}
        <span className="ml-auto text-gray-400 text-sm">
          充电模式: {battery.charging_mode === 'fast' ? '快充' : battery.charging_mode === 'night' ? '夜充' : '智能'}
        </span>
      </div>
    </div>
  );
}

export default BatteryMonitor;