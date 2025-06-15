import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import { getAllCategories, getAllTags, getPostsByTag } from '@/lib/notion';

// 生成静态路径
export async function generateStaticParams() {
  try {
    const tags = await getAllTags();
    
    // 如果获取到标签，则使用实际标签
    if (tags && tags.length > 0) {
      return tags.map((tag) => ({
        tag: tag.name,
      }));
    }
  } catch (error) {
    console.error('生成标签路径参数失败:', error);
  }
  
  // 如果API调用失败或没有标签，提供默认标签
  return [
    { tag: '前端' },
    { tag: '后端' },
    { tag: 'Node.js' },
    { tag: '金融科技' },
    { tag: '云计算' },
    { tag: '数字化转型' }
  ];
}

export default async function TagPage({ 
  params 
}: { 
  params: { tag: string } 
}) {
  const tagName = decodeURIComponent(params.tag);
  
  // 获取数据
  const posts = await getPostsByTag(tagName);
  const categories = await getAllCategories();
  const tags = await getAllTags();
  
  // 找到当前标签
  const currentTag = tags.find(t => t.name === tagName);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row gap-8">
        {/* 主内容区 */}
        <div className="md:w-3/4">
          <div className="flex items-center mb-8">
            <h1 className="text-3xl font-bold flex items-center">
              <span className="mr-2">🏷️</span> 标签: {tagName}
            </h1>
            {currentTag && (
              <span className="ml-2 text-gray-500">({currentTag.count}篇文章)</span>
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
              该标签下暂无文章
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