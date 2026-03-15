import { useState, useEffect } from 'react';
import { Zap, Moon, Brain, Check } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const modes = [
  {
    id: 'fast',
    name: '快充模式',
    icon: Zap,
    description: '快速充满电池，适合急需外出时使用',
    color: 'from-orange-500 to-red-500',
    benefits: ['充电速度最快', '节省等待时间'],
    drawbacks: ['发热量较大', '长期使用可能加速电池老化'],
  },
  {
    id: 'night',
    name: '夜充模式',
    icon: Moon,
    description: '整夜缓慢充电，保护电池寿命',
    color: 'from-indigo-500 to-purple-500',
    benefits: ['减少电池发热', '延长电池寿命', '适合过夜充电'],
    drawbacks: ['充电速度较慢'],
  },
  {
    id: 'smart',
    name: '智能模式',
    icon: Brain,
    description: 'AI智能调节，根据使用习惯优化充电',
    color: 'from-blue-500 to-cyan-500',
    benefits: ['智能温控', '自动学习使用习惯', '平衡速度和寿命'],
    drawbacks: ['需要时间学习使用习惯'],
  },
];

function ChargingModeSelector() {
  const [currentMode, setCurrentMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMode();
  }, []);

  const fetchMode = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/charging-mode`);
      const data = await response.json();
      setCurrentMode(data.mode);
    } catch (err) {
      console.error('Failed to fetch mode:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = async (modeId) => {
    if (modeId === currentMode) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE}/api/charging-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: modeId }),
      });
      
      if (response.ok) {
        setCurrentMode(modeId);
      }
    } catch (err) {
      console.error('Failed to update mode:', err);
    } finally {
      setUpdating(false);
    }
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
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-bold mb-2">充电模式设置</h2>
        <p className="text-gray-400 mb-6">选择适合您使用习惯的充电模式</p>

        <div className="grid md:grid-cols-3 gap-4">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = currentMode === mode.id;
            
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                disabled={updating}
                className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                  isActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
              >
                {isActive && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-blue-500 rounded-full p-1">
                      <Check size={14} className="text-white" />
                    </div>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-4`}>
                  <Icon size={24} className="text-white" />
                </div>

                <h3 className="text-lg font-bold mb-2">{mode.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{mode.description}</p>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-green-300 text-sm">{mode.benefits[0]}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-green-300 text-sm">{mode.benefits[1] || mode.benefits[0]}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Mode Info */}
      {currentMode && (
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h3 className="font-bold mb-4">当前模式详情</h3>
          <div className="space-y-4">
            {modes.find(m => m.id === currentMode)?.benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-gray-300">{benefit}</span>
              </div>
            ))}
            {modes.find(m => m.id === currentMode)?.drawbacks?.map((drawback, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span className="text-gray-400 text-sm">{drawback}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <h4 className="font-bold text-blue-300 mb-2">💡 小贴士</h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• 长期插电使用建议选择"夜充模式"或"智能模式"</li>
          <li>• 外出急需充电时使用"快充模式"</li>
          <li>• "智能模式"会学习您的使用习惯，初期可能需要适应</li>
        </ul>
      </div>
    </div>
  );
}

export default ChargingModeSelector;