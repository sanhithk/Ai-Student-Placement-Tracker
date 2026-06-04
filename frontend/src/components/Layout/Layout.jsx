import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import PageTransition from './PageTransition';

const Layout = () => {
  const location = useLocation();
  
  return (
    <div className="flex min-h-screen font-sans bg-transparent">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </div>
      </main>
    </div>
  );
};

export default Layout;
