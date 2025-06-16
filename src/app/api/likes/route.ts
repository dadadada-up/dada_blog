import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 点赞数据文件路径
const STATS_DIR = path.join(process.cwd(), '.cache');
const LIKE_STATS_FILE = path.join(STATS_DIR, 'like_stats.json');
const NOTIFICATIONS_FILE = path.join(STATS_DIR, 'notifications.json');
const POST_LIKES_FILE = path.join(STATS_DIR, 'post_likes.json');

// 确保统计目录存在
function ensureStatsDir() {
  if (!fs.existsSync(STATS_DIR)) {
    fs.mkdirSync(STATS_DIR, { recursive: true });
  }
}

// 获取点赞统计数据
function getLikeStats() {
  ensureStatsDir();
  if (!fs.existsSync(LIKE_STATS_FILE)) {
    // 初始化默认数据（过去7天）
    const defaultStats = generateDefaultStats();
    fs.writeFileSync(LIKE_STATS_FILE, JSON.stringify(defaultStats, null, 2));
    return defaultStats;
  }
  
  try {
    const data = fs.readFileSync(LIKE_STATS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取点赞统计数据失败:', error);
    return generateDefaultStats();
  }
}

// 获取文章点赞数据
function getPostLikes() {
  ensureStatsDir();
  if (!fs.existsSync(POST_LIKES_FILE)) {
    // 初始化空数据
    const defaultData = {};
    fs.writeFileSync(POST_LIKES_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  
  try {
    const data = fs.readFileSync(POST_LIKES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取文章点赞数据失败:', error);
    return {};
  }
}

// 获取通知数据
function getNotifications() {
  ensureStatsDir();
  if (!fs.existsSync(NOTIFICATIONS_FILE)) {
    // 初始化空数据
    const defaultNotifications = [];
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(defaultNotifications, null, 2));
    return defaultNotifications;
  }
  
  try {
    const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取通知数据失败:', error);
    return [];
  }
}

// 生成默认统计数据（过去7天）
function generateDefaultStats() {
  const stats = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);
    
    // 点赞数据范围
    const count = Math.floor(Math.random() * 20) + 5;
    
    stats.push({ date: dateStr, count });
  }
  return stats;
}

// 格式化日期为 MM-dd 格式
function formatDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

// 添加点赞
export async function POST(request) {
  try {
    const { postId, postTitle, userName = '访客' } = await request.json();
    
    if (!postId) {
      return NextResponse.json(
        { success: false, error: '缺少文章ID' },
        { status: 400 }
      );
    }
    
    // 获取当前日期
    const today = new Date();
    const dateStr = formatDate(today);
    
    // 更新点赞统计数据
    const likeStats = getLikeStats();
    
    // 查找今天的数据
    const todayStats = likeStats.find(item => item.date === dateStr);
    
    if (todayStats) {
      // 更新今天的点赞数
      todayStats.count += 1;
    } else {
      // 添加今天的数据
      likeStats.push({ date: dateStr, count: 1 });
      
      // 保持只有7天的数据
      if (likeStats.length > 7) {
        likeStats.shift(); // 移除最旧的一天
      }
    }
    
    // 保存更新后的点赞统计数据
    fs.writeFileSync(LIKE_STATS_FILE, JSON.stringify(likeStats, null, 2));
    
    // 更新文章点赞数据
    const postLikes = getPostLikes();
    postLikes[postId] = (postLikes[postId] || 0) + 1;
    fs.writeFileSync(POST_LIKES_FILE, JSON.stringify(postLikes, null, 2));
    
    // 添加通知
    const notifications = getNotifications();
    notifications.unshift({
      id: `like-${Date.now()}`,
      type: 'like',
      postId,
      postTitle: postTitle || '未知文章',
      createdAt: new Date().toISOString(),
      isRead: false,
      user: userName
    });
    
    // 只保留最近的50条通知
    if (notifications.length > 50) {
      notifications.pop();
    }
    
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
    
    return NextResponse.json({ 
      success: true,
      likes: postLikes[postId]
    });
  } catch (error) {
    console.error('处理点赞失败:', error);
    return NextResponse.json(
      { success: false, error: '处理点赞失败' },
      { status: 500 }
    );
  }
}

// 获取文章点赞数
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    
    if (!postId) {
      return NextResponse.json(
        { success: false, error: '缺少文章ID' },
        { status: 400 }
      );
    }
    
    const postLikes = getPostLikes();
    const likes = postLikes[postId] || 0;
    
    return NextResponse.json({
      success: true,
      likes
    });
  } catch (error) {
    console.error('获取点赞数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取点赞数据失败' },
      { status: 500 }
    );
  }
} 