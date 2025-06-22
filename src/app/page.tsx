import Layout from '@/components/Layout';
import PostCard from '@/components/PostCard';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { getAllPosts, getAllCategories, getAllTags, getFeaturedPosts } from '@/lib/notion';
import { Post, Category, Tag } from '@/types';

// 使用服务器组件的异步数据获取
export default async function Home() {
  // 获取数据
  const posts = await getAllPosts();
  const categories = await getAllCategories();
  const tags = await getAllTags();
  
  // 直接从所有文章中筛选精选文章
  const featuredPosts = posts.filter(post => post.isFeatured === true);
  
  // 获取最新的6篇文章
  const recentPosts = posts.slice(0, 6);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row gap-8">
        {/* 主内容区 (3/4) */}
        <div className="md:w-3/4">
          {/* 精选文章模块 */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center text-gray-900 dark:text-gray-100">
                <span className="mr-2">⭐</span> 精选文章
              </h2>
            </div>
            {featuredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                {featuredPosts.slice(0, 4).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
                暂无精选文章，请在Notion数据库中将文章的"是否精选文章"字段设置为"是"
              </div>
            )}
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center text-gray-900 dark:text-gray-100">
                <span className="mr-2">📚</span> 最新文章
              </h2>
              <Link 
                href="/posts" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center"
              >
                全部文章 <span className="ml-1">»</span>
              </Link>
            </div>
            {recentPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
                暂无文章，请先同步Notion数据
              </div>
            )}
          </section>
        </div>

        {/* 侧边栏 (1/4) */}
        <div className="md:w-1/4">
          <Sidebar categories={categories} tags={tags} />
        </div>
      </div>
    </Layout>
  );
}
