import { NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/notion';

// 获取所有分类的API路由
export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('API - 获取分类失败:', error);
    return NextResponse.json(
      { error: '获取分类失败', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 