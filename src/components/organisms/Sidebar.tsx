import React from 'react';
import { Package, ScanLine, Settings as SettingsIcon, Tag } from 'lucide-react';
import { useLocation, Link } from 'react-router';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: '掃瞄出入庫', path: '/', icon: ScanLine },
    { name: '產品庫存目錄', path: '/inventory', icon: Package },
    { name: '標籤條碼生成', path: '/barcode-test', icon: Tag },
    { name: '系統偏好設定', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-[#0a0c10] border-r border-gray-800/60 fixed left-0 top-0 shadow-2xl overflow-y-auto">
        <div className="p-6 pb-4">
          <div className="flex flex-col group cursor-default select-none transition-transform duration-300 hover:scale-105 origin-left">
            {/* H K R S typography mimicking the trademark */}
            <h1 
               className="text-[44px] leading-none font-black tracking-tighter text-white drop-shadow-sm" 
               style={{ fontFamily: 'Impact, sans-serif', transform: 'skewX(-10deg)', letterSpacing: '-0.06em' }}
            >
              HK<span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-100 to-gray-400">RS</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5" style={{ transform: 'skewX(-10deg)' }}>
               <div className="h-1 w-6 bg-gray-100 rounded-full opacity-90 group-hover:w-10 transition-all duration-500"></div>
               <p className="text-[11px] text-gray-300 font-bold tracking-[0.2em] uppercase italic">Racing Speed</p>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-800/80 pt-3 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
             <p className="text-[10px] text-gray-500 font-bold tracking-[0.15em] uppercase">皇凱貿易 庫存系統</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-8">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link 
                key={item.name}
                to={item.path}
                className={`group flex flex-row items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium outline-none focus:ring-2 focus:ring-blue-500/50
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600/15 to-indigo-600/5 text-blue-400 font-bold border border-blue-500/10' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent'
                  }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors duration-300 ${isActive ? 'bg-blue-500/20' : 'bg-transparent group-hover:bg-gray-700/50'}`}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : ''} />
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        {/* User Card */}
        <div className="p-4 m-4 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
               <span className="text-sm font-bold text-white tracking-widest">AD</span>
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-gray-200 truncate">Admin</p>
               <p className="text-xs text-gray-500 truncate mt-0.5">系統管理員 / 店長</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-[#0a0c10]/95 backdrop-blur-xl border-t border-gray-800/80 z-50 flex justify-around items-center px-1 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link 
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-colors duration-300 select-none
                ${isActive ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}
              `}
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-full shadow-[0_2px_10px_rgba(59,130,246,0.5)]"></div>
              )}
              <Icon size={isActive ? 22 : 24} strokeWidth={isActive ? 2.5 : 2} className={`transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] -translate-y-0.5' : ''}`} />
              <span className={`text-[10px] tracking-wide transition-all ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
