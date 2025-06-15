import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/notion';

// 获取所有文章的API路由
export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('API - 获取文章失败:', error);
    return NextResponse.json(
      { error: '获取文章失败', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 