import { NextResponse } from 'next/server';
import { getAllTags } from '@/lib/notion';

// 获取所有标签的API路由
export async function GET() {
  try {
    const tags = await getAllTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error('API - 获取标签失败:', error);
    return NextResponse.json(
      { error: '获取标签失败', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 