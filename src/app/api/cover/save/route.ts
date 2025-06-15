import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

/**
 * 保存封面图片到Notion
 */
export async function POST(req: NextRequest) {
  try {
    const { postId, imageUrl } = await req.json();
    
    if (!postId || !imageUrl) {
      return NextResponse.json(
        { error: '参数不完整' },
        { status: 400 }
      );
    }
    
    // 初始化Notion客户端
    const notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });
    
    // 确保URL是有效的外部URL
    const validImageUrl = await ensureValidImageUrl(imageUrl);
    
    try {
      // 更新Notion页面，添加封面图片
      await notion.pages.update({
        page_id: postId,
        properties: {
          '封面': {
            files: [
              {
                type: 'external',
                name: 'cover',
                external: {
                  url: validImageUrl
                }
              }
            ]
          }
        }
      });
      
      return NextResponse.json({
        success: true,
        message: '封面图片已保存到Notion'
      });
    } catch (notionError) {
      console.error('Notion API错误:', notionError);
      
      // 尝试使用备用图片URL
      const fallbackImageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&h=630&auto=format&fit=crop';
      
      await notion.pages.update({
        page_id: postId,
        properties: {
          '封面': {
            files: [
              {
                type: 'external',
                name: 'cover',
                external: {
                  url: fallbackImageUrl
                }
              }
            ]
          }
        }
      });
      
      return NextResponse.json({
        success: true,
        message: '使用备用图片保存到Notion'
      });
    }
  } catch (error) {
    console.error('保存封面图片失败:', error);
    return NextResponse.json(
      { 
        error: '保存封面图片失败', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

/**
 * 确保URL是有效的外部URL
 * 如果必要，会转换URL格式或提供备用URL
 */
async function ensureValidImageUrl(url: string): Promise<string> {
  // 如果URL不是以http开头，可能是相对路径或其他格式，需要处理
  if (!url.startsWith('http')) {
    // 如果是data URL，需要转换为实际的图片URL
    if (url.startsWith('data:')) {
      // 对于data URL，我们无法直接使用，因为Notion不支持
      // 这种情况下返回一个默认图片URL
      return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&h=630&auto=format&fit=crop';
    }
    
    // 如果是相对路径，转换为绝对路径
    if (url.startsWith('/')) {
      // 使用当前域名构建完整URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dada-blog.vercel.app';
      return `${baseUrl}${url}`;
    }
  }
  
  // 验证URL是否可访问
  try {
    // 尝试访问URL，确保它是可用的
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: { 'Accept': 'image/*' },
      redirect: 'follow',
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`图片URL不可访问: ${response.status}`);
    }
    
    // 返回最终URL（可能经过重定向）
    return response.url;
  } catch (e) {
    console.error('验证图片URL失败:', e);
    
    // 如果URL无效或不可访问，返回默认图片
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&h=630&auto=format&fit=crop';
  }
} 