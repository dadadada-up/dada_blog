'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { getAllPosts } from '@/lib/notion';
import { Post } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';

// 分类和状态选项
const statuses = ['全部', '已发布', '草稿'];

// 封面生成API选项
const coverApiOptions = [
  { id: 'default', name: 'Unsplash (默认)', endpoint: '/api/cover' },
  { id: 'alternate', name: 'Picsum Photos', endpoint: '/api/cover/alternate' }
];

export default function PostsManagement() {
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedStatus, setSelectedStatus] = useState('全部');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<string[]>(['全部']);
  const [generatingCover, setGeneratingCover] = useState<string | null>(null);
  const [selectedCoverApi, setSelectedCoverApi] = useState(coverApiOptions[0]);
  const [savingCover, setSavingCover] = useState<string | null>(null);
  const postsPerPage = 10;

  // 首次加载时获取文章列表
  useEffect(() => {
    fetchPosts();
  }, []);
  
  // 获取文章列表
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const allPosts = await getAllPosts(false); // 强制从服务器获取最新数据
      setPosts(allPosts);
      
      // 提取所有分类
      const uniqueCategories = Array.from(
        new Set(allPosts.map(post => post.category))
      );
      setCategories(['全部', ...uniqueCategories]);
    } catch (error) {
      console.error('获取文章失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 过滤文章
  const filteredPosts = posts.filter(post => {
    const matchesTitle = post.title.toLowerCase().includes(searchTitle.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || post.category === selectedCategory;
    const matchesStatus = selectedStatus === '全部' || post.status === selectedStatus;
    return matchesTitle && matchesCategory && matchesStatus;
  });

  // 分页
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // 处理搜索
  const handleSearch = () => {
    setCurrentPage(1);
  };

  // 重置过滤器
  const handleReset = () => {
    setSearchTitle('');
    setSelectedCategory('全部');
    setSelectedStatus('全部');
    setCurrentPage(1);
  };

  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MM-dd');
  };
  
  // 生成封面图片
  const generateCover = async (postId: string, title: string) => {
    setGeneratingCover(postId);
    try {
      // 第一步：获取背景图片URL
      const bgResponse = await fetch(selectedCoverApi.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      
      if (!bgResponse.ok) {
        throw new Error('获取背景图片失败');
      }
      
      const bgData = await bgResponse.json();
      
      // 第二步：使用背景图片URL生成带有标题的封面
      const coverResponse = await fetch('/api/cover/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title,
          imageUrl: bgData.imageUrl
        }),
      });
      
      if (!coverResponse.ok) {
        throw new Error('生成封面失败');
      }
      
      const coverData = await coverResponse.json();
      
      // 显示预览图像
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        // 直接写入HTML
        previewWindow.document.write(coverData.html);
        previewWindow.document.close();
        
        // 添加下载提示
        const infoDiv = previewWindow.document.createElement('div');
        infoDiv.style.position = 'fixed';
        infoDiv.style.bottom = '20px';
        infoDiv.style.left = '0';
        infoDiv.style.right = '0';
        infoDiv.style.textAlign = 'center';
        infoDiv.style.padding = '10px';
        infoDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
        infoDiv.style.color = 'white';
        infoDiv.style.fontSize = '14px';
        infoDiv.innerHTML = '请使用浏览器的截图功能保存此图片（或右键点击图片选择"保存图片"）';
        
        previewWindow.document.body.appendChild(infoDiv);
      }
      
      // 保存封面到Notion
      await saveCoverToNotion(postId, coverData.imageUrl);
      
      // 刷新文章列表以显示新封面
      fetchPosts();
      
    } catch (error) {
      console.error('生成封面失败:', error);
      alert('生成封面失败，请重试');
    } finally {
      setGeneratingCover(null);
    }
  };
  
  // 保存封面到Notion
  const saveCoverToNotion = async (postId: string, imageUrl: string) => {
    setSavingCover(postId);
    try {
      const response = await fetch('/api/cover/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, imageUrl }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存封面失败');
      }
      
      const data = await response.json();
      alert('封面已成功保存到Notion');
      return data;
    } catch (error) {
      console.error('保存封面到Notion失败:', error);
      alert('保存封面到Notion失败: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    } finally {
      setSavingCover(null);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">📚 文章列表</h1>
      
      {/* 搜索过滤器 */}
      <div className="mb-6 bg-white p-4 rounded-lg border">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-grow min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">文章标题</label>
            <input
              type="text"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder="搜索文章标题"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              查询
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              重置
            </button>
          </div>
        </div>
      </div>
      
      {/* 封面生成API选择 */}
      <div className="mb-6 bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-medium mb-2">封面生成设置</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">选择图片源</label>
            <select
              value={selectedCoverApi.id}
              onChange={(e) => {
                const selected = coverApiOptions.find(option => option.id === e.target.value);
                if (selected) setSelectedCoverApi(selected);
              }}
              className="border rounded-md px-3 py-2"
            >
              {coverApiOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <span className="text-sm text-gray-500">
              提示：点击"生成封面"按钮可以基于文章标题生成封面图片，多次点击可以获得不同的结果
            </span>
          </div>
        </div>
      </div>
      
      {/* 文章列表 */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">标题</th>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">分类</th>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">状态</th>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">发布日期</th>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">封面</th>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center">
                  <div className="flex justify-center items-center">
                    <svg className="animate-spin h-5 w-5 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    加载中...
                  </div>
                </td>
              </tr>
            ) : currentPosts.length > 0 ? (
              currentPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{post.title}</td>
                  <td className="py-3 px-4">{post.category}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        post.status === '已发布' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{formatDate(post.publishDate)}</td>
                  <td className="py-3 px-4">
                    {post.coverImage ? (
                      <div className="relative w-16 h-16 rounded overflow-hidden">
                        <img 
                          src={post.coverImage} 
                          alt={`${post.title} 封面`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>
                    ) : (
                      <span className="text-gray-400">无封面</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Link
                        href={`/posts/${post.id}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        [预览]
                      </Link>
                      <button
                        onClick={() => generateCover(post.id, post.title)}
                        disabled={generatingCover === post.id || savingCover === post.id}
                        className="text-green-600 hover:text-green-800 disabled:text-gray-400"
                      >
                        {generatingCover === post.id ? '[生成中...]' : 
                         savingCover === post.id ? '[保存中...]' : '[生成封面]'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-500">
                  没有找到匹配的文章
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* 分页 */}
      {filteredPosts.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            共 {filteredPosts.length} 条记录
          </div>
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 