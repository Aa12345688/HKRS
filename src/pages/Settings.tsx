import React, { useState, useRef, useEffect } from 'react';
import { Settings as SettingsIcon, Database, Smartphone, Moon, Sun, Monitor, Radio, Cloud, CloudOff, QrCode, ScanLine, CheckCircle2, AlertCircle, Loader2, Copy, Wifi, WifiOff } from 'lucide-react';
import { useInventoryStore } from '../store/useInventoryStore';
import { useIsMobile } from '../hooks/useMediaQuery';
import QRCode from 'qrcode';

export const Settings: React.FC = () => {
  const { theme, setTheme, scanMode, setScanMode, layoutMode, setLayoutMode, syncConfig, setSyncConfig, isSyncing, fetchFromCloud } = useInventoryStore();
  const isMobileSensed = useIsMobile();

  // Sync Config Local State
  const [syncUrl, setSyncUrl] = useState(syncConfig?.url || '');
  const [syncKey, setSyncKey] = useState(syncConfig?.key || '');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMsg, setTestMsg] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [scanMode2, setScanMode2] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR when config is set and showQR is toggled
  useEffect(() => {
    if (showQR && syncConfig?.url && syncConfig?.key && qrCanvasRef.current) {
      const payload = JSON.stringify({ url: syncConfig.url, key: syncConfig.key });
      QRCode.toCanvas(qrCanvasRef.current, payload, {
        width: 200,
        margin: 2,
        color: { dark: '#ffffff', light: '#00000000' }
      });
    }
  }, [showQR, syncConfig]);

  const handleTestConnection = async () => {
    if (!syncUrl || !syncKey) {
      setTestStatus('error');
      setTestMsg('請填入 Supabase URL 和 API Key');
      return;
    }
    setTestStatus('testing');
    setTestMsg('正在測試連線...');
    try {
      const baseUrl = syncUrl.endsWith('/') ? syncUrl.slice(0, -1) : syncUrl;
      const res = await fetch(`${baseUrl}/rest/v1/`, {
        headers: { 'apikey': syncKey, 'Authorization': `Bearer ${syncKey}` }
      });
      if (res.ok) {
        setTestStatus('success');
        setTestMsg('連線成功！資料庫可用。');
        setSyncConfig({ url: syncUrl, key: syncKey });
      } else {
        setTestStatus('error');
        setTestMsg(`連線失敗 (${res.status}): 請檢查 URL 和 Key 是否正確。`);
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMsg(`連線錯誤: ${e.message || '網路不可達'}`);
    }
  };

  const handleScanToJoin = () => {
    setScanMode2(true);
    // Use prompt as a simple cross-platform input method
    const input = window.prompt('請貼上同步設定 JSON（從管理員的 QR Code 掃描取得）：');
    setScanMode2(false);
    if (!input) return;
    try {
      const config = JSON.parse(input);
      if (config.url && config.key) {
        setSyncUrl(config.url);
        setSyncKey(config.key);
        setSyncConfig({ url: config.url, key: config.key });
        setTestStatus('success');
        setTestMsg('已成功加入同步！正在從雲端拉取資料...');
      } else {
        setTestStatus('error');
        setTestMsg('格式錯誤，請重新掃描。');
      }
    } catch {
      setTestStatus('error');
      setTestMsg('無法解析 JSON，請重新掃描。');
    }
  };

  const handleDisconnect = () => {
    setSyncConfig(null);
    setSyncUrl('');
    setSyncKey('');
    setTestStatus('idle');
    setTestMsg('');
    setShowQR(false);
  };

  const isConnected = !!syncConfig?.url && !!syncConfig?.key;

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 md:pb-0">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">系統設定</h1>
        <p className="text-gray-400 font-medium">調整主題、同步偏好與掃描模式</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          {[
            { name: '一般設定', icon: SettingsIcon },
            { name: '雲端同步', icon: Cloud },
            { name: '視覺排版', icon: Moon },
          ].map((item, i) => (
            <button key={item.name} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${i === 0 ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}>
              <item.icon size={18} className={i === 0 ? 'text-blue-500' : 'text-gray-500'} />
              {item.name}
              {i === 1 && isConnected && (
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-6">

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* CLOUD SYNC SECTION */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="bg-[#0f1115] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isConnected ? <Wifi size={20} className="text-emerald-500" /> : <WifiOff size={20} className="text-gray-600" />}
                <div>
                  <h3 className="text-lg font-black text-white">多裝置雲端同步</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    {isConnected ? '已連線至雲端資料庫' : '尚未連線 (離線模式)'}
                  </p>
                </div>
              </div>
              {isConnected && (
                <div className="flex items-center gap-2">
                  <button onClick={() => fetchFromCloud()} disabled={isSyncing} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
                    {isSyncing ? <Loader2 size={12} className="animate-spin" /> : '手動同步'}
                  </button>
                  <button onClick={handleDisconnect} className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors">
                    斷開連線
                  </button>
                </div>
              )}
            </div>

            <div className="h-px bg-gray-800/80 w-full"></div>

            {/* Connection Status Banner */}
            {isConnected && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in duration-500">
                <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-300">同步已啟用</p>
                  <p className="text-[10px] text-emerald-500/60 font-mono truncate">{syncConfig?.url}</p>
                </div>
              </div>
            )}

            {/* Admin Input Section */}
            {!isConnected && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 leading-relaxed">
                  接入 <span className="text-blue-400 font-bold">Supabase</span> 免費雲端資料庫，讓多支手機即時同步庫存資料。
                  管理員只需輸入一次，員工可透過 QR Code 自動加入。
                </p>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Supabase Project URL</label>
                  <input
                    type="url"
                    value={syncUrl}
                    onChange={(e) => setSyncUrl(e.target.value)}
                    placeholder="https://abcdefg.supabase.co"
                    className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Anon / Public Key</label>
                  <input
                    type="password"
                    value={syncKey}
                    onChange={(e) => setSyncKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiI..."
                    className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing'}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-black text-sm rounded-xl hover:bg-blue-500 transition-all shadow-lg disabled:opacity-50"
                  >
                    {testStatus === 'testing' ? <Loader2 size={16} className="animate-spin" /> : <Cloud size={16} />}
                    測試連線並啟用
                  </button>
                  <button
                    onClick={handleScanToJoin}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-gray-300 font-black text-sm rounded-xl border border-gray-800 hover:border-blue-500/50 hover:text-white transition-all"
                  >
                    <ScanLine size={16} />
                    掃描加入同步
                  </button>
                </div>
              </div>
            )}

            {/* Test Result Message */}
            {testMsg && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300 ${
                testStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                testStatus === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}>
                {testStatus === 'success' && <CheckCircle2 size={14} />}
                {testStatus === 'error' && <AlertCircle size={14} />}
                {testStatus === 'testing' && <Loader2 size={14} className="animate-spin" />}
                {testMsg}
              </div>
            )}

            {/* QR Code Section for Admin Sharing */}
            {isConnected && (
              <>
                <div className="h-px bg-gray-800/80 w-full"></div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <QrCode size={16} className="text-blue-500" /> 員工快速加入
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">讓員工掃描此 QR Code 即可加入同步，無需手動輸入。</p>
                    </div>
                    <button
                      onClick={() => setShowQR(!showQR)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                        showQR ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-blue-500/50'
                      }`}
                    >
                      {showQR ? '隱藏 QR' : '顯示 QR'}
                    </button>
                  </div>

                  {showQR && (
                    <div className="flex flex-col items-center gap-4 p-6 bg-black/40 border border-gray-800 rounded-2xl animate-in zoom-in-95 duration-300">
                      <canvas ref={qrCanvasRef} className="rounded-xl"></canvas>
                      <p className="text-[10px] text-gray-500 text-center max-w-xs">
                        員工打開 HKRS App → 設定 → 點擊「掃描加入同步」→ 掃描此 QR Code
                      </p>
                      <button
                        onClick={() => {
                          const payload = JSON.stringify({ url: syncConfig.url, key: syncConfig.key });
                          navigator.clipboard?.writeText(payload);
                          alert('已複製同步設定到剪貼簿！');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs font-bold text-gray-300 hover:text-white transition-colors"
                      >
                        <Copy size={12} /> 複製同步設定
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* EXISTING SETTINGS */}
          {/* ═══════════════════════════════════════════════════════════ */}
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
              
              {layoutMode === 'auto' && (
                <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between animate-in fade-in duration-500">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Radio size={18} className="text-blue-500" />
                      <div className="absolute inset-0 bg-blue-500 blur-md opacity-20 animate-pulse"></div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-widest">系統自動感應中</p>
                      <p className="text-sm font-bold text-white">
                        目前偵測：{isMobileSensed ? '行動裝置 / 窄螢幕模式' : '桌上型電腦 / 寬螢幕模式'}
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter animate-pulse">Live</span>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-gray-500 mt-3 italic">「強制手機版」會在電腦畫面上呈現置中的行動端 HUD 容器。</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
