import { NextRequest, NextResponse } from 'next/server';

/**
 * 生成带有标题文本的封面图片，使用HTML和CSS方式
 */
export async function POST(req: NextRequest) {
  try {
    const { title, imageUrl } = await req.json();
    
    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: '标题和图片URL不能为空' },
        { status: 400 }
      );
    }
    
    // 生成带有标题的HTML
    const html = generateHtmlWithTitle(title, imageUrl);
    
    // 返回HTML和原始图片URL
    return NextResponse.json({
      success: true,
      html: html,
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('生成封面图片失败:', error);
    return NextResponse.json(
      { error: '生成封面图片失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * 生成带有标题的HTML
 */
function generateHtmlWithTitle(title: string, imageUrl: string): string {
  // 根据标题长度调整字体大小
  let fontSize = 48;
  if (title.length > 30) {
    fontSize = 36;
  }
  if (title.length > 50) {
    fontSize = 28;
  }
  if (title.length > 70) {
    fontSize = 24;
  }
  
  // 处理中文和英文混合标题的换行
  // 对于中文，每个字符都可以作为换行点
  // 对于英文，按照单词换行
  const formattedTitle = formatTitle(title);
  
  // 随机选择一种样式
  const styleIndex = Math.floor(Math.random() * 4);
  
  // 检查图片URL是否是数据URL（SVG渐变背景）
  const isSvgBackground = imageUrl.startsWith('data:image/svg+xml;base64,');
  
  // 生成HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .cover-container {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 630px;
          overflow: hidden;
          background-color: #333; /* 添加默认背景色 */
        }
        .cover-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          ${!isSvgBackground ? getImageFilter(styleIndex) : ''}
        }
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          ${getOverlayStyle(styleIndex, isSvgBackground)}
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          box-sizing: border-box;
        }
        .title-container {
          ${getTitleContainerStyle(styleIndex)}
          max-width: 80%;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }
        .title {
          color: white;
          font-size: ${fontSize}px;
          font-weight: bold;
          text-align: center;
          text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8);
          line-height: 1.4;
          margin: 0;
          ${styleIndex === 1 ? 'letter-spacing: 1px;' : ''}
        }
        .subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: ${Math.max(16, fontSize * 0.4)}px;
          text-align: center;
          margin-top: 1rem;
          font-weight: 300;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
        }
      </style>
    </head>
    <body>
      <div class="cover-container">
        <img class="cover-image" src="${imageUrl}" alt="${title}">
        <div class="overlay">
          <div class="title-container">
            <h1 class="title">${formattedTitle}</h1>
            <div class="subtitle">dada's blog</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * 获取图片滤镜样式
 */
function getImageFilter(styleIndex: number): string {
  switch (styleIndex) {
    case 0:
      return 'filter: brightness(0.85);';
    case 1:
      return 'filter: brightness(0.8) contrast(1.1);';
    case 2:
      return 'filter: grayscale(0.2) brightness(0.85);';
    case 3:
      return 'filter: sepia(0.15) brightness(0.85);';
    default:
      return '';
  }
}

/**
 * 获取标题容器样式
 */
function getTitleContainerStyle(styleIndex: number): string {
  switch (styleIndex) {
    case 0:
      return 'background: rgba(0, 0, 0, 0.65); padding: 2rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);';
    case 1:
      return 'background: rgba(0, 0, 0, 0.6); border: 3px solid rgba(255, 255, 255, 0.8); padding: 2rem;';
    case 2:
      return 'background: rgba(0, 0, 0, 0.7); padding: 2rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.2);';
    case 3:
      return 'position: relative; padding: 2rem; background: rgba(0, 0, 0, 0.6); border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.1);';
    default:
      return 'padding: 2rem; background: rgba(0, 0, 0, 0.6);';
  }
}

/**
 * 根据样式索引获取不同的遮罩样式
 */
function getOverlayStyle(styleIndex: number, isSvgBackground: boolean): string {
  // 如果是SVG背景，使用更轻的遮罩
  if (isSvgBackground) {
    return 'background: rgba(0, 0, 0, 0.2);';
  }
  
  switch (styleIndex) {
    case 0:
      return 'background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.65));';
    case 1:
      return 'background: radial-gradient(circle at center, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%);';
    case 2:
      return 'background: rgba(0, 0, 0, 0.45);';
    case 3:
      return 'background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%);';
    default:
      return 'background: rgba(0, 0, 0, 0.4);';
  }
}

/**
 * 格式化标题，处理中英文混合的情况
 */
function formatTitle(title: string): string {
  // 如果标题很短，直接返回
  if (title.length < 15) {
    return title;
  }
  
  // 检测是否主要是中文
  const chineseChars = title.match(/[\u4e00-\u9fa5]/g) || [];
  const isMostlyChinese = chineseChars.length > title.length * 0.5;
  
  if (isMostlyChinese) {
    // 中文标题，每隔一定数量的字符添加<br>
    const charsPerLine = title.length > 40 ? 10 : (title.length > 20 ? 8 : 12);
    let result = '';
    for (let i = 0; i < title.length; i++) {
      result += title[i];
      if ((i + 1) % charsPerLine === 0 && i < title.length - 1) {
        result += '<br>';
      }
    }
    return result;
  } else {
    // 英文标题，按单词分割
    const words = title.split(' ');
    const wordsPerLine = title.length > 50 ? 4 : (title.length > 30 ? 5 : 6);
    let result = '';
    for (let i = 0; i < words.length; i++) {
      result += words[i];
      if ((i + 1) % wordsPerLine === 0 && i < words.length - 1) {
        result += '<br>';
      } else if (i < words.length - 1) {
        result += ' ';
      }
    }
    return result;
  }
} 