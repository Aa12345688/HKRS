import React, { useEffect } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from '../organisms/Sidebar';
import { useInventoryStore } from '../../store/useInventoryStore';

export const Layout: React.FC = () => {
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
      <main className="flex justify-center p-0 md:p-4 pb-24 md:pb-24 min-h-screen print:ml-0 print:p-0 transition-all duration-300">
        <div className="w-full max-w-lg bg-[#0a0c10] min-h-screen shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-gray-800/30 relative">
          <div className="p-4 md:p-6 h-full relative">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
