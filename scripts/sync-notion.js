// 用于在GitHub Actions中同步Notion数据的脚本
const { Client } = require('@notionhq/client');
const { NotionToMarkdown } = require('notion-to-md');
const fs = require('fs');
const path = require('path');

// 确保缓存目录存在
const CACHE_DIR = path.join(process.cwd(), '.cache');
const POSTS_CACHE_FILE = path.join(CACHE_DIR, 'posts.json');
const LAST_SYNC_FILE = path.join(CACHE_DIR, 'last_sync.json');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// 初始化Notion客户端
const notionClient = new Client({
  auth: process.env.NOTION_API_KEY,
});

// 转换成Markdown工具
const n2m = new NotionToMarkdown({ notionClient });

// 格式化Notion页面为博客文章
function formatPostFromNotion(page) {
  const properties = page.properties;
  
  // 获取标题
  const title = properties.标题?.title?.[0]?.plain_text || '无标题';
  
  // 获取分类
  const category = properties.分类?.select?.name || '未分类';
  
  // 获取标签
  const tags = properties.标签?.multi_select?.map(tag => tag.name) || [];
  
  // 获取状态
  const status = properties.状态?.select?.name || '草稿';
  
  // 获取作者
  const author = properties.作者?.rich_text?.[0]?.plain_text || '匿名';
  
  // 获取发布日期
  const publishDate = properties.发布日期?.date?.start || null;
  
  // 获取更新日期
  const updateDate = properties.更新日期?.date?.start || null;
  
  // 获取原文链接
  const originalUrl = properties.原文链接?.url || null;
  
  // 获取封面图片
  const coverImage = page.cover?.external?.url || page.cover?.file?.url || null;
  
  // 获取摘要
  const excerpt = properties.摘要?.rich_text?.[0]?.plain_text || '';
  
  return {
    id: page.id,
    title,
    category,
    tags,
    status,
    author,
    publishDate,
    updateDate,
    originalUrl,
    coverImage,
    excerpt,
  };
}

async function syncNotionData() {
  console.log('开始同步Notion数据...');
  
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!databaseId) {
      throw new Error('NOTION_DATABASE_ID 环境变量未设置');
    }
    
    console.log(`使用数据库ID: ${databaseId}`);
    
    // 查询所有文章
    const response = await notionClient.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: '发布日期',
          direction: 'descending',
        },
      ],
    });
    
    console.log(`获取到 ${response.results.length} 篇文章`);
    
    // 处理每篇文章
    const posts = [];
    
    for (const page of response.results) {
      const post = formatPostFromNotion(page);
      
      // 获取文章内容
      try {
        const mdBlocks = await n2m.pageToMarkdown(page.id);
        const mdString = n2m.toMarkdownString(mdBlocks);
        
        // 处理Markdown内容
        let content = mdString.parent;
        
        // 处理图片URL
        content = content.replace(/!\[(.*?)\]\(([^)]+)\)/g, (match, alt, url) => {
          // 修复语雀图片URL格式问题
          if (url.startsWith('/https:/')) {
            url = url.substring(1);
          }
          return `![${alt}](${url})`;
        });
        
        post.content = content;
      } catch (error) {
        console.error(`获取文章 ${post.id} 内容失败:`, error);
        post.content = '内容获取失败';
      }
      
      posts.push(post);
      console.log(`处理文章: ${post.title}`);
    }
    
    // 保存到缓存
    fs.writeFileSync(POSTS_CACHE_FILE, JSON.stringify(posts, null, 2));
    
    // 记录同步时间
    const syncInfo = {
      time: new Date().toISOString(),
      status: '成功',
      message: `同步了 ${posts.length} 篇文章`
    };
    fs.writeFileSync(LAST_SYNC_FILE, JSON.stringify(syncInfo, null, 2));
    
    console.log('同步完成!');
    return { success: true, message: syncInfo.message };
  } catch (error) {
    console.error('同步失败:', error);
    
    // 记录同步失败信息
    const syncInfo = {
      time: new Date().toISOString(),
      status: '失败',
      message: `同步失败: ${error.message || String(error)}`
    };
    fs.writeFileSync(LAST_SYNC_FILE, JSON.stringify(syncInfo, null, 2));
    
    return { success: false, message: `同步失败: ${error.message || String(error)}` };
  }
}

// 执行同步
syncNotionData()
  .then(result => {
    console.log(result.message);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('执行同步过程中出错:', error);
    process.exit(1);
  }); 