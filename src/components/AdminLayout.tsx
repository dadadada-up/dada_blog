'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  
  const navLinks = [
    { href: '/admin', label: '仪表盘', icon: '📊' },
    { href: '/admin/posts', label: '文章管理', icon: '📝' },
    { href: '/admin/sync', label: 'Notion同步', icon: '🔄' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <Link href="/admin" className="text-xl font-bold flex items-center">
            <span className="mr-2">⚡</span> 博客管理后台
          </Link>
        </div>
      </header>
      
      <div className="flex-grow flex flex-col md:flex-row container mx-auto px-4 py-6">
        {/* 侧边导航栏 */}
        <aside className="md:w-48 md:mr-8 mb-6 md:mb-0">
          <nav className="bg-white shadow-sm rounded-lg overflow-hidden">
            <ul>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center px-4 py-3 hover:bg-gray-50 border-l-4 ${
                        isActive 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-transparent text-gray-700'
                      }`}
                    >
                      <span className="mr-3">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
        
        {/* 主内容区 */}
        <main className="flex-1 bg-white rounded-lg shadow-sm p-6">
          {children}
        </main>
      </div>
      
      <footer className="bg-white border-t py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} 博客管理系统
        </div>
      </footer>
    </div>
  );
} 