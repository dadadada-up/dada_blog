import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { Post } from '@/types';

// 为了在客户端和服务器端都能使用，我们需要条件导入fs和path
let fs: any = null;
let path: any = null;
let CACHE_DIR: string = '';
let POSTS_CACHE_FILE: string = '';
let LAST_SYNC_FILE: string = '';

// 检查是否在服务器端
const isServer = typeof window === 'undefined';

// Notion 客户端初始化 - 仅在服务器端
let notionClient: any = null;
let n2m: any = null;

// 异步初始化服务器端资源
if (isServer) {
  // 使用动态导入代替require
  Promise.all([
    import('fs'),
    import('path')
  ]).then(([fsModule, pathModule]) => {
    fs = fsModule.default;
    path = pathModule.default;
    CACHE_DIR = path.join(process.cwd(), '.cache');
    POSTS_CACHE_FILE = path.join(CACHE_DIR, 'posts.json');
    LAST_SYNC_FILE = path.join(CACHE_DIR, 'last_sync.json');
    
    // 初始化Notion客户端
    notionClient = new Client({
      auth: process.env.NOTION_API_KEY,
    });
    
    // 转换成 Markdown 工具
    n2m = new NotionToMarkdown({ notionClient });
  }).catch(err => {
    console.error('初始化服务器端资源失败:', err);
  });
}

// 内存缓存
let postsCache: Post[] = [];
let lastSyncInfo: { time: string; status: string; message: string } | null = null;

// 确保缓存目录存在
function ensureCacheDir() {
  if (isServer && fs) {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  }
}

// 从缓存中读取文章数据
export function getPostsFromCache(): Post[] {
  // 如果已有内存缓存，直接使用
  if (postsCache.length > 0) {
    return postsCache;
  }

  // 否则尝试从文件缓存读取（仅服务器端）
  if (isServer && fs) {
    try {
      ensureCacheDir();
      if (fs.existsSync(POSTS_CACHE_FILE)) {
        const data = fs.readFileSync(POSTS_CACHE_FILE, 'utf-8');
        postsCache = JSON.parse(data);
        return postsCache;
      }
    } catch (error) {
      console.error('读取缓存失败:', error);
    }
  }
  return [];
}

// 将文章数据写入缓存
export function savePostsToCache(posts: Post[]) {
  // 更新内存缓存
  postsCache = posts;

  // 更新文件缓存（仅服务器端）
  if (isServer && fs) {
    try {
      ensureCacheDir();
      fs.writeFileSync(POSTS_CACHE_FILE, JSON.stringify(posts, null, 2));
    } catch (error) {
      console.error('写入缓存失败:', error);
    }
  }
}

// 记录最后同步时间
export function saveLastSyncInfo(info: { time: string; status: string; message: string }) {
  // 更新内存缓存
  lastSyncInfo = info;

  // 更新文件缓存（仅服务器端）
  if (isServer && fs) {
    try {
      ensureCacheDir();
      fs.writeFileSync(LAST_SYNC_FILE, JSON.stringify(info, null, 2));
    } catch (error) {
      console.error('保存同步信息失败:', error);
    }
  }
}

// 获取最后同步信息
export function getLastSyncInfo(): { time: string; status: string; message: string } | null {
  // 如果已有内存缓存，直接使用
  if (lastSyncInfo) {
    return lastSyncInfo;
  }

  // 否则尝试从文件缓存读取（仅服务器端）
  if (isServer && fs) {
    try {
      ensureCacheDir();
      if (fs.existsSync(LAST_SYNC_FILE)) {
        const data = fs.readFileSync(LAST_SYNC_FILE, 'utf-8');
        lastSyncInfo = JSON.parse(data);
        return lastSyncInfo;
      }
    } catch (error) {
      console.error('读取同步信息失败:', error);
    }
  }
  return null;
}

// 从 Notion 获取所有文章
export async function getAllPosts(useCache = true): Promise<Post[]> {
  // 在客户端环境下，通过API获取数据
  if (!isServer) {
    try {
      const response = await fetch('/api/posts');
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('获取文章失败:', error);
      return [];
    }
  }
  
  // 服务器端逻辑
  // 如果启用缓存且缓存存在，则使用缓存数据
  if (useCache) {
    const cachedPosts = getPostsFromCache();
    if (cachedPosts.length > 0) {
      return cachedPosts;
    }
  }

  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!databaseId) {
      throw new Error('NOTION_DATABASE_ID 环境变量未设置');
    }
    
    const response = await notionClient.databases.query({
      database_id: databaseId,
      filter: {
        property: '状态',
        select: {
          equals: '已发布',
        },
      },
      sorts: [
        {
          property: '发布日期',
          direction: 'descending',
        },
      ],
    });

    const posts = response.results.map((page: any) => {
      return formatPostFromNotion(page);
    });

    // 保存到缓存
    savePostsToCache(posts);
    saveLastSyncInfo({
      time: new Date().toISOString(),
      status: '成功',
      message: `同步了 ${posts.length} 篇文章`
    });

    return posts;
  } catch (error) {
    console.error('获取文章失败:', error);
    
    // 记录同步失败信息
    saveLastSyncInfo({
      time: new Date().toISOString(),
      status: '失败',
      message: `同步失败: ${error instanceof Error ? error.message : String(error)}`
    });
    
    // 如果API调用失败，尝试使用缓存数据
    return getPostsFromCache();
  }
}

// 根据 ID 获取单篇文章
export async function getPostById(pageId: string): Promise<Post | null> {
  // 在客户端环境下，通过API获取数据
  if (!isServer) {
    try {
      const response = await fetch(`/api/posts/${pageId}`);
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`获取文章 ${pageId} 失败:`, error);
      return null;
    }
  }
  
  // 服务器端逻辑
  try {
    // 先从缓存检查是否有该文章
    const cachedPosts = getPostsFromCache();
    const cachedPost = cachedPosts.find(post => post.id === pageId);
    
    // 如果缓存有这篇文章且已有内容，则直接返回
    if (cachedPost && cachedPost.content) {
      return cachedPost;
    }
    
    // 从Notion API获取文章详情
    const page = await notionClient.pages.retrieve({ page_id: pageId });
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const mdString = n2m.toMarkdownString(mdBlocks);
    
    // 处理Markdown内容
    let content = mdString.parent;
    
    // 处理图片URL
    content = content.replace(/!\[(.*?)\]\(([^)]+)\)/g, (match: string, alt: string, url: string) => {
      // 修复语雀图片URL格式问题
      if (url.startsWith('/https:/')) {
        url = url.substring(1);
      }
      
      // 处理语雀图片URL
      if (url.includes('cdn.nlark.com') || url.includes('yuque')) {
        // 确保URL格式正确
        if (url.indexOf('https:/') === 0 && url.indexOf('https://') !== 0) {
          url = url.replace('https:/', 'https://');
        }
      }
      
      return `![${alt}](${url})`;
    });
    
    // 提取文章摘要
    let excerpt = '';
    if (content) {
      // 移除Markdown标记和图片
      const plainText = content
        .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // 将链接替换为纯文本
        .replace(/#{1,6}\s+.*?\n/g, '') // 移除标题
        .replace(/(\*\*|__)(.*?)\1/g, '$2') // 移除加粗
        .replace(/(\*|_)(.*?)\1/g, '$2') // 移除斜体
        .replace(/`{1,3}.*?`{1,3}/g, '') // 移除代码
        .replace(/^\s*[-*+]\s+/gm, '') // 移除列表标记
        .replace(/^\s*\d+\.\s+/gm, '') // 移除有序列表标记
        .replace(/\n{2,}/g, '\n') // 将多个换行替换为单个换行
        .trim();
      
      // 提取前200个字符作为摘要
      excerpt = plainText.slice(0, 200) + (plainText.length > 200 ? '...' : '');
    }
    
    const post = {
      ...formatPostFromNotion(page),
      content: content,
      excerpt: excerpt
    };
    
    // 更新缓存中的文章内容
    if (cachedPost) {
      const updatedPosts = cachedPosts.map(p => 
        p.id === pageId ? { ...p, content: post.content, excerpt: post.excerpt } : p
      );
      savePostsToCache(updatedPosts);
    }
    
    return post;
  } catch (error) {
    console.error(`获取文章 ${pageId} 失败:`, error);
    
    // 如果API调用失败，尝试从缓存获取
    const cachedPosts = getPostsFromCache();
    return cachedPosts.find(post => post.id === pageId) || null;
  }
}

// 将 Notion 页面格式化为博客文章
function formatPostFromNotion(page: any): Post {
  const properties = page.properties;
  
  // 处理封面图片
  let coverImage = null;
  
  // 检查是否有封面字段
  if (properties['封面'] && properties['封面'].files && properties['封面'].files.length > 0) {
    const coverFile = properties['封面'].files[0];
    
    // 处理外部URL类型的封面
    if (coverFile.type === 'external' && coverFile.external) {
      coverImage = coverFile.external.url;
    }
    // 处理Notion内部文件类型的封面
    else if (coverFile.type === 'file' && coverFile.file) {
      coverImage = coverFile.file.url;
    }
  }
  
  // 处理精选文章字段
  let isFeatured = false;
  if (properties['是否精选文章'] && properties['是否精选文章'].select) {
    isFeatured = properties['是否精选文章'].select.name === '是';
  }
  
  return {
    id: page.id,
    title: properties['文档名称']?.title?.[0]?.plain_text || '无标题',
    category: properties['分类']?.select?.name || '未分类',
    tags: properties['标签']?.multi_select?.map((tag: any) => tag.name) || [],
    status: properties['状态']?.select?.name || '草稿',
    author: properties['作者']?.select?.name || 'dada',
    publishDate: properties['发布日期']?.date?.start || null,
    updateDate: page.last_edited_time || null,
    originalUrl: properties['原文链接']?.url || null,
    coverImage: coverImage,
    isFeatured: isFeatured,
  };
}

// 获取所有分类
export async function getAllCategories(): Promise<{ name: string; count: number }[]> {
  // 在客户端环境下，通过API获取数据
  if (!isServer) {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('获取分类失败:', error);
      return [];
    }
  }
  
  // 服务器端逻辑
  try {
    const posts = await getAllPosts();
    
    // 按分类统计文章数量
    const categoryCounts: Record<string, number> = {};
    posts.forEach(post => {
      const category = post.category || '未分类';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // 转换为数组格式
    const categories = Object.keys(categoryCounts)
      .filter(category => category !== '未分类')
      .map(name => ({
        name,
        count: categoryCounts[name]
      }))
      .sort((a, b) => b.count - a.count);
      
    return categories;
  } catch (error) {
    console.error('获取分类失败:', error);
    return [];
  }
}

// 获取所有标签
export async function getAllTags(): Promise<{ name: string; count: number }[]> {
  // 在客户端环境下，通过API获取数据
  if (!isServer) {
    try {
      const response = await fetch('/api/tags');
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('获取标签失败:', error);
      return [];
    }
  }
  
  // 服务器端逻辑
  try {
    const posts = await getAllPosts();
    
    // 按标签统计文章数量
    const tagCounts: Record<string, number> = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    // 转换为数组格式
    const tags = Object.keys(tagCounts)
      .map(name => ({
        name,
        count: tagCounts[name]
      }))
      .sort((a, b) => b.count - a.count);
      
    return tags;
  } catch (error) {
    console.error('获取标签失败:', error);
    return [];
  }
}

// 按分类获取文章
export async function getPostsByCategory(categoryName: string): Promise<Post[]> {
  // 在客户端环境下，通过API获取数据
  if (!isServer) {
    try {
      const response = await fetch(`/api/categories/${encodeURIComponent(categoryName)}`);
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`获取分类 ${categoryName} 的文章失败:`, error);
      return [];
    }
  }
  
  // 服务器端逻辑
  try {
    const posts = await getAllPosts();
    return posts.filter(post => post.category === categoryName);
  } catch (error) {
    console.error(`获取分类 ${categoryName} 的文章失败:`, error);
    return [];
  }
}

// 按标签获取文章
export async function getPostsByTag(tagName: string): Promise<Post[]> {
  // 在客户端环境下，通过API获取数据
  if (!isServer) {
    try {
      const response = await fetch(`/api/tags/${encodeURIComponent(tagName)}`);
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`获取标签 ${tagName} 的文章失败:`, error);
      return [];
    }
  }
  
  // 服务器端逻辑
  try {
    const posts = await getAllPosts();
    return posts.filter(post => post.tags.includes(tagName));
  } catch (error) {
    console.error(`获取标签 ${tagName} 的文章失败:`, error);
    return [];
  }
}

// 获取精选文章
export async function getFeaturedPosts(): Promise<Post[]> {
  // 在客户端环境下，通过API获取数据
  if (!isServer) {
    try {
      const response = await fetch('/api/featured');
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('获取精选文章失败:', error);
      return [];
    }
  }
  
  // 服务器端逻辑
  try {
    const posts = await getAllPosts();
    return posts.filter(post => post.isFeatured === true);
  } catch (error) {
    console.error('获取精选文章失败:', error);
    return [];
  }
}

// 搜索文章
export async function searchPosts(keyword: string): Promise<Post[]> {
  // 在客户端环境下，通过API获取数据
  if (!isServer) {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`);
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`搜索关键词 ${keyword} 失败:`, error);
      return [];
    }
  }
  
  // 服务器端逻辑
  try {
    const posts = await getAllPosts();
    
    if (!keyword.trim()) {
      return [];
    }
    
    const lowercasedKeyword = keyword.toLowerCase();
    
    return posts.filter(post => 
      post.title.toLowerCase().includes(lowercasedKeyword) || 
      post.category.toLowerCase().includes(lowercasedKeyword) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowercasedKeyword))
    );
  } catch (error) {
    console.error(`搜索关键词 ${keyword} 失败:`, error);
    return [];
  }
}

// 强制同步 Notion 数据
export async function syncNotionData(): Promise<{ success: boolean; message: string }> {
  // 在客户端环境下，通过API触发同步
  if (!isServer) {
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return { 
        success: false, 
        message: `同步失败: ${errorMsg}` 
      };
    }
  }
  
  // 服务器端逻辑
  try {
    // 强制从 Notion 获取最新数据（不使用缓存）
    const posts = await getAllPosts(false);
    
    // 更新最后同步时间
    const now = new Date();
    const syncInfo = {
      time: now.toISOString(),
      status: '成功',
      message: `同步成功，获取了 ${posts.length} 篇文章`
    };
    saveLastSyncInfo(syncInfo);
    
    return { 
      success: true, 
      message: syncInfo.message 
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    // 记录同步失败信息
    const syncInfo = {
      time: new Date().toISOString(),
      status: '失败',
      message: `同步失败: ${errorMsg}`
    };
    saveLastSyncInfo(syncInfo);
    
    return { 
      success: false, 
      message: `同步失败: ${errorMsg}` 
    };
  }
} 