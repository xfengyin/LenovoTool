import { useState, useEffect } from 'react';
import BatteryMonitor from './components/BatteryMonitor';
import BatteryChart from './components/BatteryChart';
import ChargingModeSelector from './components/ChargingModeSelector';
import HealthPrediction from './components/HealthPrediction';
import LogViewer from './components/LogViewer';
import { Battery, Activity, Moon, Sun, Zap } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('monitor');

  const tabs = [
    { id: 'monitor', label: '监控面板', icon: Battery },
    { id: 'chart', label: '电量曲线', icon: Activity },
    { id: 'mode', label: '充电模式', icon: Zap },
    { id: 'health', label: '寿命预测', icon: Sun },
    { id: 'logs', label: '历史记录', icon: Moon },
  ];

  return (
    <div className="min-h-screen text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            LenovoTool 电池监控
          </h1>
          <p className="text-gray-400 mt-2">实时监控笔记本电池状态</p>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Main Content */}
        <main className="animate-fade-in">
          {activeTab === 'monitor' && <BatteryMonitor />}
          {activeTab === 'chart' && <BatteryChart />}
          {activeTab === 'mode' && <ChargingModeSelector />}
          {activeTab === 'health' && <HealthPrediction />}
          {activeTab === 'logs' && <LogViewer />}
        </main>
      </div>
    </div>
  );
}

export default App;