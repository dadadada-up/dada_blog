import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Post } from '@/types';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  // 准备日期显示
  const formattedDate = post.publishDate 
    ? format(new Date(post.publishDate), 'yyyy-MM-dd')
    : '未发布';

  // 为分类选择对应的emoji
  const categoryEmojis: Record<string, string> = {
    '保险': '🔒',
    '技术工具': '🔧',
    '读书笔记': '📚',
    '产品经理': '📊',
    'AGI': '🤖',
    '前端框架': '🚗',
    '云计算': '☁️',
    '金融科技': '💰',
    '数据分析': '📈',
    'Web开发': '💻',
    '默认': '📄'
  };

  const categoryEmoji = categoryEmojis[post.category] || categoryEmojis['默认'];
  
  // 从文章内容中提取摘要
  const getExcerpt = () => {
    if (post.content) {
      // 从内容中提取纯文本，去除Markdown标记
      const plainText = post.content
        .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // 将链接替换为文本
        .replace(/[#*`_~]/g, '') // 移除Markdown标记符号
        .replace(/\n+/g, ' ') // 将多个换行替换为空格
        .trim();
      
      // 返回前150个字符作为摘要
      return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    }
    return '暂无摘要内容...';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/posts/${post.id}`} className="block">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{categoryEmoji}</span>
            <h2 className="text-xl font-semibold line-clamp-2 text-gray-800 hover:text-blue-600 transition-colors">
              {post.title}
            </h2>
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <span className="mr-3">📅 {formattedDate}</span>
            {post.category && (
              <span className="mr-3">🏷️ {post.category}</span>
            )}
          </div>
          {/* 固定高度的摘要区域，确保卡片大小一致 */}
          <div className="text-gray-600 line-clamp-3 h-18">
            {getExcerpt()}
          </div>
        </div>
      </Link>
    </div>
  );
} 