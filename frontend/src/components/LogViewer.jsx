import { useState, useEffect } from 'react';
import { Clock, Battery, Zap, Thermometer, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function LogViewer() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/history?limit=100`);
      const data = await response.json();
      setHistory(data.reverse()); // Show newest first
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-blue-400" />
            <span className="text-gray-400 text-sm">总记录数</span>
          </div>
          <p className="text-2xl font-bold text-white">{history.length}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-yellow-400" />
            <span className="text-gray-400 text-sm">充电次数</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {history.filter(h => h.is_charging).length}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Battery size={16} className="text-green-400" />
            <span className="text-gray-400 text-sm">平均电量</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {history.length > 0 
              ? Math.round(history.reduce((sum, h) => sum + h.percentage, 0) / history.length)
              : 0}%
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer size={16} className="text-red-400" />
            <span className="text-gray-400 text-sm">平均温度</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {history.length > 0 
              ? (history.reduce((sum, h) => sum + h.temperature, 0) / history.length).toFixed(1)
              : 0}°C
          </p>
        </div>
      </div>

      {/* Log List */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold">历史记录</h2>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            暂无历史记录，数据收集后会显示在这里
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {history.map((record, index) => (
              <div key={index}>
                <button
                  onClick={() => toggleExpand(index)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm">{formatTime(record.timestamp)}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        record.is_charging 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {record.is_charging ? '充电中' : '放电中'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Battery size={14} className="text-blue-400" />
                      <span className="text-white">{record.percentage}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap size={14} className="text-green-400" />
                      <span className="text-white">{record.voltage.toFixed(2)}V</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Thermometer size={14} className="text-red-400" />
                      <span className="text-white">{record.temperature}°C</span>
                    </div>
                    {expandedIndex === index ? (
                      <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedIndex === index && (
                  <div className="px-4 pb-4 bg-white/5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                      <div>
                        <span className="text-gray-400 text-sm">电量</span>
                        <p className="text-white">{record.percentage}%</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">电压</span>
                        <p className="text-white">{record.voltage.toFixed(2)} V</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">电流</span>
                        <p className="text-white">{record.current} mA</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">温度</span>
                        <p className="text-white">{record.temperature} °C</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LogViewer;