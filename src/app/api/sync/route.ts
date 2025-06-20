import { NextResponse } from 'next/server';
import { syncNotionData } from '@/lib/notion';

// 同步Notion数据的API路由
export async function POST() {
  try {
    console.log('开始同步Notion数据...');
    console.log('环境变量:', {
      NOTION_API_KEY: process.env.NOTION_API_KEY ? '已设置' : '未设置',
      NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID
    });
    
    const result = await syncNotionData();
    console.log('同步结果:', result);
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