import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { format } from 'date-fns';
import { getAllPosts, getAllCategories, getAllTags } from '@/lib/notion';
import { Post } from '@/types';

// 按年份分组文章
const groupPostsByYear = (posts: Post[]) => {
  const grouped: Record<string, Post[]> = {};
  
  posts.forEach(post => {
    if (post.publishDate) {
      const year = new Date(post.publishDate).getFullYear().toString();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(post);
    }
  });
  
  // 按年份降序排列
  return Object.keys(grouped)
    .sort((a, b) => parseInt(b) - parseInt(a))
    .map(year => ({
      year, 
      posts: grouped[year].sort((a, b) => {
        const dateA = a.publishDate ? new Date(a.publishDate).getTime() : 0;
        const dateB = b.publishDate ? new Date(b.publishDate).getTime() : 0;
        return dateB - dateA;
      })
    }));
};

export default async function AllPosts() {
  // 获取数据
  const posts = await getAllPosts();
  const categories = await getAllCategories();
  const tags = await getAllTags();
  
  // 按年份分组
  const postsByYear = groupPostsByYear(posts);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row gap-8">
        {/* 主内容区 */}
        <div className="md:w-3/4">
          <h1 className="text-3xl font-bold mb-8 flex items-center">
            <span className="mr-2">📚</span> 全部文章
          </h1>

          {postsByYear.length > 0 ? (
            <div className="space-y-12">
              {postsByYear.map(({ year, posts }) => (
                <div key={year} className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">{year}</h2>
                  <ul className="space-y-4">
                    {posts.map(post => (
                      <li key={post.id} className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center flex-wrap">
                            <Link 
                              href={`/posts/${post.id}`}
                              className="text-lg font-medium text-gray-800 hover:text-blue-600 mr-2"
                            >
                              {post.title}
                            </Link>
                            <span className="text-sm text-gray-500">
                              🏷️ {post.category}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 mt-2 sm:mt-0">
                          {post.publishDate ? format(new Date(post.publishDate), 'MM-dd') : '未发布'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              暂无文章，请先同步Notion数据
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