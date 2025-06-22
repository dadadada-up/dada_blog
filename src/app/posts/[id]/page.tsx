'use client';

import Layout from '@/components/Layout';
import ArticleSidebar from '@/components/ArticleSidebar';
import LikeButton from '@/components/LikeButton';
import ShareButtons from '@/components/ShareButtons';
import Link from 'next/link';
import { format } from 'date-fns';
import { getAllPosts, getAllCategories, getAllTags, getPostById } from '@/lib/notion';
import { Metadata } from 'next';
import Markdown from 'react-markdown';
import React, { useEffect, useState } from 'react';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useParams } from 'next/navigation';
import { Post, Category, Tag } from '@/types';
import PageTracker from '@/components/PageTracker';
import OptimizedImage from '@/components/OptimizedImage';
import ShareButton from '@/components/ShareButton';
import MermaidBlock from '@/components/MermaidBlock';

// 从Markdown内容中提取标题生成目录
function generateTableOfContents(markdownContent: string) {
  if (!markdownContent) return [];
  
  // 匹配所有标题（# 到 ######）
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings = [];
  let match;
  
  while ((match = headingRegex.exec(markdownContent)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const slug = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s]/g, '') // 保留中文字符和英文字母数字
      .replace(/\s+/g, '-'); // 空格替换为连字符
    
    headings.push({
      level,
      text,
      slug,
    });
  }
  
  return headings;
}

// 自定义图片组件 - 使用优化的图片组件
const CustomImage = (props: any) => {
  return (
    <OptimizedImage
      src={props.src}
      alt={props.alt || ''}
      width={800}
      height={600}
      className="my-6 shadow-md"
    />
  );
};

// 代码块组件，带复制功能
const CodeBlock = ({ language, children }: { language: string, children: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    
    // 3秒后重置复制状态
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };
  
  return (
    <div className="relative">
      <div className="absolute right-2 top-2 z-10">
        <button
          onClick={handleCopy}
          className="bg-gray-700 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-500 text-white text-xs px-2 py-1 rounded transition-colors"
          title="复制代码"
        >
          {copied ? '已复制!' : '复制'}
        </button>
      </div>
      <SyntaxHighlighter
        style={tomorrow}
        language={language}
        PreTag="div"
        className="rounded-md my-4"
        customStyle={{
          backgroundColor: 'var(--tw-bg-opacity)' // 让背景色适应主题
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

export default function PostDetail() {
  const params = useParams();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableOfContents, setTableOfContents] = useState<any[]>([]);
  const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([]);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  
  // 获取数据
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // 获取文章详情
        const postData = await getPostById(postId);
        setPost(postData);
        
        // 生成目录
        if (postData?.content) {
          setTableOfContents(generateTableOfContents(postData.content));
        }
        
        // 获取分类和标签
        const categoriesData = await getAllCategories();
        const tagsData = await getAllTags();
        
        setCategories(categoriesData);
        setTags(tagsData);
        
        // 获取推荐文章
        if (postData) {
          const allPosts = await getAllPosts();
          // 排除当前文章
          const otherPosts = allPosts.filter(p => p.id !== postId);
          
          // 优先推荐同分类文章
          const sameCategoryPosts = otherPosts.filter(p => p.category === postData.category);
          
          // 如果同分类文章不足3篇，添加其他文章
          let recommended = sameCategoryPosts.slice(0, 3);
          if (recommended.length < 3) {
            // 添加一些相同标签的文章
            const sameTagPosts = otherPosts.filter(p => 
              p.tags.some(tag => postData.tags.includes(tag)) && 
              !recommended.find(r => r.id === p.id)
            );
            
            recommended = [...recommended, ...sameTagPosts].slice(0, 3);
            
            // 如果还不足3篇，添加随机文章
            if (recommended.length < 3) {
              const randomPosts = otherPosts
                .filter(p => !recommended.find(r => r.id === p.id))
                .sort(() => 0.5 - Math.random());
              
              recommended = [...recommended, ...randomPosts].slice(0, 3);
            }
          }
          
          setRecommendedPosts(recommended);
        }
      } catch (error) {
        console.error('获取文章数据失败:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [postId]);
  
  // 获取点赞数据
  useEffect(() => {
    async function fetchLikes() {
      try {
        const response = await fetch(`/api/likes?postId=${postId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setLikes(data.likes);
          }
        }
      } catch (error) {
        console.error('获取点赞数据失败:', error);
      }
    }
    
    fetchLikes();
    
    // 检查本地存储，判断用户是否已点赞
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
    setHasLiked(!!likedPosts[postId]);
  }, [postId]);
  
  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未知日期';
    return format(new Date(dateString), 'yyyy-MM-dd');
  };
  
  // 处理点赞
  const handleLike = async () => {
    if (hasLiked) return;
    
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          postId, 
          postTitle: post?.title || '未知文章' 
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLikes(data.likes);
          setHasLiked(true);
          
          // 保存到本地存储
          const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
          likedPosts[postId] = true;
          localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
        }
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };
  
  // 如果正在加载
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  // 如果文章不存在
  if (!post) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-10 text-center">
          <h1 className="text-3xl font-bold mb-4">文章不存在</h1>
          <p className="mb-6 text-gray-600">找不到您请求的文章</p>
          <Link 
            href="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            返回首页
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageTracker postId={postId} postTitle={post.title} />
      <div className="flex flex-col md:flex-row gap-8">
        {/* 主内容区 */}
        <div className="md:w-3/4">
          <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6 md:p-8">
              {/* 封面图片 */}
              {post.coverImage && (
                <div className="mb-6 -mx-8 -mt-8">
                  <OptimizedImage
                    src={post.coverImage}
                    alt={`${post.title} 封面`}
                    width={1200}
                    height={400}
                    priority={true}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}
              
              <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">{post.title}</h1>
              
              {/* 文章信息 */}
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <div>📅 发布于: {formatDate(post.publishDate)}</div>
                  <div>👀 阅读: {Math.floor(Math.random() * 2000)}</div> {/* 随机值，实际应使用阅读计数 */}
                  <div className="flex items-center">
                    <button 
                      onClick={handleLike}
                      disabled={hasLiked}
                      className={`flex items-center ${hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                    >
                      {hasLiked ? '❤️' : '🤍'} 
                      <span className="ml-1">{likes}</span>
                    </button>
                  </div>
                  <div>
                    <span className="mr-1">🏷️ 分类:</span>
                    <Link 
                      href={`/categories/${encodeURIComponent(post.category)}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      {post.category}
                    </Link>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap items-center">
                      <span className="mr-1">#标签:</span>
                      {post.tags.map((tag, index) => (
                        <Link
                          key={tag}
                          href={`/tags/${encodeURIComponent(tag)}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-2"
                        >
                          {tag}{index < post.tags.length - 1 ? ',' : ''}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* 分享按钮 */}
                <ShareButton title={post.title} />
              </div>
              
              <hr className="my-6 border-gray-200 dark:border-gray-700" />
              
              {/* 文章内容 */}
              <div className="prose prose-lg prose-blue max-w-none prose-headings:text-blue-700 prose-a:text-blue-600 prose-strong:font-bold prose-strong:text-gray-700 prose-li:my-1">
                {post.content ? (
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      img: CustomImage,
                      h1: ({node, children, ...props}) => {
                        const slug = children
                          ? String(children)
                              .toLowerCase()
                              .replace(/[^\w\u4e00-\u9fa5\s]/g, '')
                              .replace(/\s+/g, '-')
                          : '';
                        return <h1 id={slug} className="text-3xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2 mb-6 text-gray-900 dark:text-gray-100" {...props}>{children}</h1>;
                      },
                      h2: ({node, children, ...props}) => {
                        const slug = children
                          ? String(children)
                              .toLowerCase()
                              .replace(/[^\w\u4e00-\u9fa5\s]/g, '')
                              .replace(/\s+/g, '-')
                          : '';
                        return <h2 id={slug} className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100" {...props}>{children}</h2>;
                      },
                      h3: ({node, children, ...props}) => {
                        const slug = children
                          ? String(children)
                              .toLowerCase()
                              .replace(/[^\w\u4e00-\u9fa5\s]/g, '')
                              .replace(/\s+/g, '-')
                          : '';
                        return <h3 id={slug} className="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-gray-100" {...props}>{children}</h3>;
                      },
                      a: ({node, href, ...props}) => {
                        // 处理链接URL
                        let processedHref = href || '';
                        if (href && href.startsWith('/https:/')) {
                          processedHref = href.substring(1);
                        }
                        return <a href={processedHref} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 no-underline hover:underline" target="_blank" rel="noopener noreferrer" {...props} />;
                      },
                      ul: ({node, ...props}) => <ul className="list-disc pl-6 my-4 text-gray-900 dark:text-gray-100" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-4 text-gray-900 dark:text-gray-100" {...props} />,
                      li: ({node, ...props}) => <li className="mb-2 text-gray-900 dark:text-gray-100" {...props} />,
                      p: ({node, children, ...props}) => {
                        // 检查是否包含图片元素
                        const hasImage = React.Children.toArray(children).some(
                          (child: any) => 
                            typeof child === 'object' && 
                            child !== null && 
                            'type' in child && 
                            (child.type === 'img' || child.type === CustomImage)
                        );
                        
                        // 如果包含图片，使用div而不是p标签
                        if (hasImage) {
                          // 使用div包装整个内容
                          return <div className="my-4" {...props}>{children}</div>;
                        }
                        
                        // 正常的段落渲染
                        return <p className="my-4 leading-relaxed text-gray-900 dark:text-gray-100" {...props}>{children}</p>;
                      },
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2 my-4 bg-gray-50 dark:bg-gray-700 italic text-gray-900 dark:text-gray-100" {...props} />
                      ),
                      table: ({node, ...props}) => (
                        <div className="overflow-x-auto my-6">
                          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props} />
                        </div>
                      ),
                      th: ({node, ...props}) => (
                        <th className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-4 py-2 text-left text-gray-900 dark:text-gray-100" {...props} />
                      ),
                      td: ({node, ...props}) => (
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-gray-100" {...props} />
                      ),
                      code: ({node, className, children, ...props}) => {
                        // 内联代码
                        if (!className) {
                          return <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-red-600 dark:text-red-400" {...props}>{children}</code>;
                        }
                        // 代码块
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';
                        const codeContent = String(children).replace(/\n$/, '');
                        
                        // 检查是否是Mermaid图表
                        if (language === 'mermaid') {
                          return <MermaidBlock code={codeContent} />;
                        }
                        
                        return (
                          <CodeBlock language={language} children={codeContent} />
                        );
                      },
                      // 不直接渲染pre标签，因为SyntaxHighlighter会处理
                      pre: ({children}) => <>{children}</>,
                    }}
                  >
                    {post.content}
                  </Markdown>
                ) : (
                  <p className="text-center text-gray-500 py-8">文章内容加载中...</p>
                )}
              </div>
              
              <hr className="my-8 border-gray-200 dark:border-gray-700" />
              
              {/* 互动按钮 */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <LikeButton postId={post.id} />
                <ShareButtons 
                  title={post.title} 
                  url={typeof window !== 'undefined' ? window.location.href : ''}
                />
              </div>
              
              {/* 评论区 */}
              <div className="mt-8">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <p className="text-gray-600 dark:text-gray-300 text-center">评论功能暂未开启，敬请期待</p>
                </div>
              </div>
              
              {/* 推荐文章 */}
              {recommendedPosts.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">📚 相关文章推荐</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                      {recommendedPosts.map(post => (
                        <li key={post.id} className="py-3">
                          <Link 
                            href={`/posts/${post.id}`} 
                            className="flex items-start hover:text-blue-600 dark:hover:text-blue-400 text-gray-900 dark:text-gray-100"
                          >
                            <span className="text-gray-400 dark:text-gray-500 mr-2">•</span>
                            <div>
                              <span className="font-medium">{post.title}</span>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {post.category} · {formatDate(post.publishDate)}
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>

        {/* 侧边栏 */}
        <div className="md:w-1/4">
          <ArticleSidebar 
            categories={categories} 
            tags={tags}
            tableOfContents={tableOfContents}
          />
        </div>
      </div>
    </Layout>
  );
} 