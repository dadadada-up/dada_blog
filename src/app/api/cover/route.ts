import { NextRequest, NextResponse } from 'next/server';

/**
 * 获取封面图片API
 * 根据标题获取相关图片
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

    // 尝试从不同图片源获取图片，按顺序尝试
    try {
      // 首先尝试Unsplash
      const imageUrl = await getUnsplashImage(title);
      return NextResponse.json({ success: true, imageUrl });
    } catch (error) {
      console.error('从Unsplash获取图片失败，尝试使用备用图片:', error);
      
      try {
        // 然后尝试Picsum
        const picsumUrl = await getPicsumImage();
        return NextResponse.json({ success: true, imageUrl: picsumUrl });
      } catch (picsumError) {
        console.error('从Picsum获取图片失败，使用生成的渐变背景:', picsumError);
        
        // 最后使用生成的渐变背景
        const gradientUrl = generateGradientBackground(title);
        return NextResponse.json({ success: true, imageUrl: gradientUrl });
      }
    }
  } catch (error) {
    console.error('获取封面图片失败:', error);
    return NextResponse.json(
      { error: '获取封面图片失败' },
      { status: 500 }
    );
  }
}

/**
 * 从Unsplash获取与标题相关的图片
 */
async function getUnsplashImage(title: string): Promise<string> {
  // 提取标题中的关键词
  const keywords = extractKeywords(title);
  
  // 添加一个自然景观相关的关键词，使图片更加气势磅礴
  const natureKeywords = ['landscape', 'mountain', 'ocean', 'forest', 'sunset', 'nature', 'aerial view', 'dramatic sky'];
  const randomNatureKeyword = natureKeywords[Math.floor(Math.random() * natureKeywords.length)];
  
  // 将自然景观关键词与提取的关键词结合
  const combinedKeywords = [...keywords, randomNatureKeyword];
  
  // 使用组合关键词作为查询参数
  const searchTerm = combinedKeywords.join(',');
  
  // 构建URL，使用标题关键词作为查询参数
  const url = `https://source.unsplash.com/1200x630/?${encodeURIComponent(searchTerm)}&quality=100`;
  
  // 设置超时，避免请求过长时间
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      // 避免缓存，确保每次获取不同图片
      cache: 'no-store' 
    });
    
    if (!response.ok) {
      throw new Error(`获取图片失败: ${response.status}`);
    }
    
    // Unsplash的source API会返回一个重定向URL，这是最终的图片URL
    return response.url;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 从Picsum获取随机图片作为备用
 */
async function getPicsumImage(): Promise<string> {
  // 生成随机ID，避免获取相同图片
  const randomId = Math.floor(Math.random() * 1000);
  
  // 设置超时，避免请求过长时间
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  
  try {
    // 增加图片尺寸和质量参数
    const url = `https://picsum.photos/seed/${randomId}/1200/630?quality=100`;
    const response = await fetch(url, { 
      signal: controller.signal,
      cache: 'no-store' 
    });
    
    if (!response.ok) {
      throw new Error(`获取Picsum图片失败: ${response.status}`);
    }
    
    return response.url;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 生成渐变背景作为最后的备选方案
 * 返回data URL格式的渐变背景图片
 */
function generateGradientBackground(title: string): string {
  // 根据标题生成一个伪随机的颜色
  const hash = simpleHash(title);
  
  // 从预定义的渐变色中选择一个
  const gradients = [
    'linear-gradient(135deg, #667eea, #764ba2)', // 紫蓝
    'linear-gradient(135deg, #6a11cb, #2575fc)', // 深紫到蓝
    'linear-gradient(135deg, #ff9a9e, #fad0c4)', // 粉色
    'linear-gradient(135deg, #09203f, #537895)', // 深蓝
    'linear-gradient(135deg, #f093fb, #f5576c)', // 粉紫
    'linear-gradient(135deg, #43e97b, #38f9d7)', // 绿色
    'linear-gradient(135deg, #fa709a, #fee140)', // 粉黄
    'linear-gradient(135deg, #4facfe, #00f2fe)', // 蓝色
    'linear-gradient(135deg, #30cfd0, #330867)', // 蓝紫
    'linear-gradient(135deg, #a18cd1, #fbc2eb)', // 淡紫
    'linear-gradient(135deg, #2193b0, #6dd5ed)', // 蓝绿
    'linear-gradient(135deg, #834d9b, #d04ed6)', // 紫色
    'linear-gradient(135deg, #1e3c72, #2a5298)', // 深蓝
    'linear-gradient(135deg, #373B44, #4286f4)', // 蓝黑
    'linear-gradient(135deg, #00b09b, #96c93d)', // 绿色
  ];
  
  // 使用标题的哈希值选择渐变色
  const gradientIndex = Math.abs(hash) % gradients.length;
  const gradient = gradients[gradientIndex];
  
  // 返回一个base64编码的SVG图片
  const svgContent = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradient.split(',')[1].trim()};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradient.split(',')[2].replace(')', '').trim()};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>
  `;
  
  // 转换为base64
  const base64 = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * 简单的字符串哈希函数
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * 从标题中提取关键词
 */
function extractKeywords(title: string): string[] {
  // 移除常见的停用词
  const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as', 'of', 
    '的', '了', '和', '与', '或', '在', '是', '我', '你', '他', '她', '它', '们', '这', '那', '有', '没有', '不', '很', 
    '就', '都', '也', '要', '可以', '会', '对', '从', '到', '如何', '为什么', '怎么', '什么', '如何', '为什么', '怎样'];
  
  // 检测是否主要是中文
  const chineseChars = title.match(/[\u4e00-\u9fa5]/g) || [];
  const isMostlyChinese = chineseChars.length > title.length * 0.3;
  
  let words: string[] = [];
  
  if (isMostlyChinese) {
    // 中文标题处理
    // 1. 先按空格分词
    const spaceSegments = title.split(/\s+/);
    
    // 2. 对于每个分段，提取2-4个字符的中文词组
    spaceSegments.forEach(segment => {
      // 提取所有中文字符
      const chineseOnly = segment.match(/[\u4e00-\u9fa5]+/g) || [];
      
      if (chineseOnly.length > 0) {
        // 对于较长的中文字符串，尝试提取有意义的词组
        chineseOnly.forEach(str => {
          // 如果中文字符串长度大于4，取前4个字符作为关键词
          if (str.length > 4) {
            words.push(str.substring(0, 4));
            // 如果长度大于8，再取中间4个字符
            if (str.length > 8) {
              words.push(str.substring(4, 8));
            }
          } else {
            words.push(str);
          }
        });
      }
      
      // 同时提取英文单词
      const englishWords = segment.match(/[a-zA-Z]+/g) || [];
      words = [...words, ...englishWords];
    });
  } else {
    // 英文标题处理
    words = title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // 移除标点符号
      .split(/\s+/);
  }
  
  // 过滤停用词和过短的词
  words = words
    .filter(word => word.length > 1 && !stopWords.includes(word.toLowerCase()))
    .map(word => word.toLowerCase());
  
  // 如果没有有效关键词，返回一些通用词
  if (words.length === 0) {
    return ['abstract', 'background', 'concept', 'modern', 'landscape'];
  }
  
  // 去重
  words = Array.from(new Set(words));
  
  // 根据标题主题选择合适的额外关键词
  const additionalKeywords = selectAdditionalKeywords(title, words);
  
  // 最多返回4个关键词（为自然景观关键词留出空间）
  const finalKeywords = [...words.slice(0, 2), ...additionalKeywords];
  return Array.from(new Set(finalKeywords)).slice(0, 4);
}

/**
 * 根据标题主题选择额外的关键词，增强图片相关性
 */
function selectAdditionalKeywords(title: string, extractedKeywords: string[]): string[] {
  // 农业/保险相关
  if (/农业|农村|农民|保险|种植|收成|农作物|农产品|农机|农技|农资|insurance|agriculture|farm|crop/i.test(title)) {
    return ['agriculture', 'farm', 'rural', 'field', 'insurance'];
  }
  
  // 技术相关
  if (/技术|编程|开发|代码|软件|程序|framework|javascript|python|react|vue|angular|node|api|编码|算法/i.test(title)) {
    return ['technology', 'code', 'programming', 'digital', 'modern'];
  }
  
  // 商业/金融相关
  if (/金融|经济|投资|股票|基金|理财|business|finance|economy|investment|market|保险|银行|financial/i.test(title)) {
    return ['business', 'finance', 'professional', 'corporate', 'cityscape'];
  }
  
  // 设计相关
  if (/设计|UI|UX|用户体验|界面|交互|design|creative|art|graphic|用户界面|产品设计/i.test(title)) {
    return ['design', 'creative', 'minimal', 'modern', 'abstract'];
  }
  
  // AI/机器学习相关
  if (/AI|人工智能|机器学习|深度学习|神经网络|大模型|GPT|LLM|智能|artificial intelligence|machine learning/i.test(title)) {
    return ['artificial intelligence', 'technology', 'future', 'digital', 'network'];
  }
  
  // 数据相关
  if (/数据|分析|可视化|大数据|data|analytics|visualization|dashboard|报表|指标|统计/i.test(title)) {
    return ['data', 'analytics', 'visualization', 'digital', 'pattern'];
  }
  
  // 产品相关
  if (/产品|用户|需求|功能|迭代|敏捷|product|feature|user|需求分析|产品经理|roadmap/i.test(title)) {
    return ['product', 'professional', 'modern', 'minimal', 'workspace'];
  }
  
  // 阅读/书籍相关
  if (/书|阅读|读书|笔记|book|reading|note|summary|review|文学|小说|故事/i.test(title)) {
    return ['book', 'reading', 'knowledge', 'library', 'study'];
  }
  
  // 默认返回一些通用的美观关键词
  return ['professional', 'minimal', 'concept', 'perspective'];
} 