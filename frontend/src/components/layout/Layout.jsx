import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen relative" style={{ background: 'var(--surface-bg)' }}>
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />
      
      {/* Main Area */}
      <div 
        className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ml-0 ${collapsed ? 'md:ml-[68px]' : 'md:ml-64'}`}
      >
        <Header setMobileMenuOpen={setMobileMenuOpen} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
