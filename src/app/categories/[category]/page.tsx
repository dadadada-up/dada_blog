import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import { getAllCategories, getAllTags, getPostsByCategory } from '@/lib/notion';

// 生成静态路径
export async function generateStaticParams() {
  try {
    const categories = await getAllCategories();
    
    // 如果获取到分类，则使用实际分类
    if (categories && categories.length > 0) {
      return categories.map((category) => ({
        category: category.name,
      }));
    }
  } catch (error) {
    console.error('生成分类路径参数失败:', error);
  }
  
  // 如果API调用失败或没有分类，提供默认分类
  return [
    { category: '保险' },
    { category: '技术工具' },
    { category: '读书笔记' },
    { category: '产品经理' },
    { category: 'AGI' }
  ];
}

export default async function CategoryPage({ 
  params 
}: { 
  params: { category: string } 
}) {
  const categoryName = decodeURIComponent(params.category);
  
  // 获取数据
  const posts = await getPostsByCategory(categoryName);
  const categories = await getAllCategories();
  const tags = await getAllTags();
  
  // 找到当前分类
  const currentCategory = categories.find(cat => cat.name === categoryName);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row gap-8">
        {/* 主内容区 */}
        <div className="md:w-3/4">
          <div className="flex items-center mb-8">
            <h1 className="text-3xl font-bold flex items-center">
              <span className="mr-2">📚</span> {categoryName}
            </h1>
            {currentCategory && (
              <span className="ml-2 text-gray-500">({currentCategory.count}篇文章)</span>
            )}
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              该分类下暂无文章
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