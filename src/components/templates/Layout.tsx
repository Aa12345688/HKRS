import React, { useEffect } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from '../organisms/Sidebar';
import { useInventoryStore } from '../../store/useInventoryStore';

export const Layout: React.FC = () => {
  const isSidebarCollapsed = useInventoryStore(state => state.isSidebarCollapsed);
  const theme = useInventoryStore(state => state.theme);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  return (
    <div className="filter-theme min-h-screen bg-[#050608] text-gray-100 font-sans selection:bg-blue-500/30 selection:text-white transition-all duration-300">
      <div className="no-print">
        <Sidebar />
      </div>
      <main className={`${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} p-4 md:p-8 pb-24 md:pb-8 min-h-screen print:ml-0 print:p-0 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto h-full relative print:max-w-none">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
