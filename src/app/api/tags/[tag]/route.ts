import { NextResponse } from 'next/server';
import { getPostsByTag } from '@/lib/notion';

// 设置为强制动态渲染，避免静态优化
export const dynamic = 'force-dynamic';

// 获取特定标签文章的API路由
export async function GET(
  request: Request,
  context: { params: { tag: string } }
) {
  try {
    // 正确处理动态参数
    const { tag } = await context.params;
    const tagName = decodeURIComponent(tag || '');
    const posts = await getPostsByTag(tagName);
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error(`API - 获取标签文章失败:`, error);
    return NextResponse.json(
      { error: '获取标签文章失败', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 