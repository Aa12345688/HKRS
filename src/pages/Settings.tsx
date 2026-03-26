import React from 'react';
import { Settings as SettingsIcon, Bell, Shield, Database, Smartphone, Moon, Sun, Monitor } from 'lucide-react';
import { useInventoryStore } from '../store/useInventoryStore';

export const Settings: React.FC = () => {
  const { theme, setTheme, scanMode, setScanMode, layoutMode, setLayoutMode } = useInventoryStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 md:pb-0">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">系統設定</h1>
        <p className="text-gray-400 font-medium">調整主題與掃描偏好，數據自動存於設備中 (Zustand 持久化)</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          {[
            { name: '一般設定', icon: SettingsIcon },
            { name: '視覺排版', icon: Moon },
            { name: '系統備份', icon: Database }
          ].map((item, i) => (
            <button key={item.name} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${i === 0 ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}>
              <item.icon size={18} className={i === 0 ? 'text-blue-500' : 'text-gray-500'} />
              {item.name}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#0f1115] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8">
            
            {/* Theme Toggle section */}
            <div>
              <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-3">視覺模式 (Light/Dark Theme)</label>
              <div className="flex gap-4">
                <button 
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl font-bold transition-colors ${theme === 'dark' ? 'bg-[#050608] border-2 border-blue-500 text-white' : 'bg-gray-900 border-2 border-transparent text-gray-400 hover:text-white'}`}
                >
                  <Moon size={18} /> 暗黑模式 (預設)
                </button>
                <button 
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl font-bold transition-colors ${theme === 'light' ? 'bg-[#050608] border-2 border-amber-500 text-amber-500' : 'bg-gray-900 border-2 border-transparent text-gray-400 hover:text-white'}`}
                >
                  <Sun size={18} /> 戶外強光高對比
                </button>
              </div>
            </div>

            <div className="h-px bg-gray-800/80 w-full"></div>

            <div>
              <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-3">條碼槍輸入模式</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <label onClick={() => setScanMode('auto')} className={`flex-1 flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors border ${scanMode === 'auto' ? 'bg-[#050608] border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'}`}>
                  <span className={`text-sm font-bold ${scanMode === 'auto' ? 'text-blue-200' : 'text-gray-400'}`}>掃瞄後直接快速異動</span>
                  <div className={`w-4 h-4 rounded-full border-2 ${scanMode === 'auto' ? 'border-blue-500 bg-blue-500' : 'border-gray-600'}`}></div>
                </label>
                <label onClick={() => setScanMode('manual')} className={`flex-1 flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors border ${scanMode === 'manual' ? 'bg-[#050608] border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'}`}>
                  <span className={`text-sm font-bold ${scanMode === 'manual' ? 'text-blue-200' : 'text-gray-400'}`}>手動輸入再按確認</span>
                  <div className={`w-4 h-4 rounded-full border-2 ${scanMode === 'manual' ? 'border-blue-500 bg-blue-500' : 'border-gray-600'}`}></div>
                </label>
              </div>
            </div>

            <div className="h-px bg-gray-800/80 w-full"></div>

            {/* Layout Mode Toggle */}
            <div>
              <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-3">介面佈局模式</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  onClick={() => setLayoutMode('auto')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl font-bold border-2 transition-all ${layoutMode === 'auto' ? 'bg-[#050608] border-blue-500 text-white' : 'bg-gray-900/50 border-transparent text-gray-400 hover:text-white'}`}
                >
                  <SettingsIcon size={20} />
                  <span className="text-sm">系統自動</span>
                </button>
                <button 
                  onClick={() => setLayoutMode('mobile')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl font-bold border-2 transition-all ${layoutMode === 'mobile' ? 'bg-[#050608] border-blue-500 text-white' : 'bg-gray-900/50 border-transparent text-gray-400 hover:text-white'}`}
                >
                  <Smartphone size={20} />
                  <span className="text-sm">強制手機版</span>
                </button>
                <button 
                  onClick={() => setLayoutMode('desktop')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl font-bold border-2 transition-all ${layoutMode === 'desktop' ? 'bg-[#050608] border-blue-500 text-white' : 'bg-gray-900/50 border-transparent text-gray-400 hover:text-white'}`}
                >
                  <Monitor size={20} />
                  <span className="text-sm">強制電腦版</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-3 italic">「強制手機版」會在電腦畫面上呈現置中的行動端 HUD 容器。</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
