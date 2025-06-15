import { NextResponse } from 'next/server';
import { getPostById } from '@/lib/notion';

// 设置为强制动态渲染，避免静态优化
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // 正确处理动态参数
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json({ error: '无效的文章ID' }, { status: 400 });
    }

    const post = await getPostById(id);
    
    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error(`API - 获取文章失败:`, error);
    return NextResponse.json(
      { error: '获取文章失败', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 