'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Category, Tag } from '@/types';

interface ArticleSidebarProps {
  categories?: Category[];
  tags?: Tag[];
  tableOfContents?: Array<{ level: number; text: string; slug: string }>;
}

export default function ArticleSidebar({ 
  categories = [], 
  tags = [], 
  tableOfContents = [] 
}: ArticleSidebarProps) {
  const [activeTab, setActiveTab] = useState<'toc' | 'site'>('toc');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* 选项卡切换 */}
      <div className="flex border-b mb-4">
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'toc' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('toc')}
        >
          文章目录
        </button>
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'site' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('site')}
        >
          站点导航
        </button>
      </div>

      {/* 文章目录 */}
      {activeTab === 'toc' && (
        <div>
          {tableOfContents.length > 0 ? (
            <nav>
              <ul className="list-none">
                {tableOfContents.map((heading, index) => (
                  <li 
                    key={index} 
                    className="my-1"
                    style={{ paddingLeft: `${(heading.level - 1) * 1}rem` }}
                  >
                    <a 
                      href={`#${heading.slug}`} 
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <p className="text-gray-500 text-center py-4">该文章没有目录</p>
          )}
        </div>
      )}

      {/* 站点导航 */}
      {activeTab === 'site' && (
        <div className="space-y-6">
          {/* 分类导航 */}
          {categories.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center">
                <span className="mr-2">📚</span> 分类导航
              </h2>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.name}>
                    <Link 
                      href={`/categories/${encodeURIComponent(category.name)}`}
                      className="text-gray-600 hover:text-blue-600 flex items-center"
                    >
                      <span>• {category.name}</span>
                      <span className="ml-1 text-gray-400">({category.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 标签云 */}
          {tags && tags.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center">
                <span className="mr-2">🏷️</span> 标签云
              </h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link 
                    key={tag.name} 
                    href={`/tags/${encodeURIComponent(tag.name)}`}
                    className="text-sm bg-gray-100 hover:bg-blue-100 px-2 py-1 rounded-md text-gray-700 hover:text-blue-700"
                  >
                    {tag.name}({tag.count})
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 