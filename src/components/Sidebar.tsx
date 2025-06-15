import React from 'react';
import Link from 'next/link';
import { Category, Tag } from '@/types';

interface SidebarProps {
  categories?: Category[];
  tags?: Tag[];
  showAuthor?: boolean;
}

export default function Sidebar({ categories = [], tags = [], showAuthor = true }: SidebarProps) {
  return (
    <div className="space-y-6">
      {/* 博主信息 */}
      {showAuthor && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-3 flex items-center">
            <span className="mr-2">👤</span> 博主简介
          </h2>
          <div className="space-y-2 text-gray-600 text-sm">
            <p><strong>昵称：</strong>达达</p>
            <p><strong>简介：</strong>资深中后端产品经理，AGI学习者/保险达人/产品设计</p>
            <p><strong>微信：</strong>dadadada_up</p>
            <p><strong>邮箱：</strong>dadadada_up@163.com</p>
          </div>
        </div>
      )}

      {/* 分类导航 */}
      {categories.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
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
        <div className="bg-white rounded-lg shadow p-6">
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
  );
} 