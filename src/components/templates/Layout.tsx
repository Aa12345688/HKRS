import React, { useEffect } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from '../organisms/Sidebar';
import { useInventoryStore } from '../../store/useInventoryStore';

export const Layout: React.FC = () => {
  const layoutMode = useInventoryStore(state => state.layoutMode);
  const isSidebarCollapsed = useInventoryStore(state => state.isSidebarCollapsed);
  const theme = useInventoryStore(state => state.theme);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Determine layout styles
  const isMobileView = layoutMode === 'mobile' || (layoutMode === 'auto' && typeof window !== 'undefined' && window.innerWidth < 768);
  const isDesktopView = layoutMode === 'desktop' || (layoutMode === 'auto' && typeof window !== 'undefined' && window.innerWidth >= 768);

  const mainClasses = `
    transition-all duration-300 min-h-screen print:ml-0 print:p-0
    ${layoutMode === 'mobile' ? 'flex justify-center p-0 md:p-4 pb-24 md:pb-24' : ''}
    ${layoutMode === 'desktop' ? `${isSidebarCollapsed ? 'ml-20' : 'ml-64'} p-4 md:p-8 pb-24 md:pb-8` : ''}
    ${layoutMode === 'auto' ? 'md:ml-64 p-4 md:p-8 pb-24 md:pb-8 flex md:block justify-center md:justify-start' : ''}
  `;

  return (
    <div className="filter-theme min-h-screen bg-[#050608] text-gray-100 font-sans selection:bg-blue-500/30 selection:text-white transition-all duration-300">
      <div className="no-print">
        <Sidebar />
      </div>
      <main className={mainClasses}>
        <div className={`
          ${layoutMode === 'mobile' ? 'w-full max-w-lg bg-[#0a0c10] min-h-screen shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-gray-800/30' : ''}
          ${layoutMode === 'auto' ? 'max-w-none mx-0 h-full relative print:max-w-none' : ''}
          ${layoutMode === 'desktop' ? 'max-w-none mx-0 h-full relative print:max-w-none' : ''}
          relative h-full
        `}>
          <div className={`${layoutMode === 'mobile' ? 'p-4 md:p-6' : ''} h-full relative`}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
