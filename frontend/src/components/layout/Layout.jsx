import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => (
  <div className="flex min-h-screen" style={{ background: 'var(--surface-bg)' }}>
    <Sidebar />
    {/* Main area — the left margin is handled by pl-64 / pl-[68px], but since sidebar
        is fixed we just need the right-side content to fill remaining space */}
    <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: '256px', transition: 'margin-left 0.3s ease' }}>
      <Header />
      <main className="flex-1 px-6 py-6 md:px-8 md:py-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  </div>
);

export default Layout;
