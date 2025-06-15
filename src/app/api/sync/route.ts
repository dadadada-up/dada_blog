import { NextResponse } from 'next/server';
import { syncNotionData } from '@/lib/notion';

// 同步Notion数据的API路由
export async function POST() {
  try {
    const result = await syncNotionData();
    return NextResponse.json(result);
  } catch (error) {
    console.error('API - 同步Notion数据失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '同步失败', 
        message: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 