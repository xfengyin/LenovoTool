import { useState, useEffect } from 'react';
import { Heart, Clock, AlertTriangle, Battery, TrendingUp } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function HealthPrediction() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrediction();
    const interval = setInterval(fetchPrediction, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrediction = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/health-prediction`);
      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      console.error('Failed to fetch prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health) => {
    if (health >= 80) return 'text-green-400';
    if (health >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBg = (health) => {
    if (health >= 80) return 'from-green-500 to-green-600';
    if (health >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getHealthStatus = (health) => {
    if (health >= 80) return '良好';
    if (health >= 60) return '一般';
    return '需更换';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Health Gauge */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-bold mb-6">电池健康度</h2>
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Gauge */}
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={prediction.current_health >= 80 ? '#4ade80' : prediction.current_health >= 60 ? '#facc15' : '#f87171'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${prediction.current_health * 2.51} 251`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getHealthColor(prediction.current_health)}`}>
                {prediction.current_health}%
              </span>
              <span className="text-gray-400 text-sm mt-1">{getHealthStatus(prediction.current_health)}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} className="text-blue-400" />
                <span className="text-gray-400 text-sm">循环次数</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {prediction.cycle_count} <span className="text-sm text-gray-400">/ {prediction.max_cycles}</span>
              </p>
              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: `${(prediction.cycle_count / prediction.max_cycles) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-purple-400" />
                <span className="text-gray-400 text-sm">剩余可用</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {prediction.remaining_cycles} <span className="text-sm text-gray-400">次</span>
              </p>
              <p className="text-gray-400 text-sm mt-1">
                约 {prediction.estimated_years_remaining} 年
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className={`rounded-2xl p-6 border ${
        prediction.current_health >= 80 
          ? 'bg-green-500/10 border-green-500/30' 
          : prediction.current_health >= 60 
          ? 'bg-yellow-500/10 border-yellow-500/30'
          : 'bg-red-500/10 border-red-500/30'
      }`}>
        <div className="flex items-start gap-4">
          {prediction.current_health >= 80 ? (
            <Heart className="text-green-400 flex-shrink-0" size={24} />
          ) : prediction.current_health >= 60 ? (
            <Battery className="text-yellow-400 flex-shrink-0" size={24} />
          ) : (
            <AlertTriangle className="text-red-400 flex-shrink-0" size={24} />
          )}
          <div>
            <h3 className={`font-bold mb-2 ${
              prediction.current_health >= 80 
                ? 'text-green-300' 
                : prediction.current_health >= 60 
                ? 'text-yellow-300'
                : 'text-red-300'
            }`}>
              健康建议
            </h3>
            <p className="text-gray-300">{prediction.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Battery Life Info */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="font-bold mb-4">电池寿命知识</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div className="space-y-3">
            <h4 className="font-semibold text-blue-400">影响电池寿命的因素</h4>
            <ul className="space-y-2 text-gray-400">
              <li>• 充放电循环次数</li>
              <li>• 充电时的温度环境</li>
              <li>• 充电截止电压</li>
              <li>• 深度放电频率</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-green-400">延长电池寿命的建议</h4>
            <ul className="space-y-2 text-gray-400">
              <li>• 保持电池在 20%-80% 之间</li>
              <li>• 避免高温环境下充电</li>
              <li>• 长期存放时保持 50% 电量</li>
              <li>• 使用原装充电器</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cycles Progress */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="font-bold mb-4">循环寿命进度</h3>
        <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getHealthBg(prediction.current_health)} rounded-full transition-all duration-1000`}
            style={{ width: `${(prediction.cycle_count / prediction.max_cycles) * 100}%` }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
            {prediction.cycle_count} / {prediction.max_cycles} 次循环
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-3 text-center">
          锂电池通常在 300-500 次循环后容量降至 80%
        </p>
      </div>
    </div>
  );
}

export default HealthPrediction;