import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { getAllCategories, getAllTags } from '@/lib/notion';

export default async function Categories() {
  // 获取数据
  const categories = await getAllCategories();
  const tags = await getAllTags();

  return (
    <Layout>
      <div className="flex flex-col md:flex-row gap-8">
        {/* 主内容区 */}
        <div className="md:w-3/4">
          <h1 className="text-3xl font-bold mb-8 flex items-center text-gray-900 dark:text-gray-100">
            <span className="mr-2">📚</span> 全部分类
          </h1>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/categories/${encodeURIComponent(category.name)}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="font-medium text-lg text-gray-800 dark:text-gray-200 flex justify-between items-center">
                    <span>{category.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">({category.count})</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
              暂无分类，请先同步Notion数据
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="md:w-1/4">
          <Sidebar categories={categories} tags={tags} />
        </div>
      </div>
    </Layout>
  );
} 