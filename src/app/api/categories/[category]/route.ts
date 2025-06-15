import { NextResponse } from 'next/server';
import { getPostsByCategory } from '@/lib/notion';

// 设置为强制动态渲染，避免静态优化
export const dynamic = 'force-dynamic';

// 获取特定分类文章的API路由
export async function GET(
  request: Request,
  context: { params: { category: string } }
) {
  try {
    // 正确处理动态参数
    const { category } = await context.params;
    const categoryName = decodeURIComponent(category || '');
    const posts = await getPostsByCategory(categoryName);
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error(`API - 获取分类文章失败:`, error);
    return NextResponse.json(
      { error: '获取分类文章失败', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 