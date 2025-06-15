import { NextRequest, NextResponse } from 'next/server';

/**
 * 使用Picsum Photos API生成封面图片
 * 这是另一个免费且无需API密钥的方案
 */
export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();
    
    if (!title) {
      return NextResponse.json(
        { error: '标题不能为空' },
        { status: 400 }
      );
    }
    
    // 生成一个随机的图片ID (1-1000)
    const randomId = Math.floor(Math.random() * 1000) + 1;
    
    // 使用Lorem Picsum获取随机图片
    // 这是一个免费的API，不需要密钥
    const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(title)}/1200/630`;
    
    try {
      // 获取图片内容
      const response = await fetch(imageUrl);
      const imageBuffer = await response.arrayBuffer();
      
      // 返回图片URL和图片内容
      return NextResponse.json({
        success: true,
        imageUrl: response.url,
        imageData: Buffer.from(imageBuffer).toString('base64')
      });
    } catch (fetchError) {
      console.error('获取图片失败，尝试使用备用图片:', fetchError);
      
      // 如果获取图片失败，使用备用图片源
      const fallbackImageUrl = `https://picsum.photos/id/${randomId}/1200/630`;
      const fallbackResponse = await fetch(fallbackImageUrl);
      const fallbackImageBuffer = await fallbackResponse.arrayBuffer();
      
      return NextResponse.json({
        success: true,
        imageUrl: fallbackResponse.url,
        imageData: Buffer.from(fallbackImageBuffer).toString('base64')
      });
    }
  } catch (error) {
    console.error('生成封面图片失败:', error);
    return NextResponse.json(
      { error: '生成封面图片失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 