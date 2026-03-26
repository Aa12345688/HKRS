import { Package, ScanLine, Settings as SettingsIcon, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation, Link } from 'react-router';
import { useInventoryStore } from '../../store/useInventoryStore';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isSidebarCollapsed = useInventoryStore(state => state.isSidebarCollapsed);
  const setSidebarCollapsed = useInventoryStore(state => state.setSidebarCollapsed);
  const layoutMode = useInventoryStore(state => state.layoutMode);

  const navItems = [
    { name: '掃瞄出入庫', path: '/', icon: ScanLine },
    { name: '產品庫存目錄', path: '/inventory', icon: Package },
    { name: '標籤條碼生成', path: '/barcode-test', icon: Tag },
    { name: '系統偏好設定', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Desktop Sidebar (Conditional) */}
      <aside className={`
        ${layoutMode === 'mobile' ? 'hidden' : ''}
        ${layoutMode === 'desktop' ? 'flex' : ''}
        ${layoutMode === 'auto' ? 'hidden md:flex' : ''}
        flex-col h-screen bg-[#0a0c10] border-r border-gray-800/60 fixed left-0 top-0 shadow-2xl overflow-y-auto transition-all duration-300 z-[60] 
        ${isSidebarCollapsed ? 'w-20' : 'w-64'}
      `}>
        <div className={`p-6 pb-4 relative ${isSidebarCollapsed ? 'px-4' : ''}`}>
          {/* Toggle Button */}
          <button 
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-8 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-[#0a0c10] hover:bg-blue-500 transition-colors z-50 shadow-lg"
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <div className="flex flex-col group cursor-default select-none transition-transform duration-300 hover:scale-105 origin-left">
            {/* H K R S typography mimicking the trademark */}
            <h1 
               className={`${isSidebarCollapsed ? 'text-[28px]' : 'text-[44px]'} leading-none font-black tracking-tighter text-white drop-shadow-sm transition-all duration-300`} 
               style={{ fontFamily: 'Impact, sans-serif', transform: 'skewX(-10deg)', letterSpacing: '-0.06em' }}
            >
              HK{!isSidebarCollapsed && <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-100 to-gray-400">RS</span>}
            </h1>
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2 mt-0.5" style={{ transform: 'skewX(-10deg)' }}>
                 <div className="h-1 w-6 bg-gray-100 rounded-full opacity-90 group-hover:w-10 transition-all duration-500"></div>
                 <p className="text-[11px] text-gray-300 font-bold tracking-[0.2em] uppercase italic">Racing Speed</p>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && (
            <div className="mt-6 border-t border-gray-800/80 pt-3 flex items-center gap-2 transition-all duration-300">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
               <p className="text-[10px] text-gray-500 font-bold tracking-[0.15em] uppercase">皇凱貿易 庫存系統</p>
            </div>
          )}
        </div>
        
        <nav className={`flex-1 px-4 space-y-1.5 mt-8 ${isSidebarCollapsed ? 'px-2' : ''}`}>
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link 
                key={item.name}
                to={item.path}
                title={isSidebarCollapsed ? item.name : ''}
                className={`group flex flex-row items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium outline-none focus:ring-2 focus:ring-blue-500/50
                  ${isSidebarCollapsed ? 'justify-center px-0' : ''}
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600/15 to-indigo-600/5 text-blue-400 font-bold border border-blue-500/10' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent'
                  }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors duration-300 ${isActive ? 'bg-blue-500/20' : 'bg-transparent group-hover:bg-gray-700/50'}`}>
                  <Icon size={isSidebarCollapsed ? 22 : 18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : ''} />
                </div>
                {!isSidebarCollapsed && <span className="truncate transition-all duration-300">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
        
        {/* User Card */}
        <div className={`p-4 m-4 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700 transition-all cursor-pointer ${isSidebarCollapsed ? 'm-2 p-2' : ''}`}>
          <div className="flex items-center gap-3">
             <div className={`rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transition-all ${isSidebarCollapsed ? 'w-8 h-8' : 'w-10 h-10'}`}>
               <span className={`${isSidebarCollapsed ? 'text-[10px]' : 'text-sm'} font-bold text-white tracking-widest`}>AD</span>
             </div>
             {!isSidebarCollapsed && (
               <div className="flex-1 min-w-0 transition-all duration-300">
                 <p className="text-sm font-bold text-gray-200 truncate">Admin</p>
                 <p className="text-xs text-gray-500 truncate mt-0.5">系統管理員 / 店長</p>
               </div>
             )}
          </div>
        </div>
      </aside>

      {/* Bottom Navigation Bar (Conditional) */}
      <nav className={`
        ${layoutMode === 'mobile' ? 'fixed' : ''}
        ${layoutMode === 'desktop' ? 'hidden' : ''}
        ${layoutMode === 'auto' ? 'md:hidden fixed' : ''}
        bottom-0 left-0 right-0 h-[72px] bg-[#0a0c10]/95 backdrop-blur-xl border-t border-gray-800/80 z-50 flex justify-center items-center px-1 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]
      `}>
        <div className="w-full max-w-lg flex justify-around items-center">
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
        </div>
      </nav>
    </>
  );
};
