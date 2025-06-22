'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import PWAInstaller from './PWAInstaller';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: '首页' },
    { href: '/posts', label: '全部文章' },
    { href: '/categories', label: '分类' },
    { href: '/about', label: '博主' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow-sm py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold flex items-center">
            <span className="mr-2">🏠</span> 我的技术博客
          </Link>
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                  pathname === link.href ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-2">
            <Link
              href="/search"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="搜索"
            >
              <span className="mr-1">🔍</span>
              <span className="hidden md:inline">搜索</span>
            </Link>
            <ThemeToggle />
            <button
              className="md:hidden ml-4 text-gray-600 dark:text-gray-300"
              aria-label="Menu"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>

      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">我的技术博客</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                分享技术、产品和个人成长
              </p>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-12">
              <div className="mb-4 md:mb-0">
                <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">链接</h4>
                <ul className="space-y-2 text-sm">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">联系我</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="https://github.com/dadadada-up"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      GitHub
                    </a>
                  </li>
                  <li>
                    <span className="text-gray-600 dark:text-gray-300">
                      邮箱：dadadada_up@163.com
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} 我的技术博客. 保留所有权利。</p>
          </div>
        </div>
      </footer>
      
      {/* PWA安装提示 */}
      <PWAInstaller />
    </div>
  );
} 