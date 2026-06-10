import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import PageTransition from './PageTransition';
import { Menu, Compass } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen font-sans bg-transparent">
      {/* Mobile Header Top Bar */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40 px-4 flex justify-between items-center transition-colors duration-300">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Compass className="text-primary-500" size={24} />
          Placement AI
        </h1>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-2"
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Sidebar Wrapper */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 dark:bg-slate-900/80 backdrop-blur-sm z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 pt-20 md:p-8 md:pt-8 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto w-full">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </div>
      </main>
    </div>
  );
};

export default Layout;
