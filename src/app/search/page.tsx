'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import PostCard from '@/components/PostCard';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchPosts, getAllCategories, getAllTags } from '@/lib/notion';
import { Post, Category, Tag } from '@/types';

export default function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  // 加载侧边栏数据
  useEffect(() => {
    async function loadSidebarData() {
      try {
        const categoriesData = await getAllCategories();
        const tagsData = await getAllTags();
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error('加载侧边栏数据失败:', error);
      }
    }
    
    loadSidebarData();
  }, []);
  
  // 处理搜索
  useEffect(() => {
    async function performSearch() {
      if (!query) return;
      
      setIsLoading(true);
      try {
        const results = await searchPosts(query);
        setSearchResults(results);
      } catch (error) {
        console.error('搜索失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    performSearch();
  }, [query]);
  
  // 执行搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row gap-8">
        {/* 主内容区 */}
        <div className="md:w-3/4">
          <h1 className="text-3xl font-bold mb-6 flex items-center">
            <span className="mr-2">🔍</span> 搜索结果
          </h1>
          
          {/* 搜索框 */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索文章..."
                className="flex-grow border rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-r-md hover:bg-blue-700"
              >
                搜索
              </button>
            </form>
          </div>
          
          {/* 搜索结果 */}
          {query ? (
            <div>
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <svg className="animate-spin h-8 w-8 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-lg text-gray-600">搜索中...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  <p className="mb-4 text-gray-600">
                    找到 {searchResults.length} 个与 "{query}" 相关的结果
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {searchResults.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                  未找到与 "{query}" 相关的文章
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-700">
              请输入关键词搜索文章
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="md:w-1/4">
          <Sidebar 
            categories={categories} 
            tags={tags} 
          />
        </div>
      </div>
    </Layout>
  );
} 