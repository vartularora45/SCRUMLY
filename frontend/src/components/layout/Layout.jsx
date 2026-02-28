import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen transition-all duration-300">
                <Header />
                <main className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <div className="max-w-7xl mx-auto animate-fade-in w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
