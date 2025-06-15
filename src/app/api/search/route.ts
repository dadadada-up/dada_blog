import { NextResponse } from 'next/server';
import { searchPosts } from '@/lib/notion';

// 搜索文章的API路由
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('q') || '';
    
    const posts = await searchPosts(keyword);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('API - 搜索文章失败:', error);
    return NextResponse.json(
      { error: '搜索文章失败', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 