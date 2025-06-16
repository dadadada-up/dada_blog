import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 统计数据文件路径
const STATS_DIR = path.join(process.cwd(), '.cache');
const VISIT_STATS_FILE = path.join(STATS_DIR, 'visit_stats.json');
const LIKE_STATS_FILE = path.join(STATS_DIR, 'like_stats.json');
const NOTIFICATIONS_FILE = path.join(STATS_DIR, 'notifications.json');

// 确保统计目录存在
function ensureStatsDir() {
  if (!fs.existsSync(STATS_DIR)) {
    fs.mkdirSync(STATS_DIR, { recursive: true });
  }
}

// 获取访问统计数据
function getVisitStats() {
  ensureStatsDir();
  if (!fs.existsSync(VISIT_STATS_FILE)) {
    // 初始化默认数据（过去7天）
    const defaultStats = generateDefaultStats();
    fs.writeFileSync(VISIT_STATS_FILE, JSON.stringify(defaultStats, null, 2));
    return defaultStats;
  }
  
  try {
    const data = fs.readFileSync(VISIT_STATS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取访问统计数据失败:', error);
    return generateDefaultStats();
  }
}

// 获取点赞统计数据
function getLikeStats() {
  ensureStatsDir();
  if (!fs.existsSync(LIKE_STATS_FILE)) {
    // 初始化默认数据（过去7天）
    const defaultStats = generateDefaultStats(true);
    fs.writeFileSync(LIKE_STATS_FILE, JSON.stringify(defaultStats, null, 2));
    return defaultStats;
  }
  
  try {
    const data = fs.readFileSync(LIKE_STATS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取点赞统计数据失败:', error);
    return generateDefaultStats(true);
  }
}

// 获取通知数据
function getNotifications() {
  ensureStatsDir();
  if (!fs.existsSync(NOTIFICATIONS_FILE)) {
    // 初始化默认数据
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
function generateDefaultStats(isLikes = false) {
  const stats = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);
    
    // 访问量数据范围大一些，点赞数据范围小一些
    const count = isLikes 
      ? Math.floor(Math.random() * 20) + 5 
      : Math.floor(Math.random() * 100) + 50;
    
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

// 记录访问
export async function POST(request) {
  try {
    const { postId } = await request.json();
    
    // 获取当前日期
    const today = new Date();
    const dateStr = formatDate(today);
    
    // 获取现有统计数据
    const stats = getVisitStats();
    
    // 查找今天的数据
    const todayStats = stats.find(item => item.date === dateStr);
    
    if (todayStats) {
      // 更新今天的访问量
      todayStats.count += 1;
    } else {
      // 添加今天的数据
      stats.push({ date: dateStr, count: 1 });
      
      // 保持只有7天的数据
      if (stats.length > 7) {
        stats.shift(); // 移除最旧的一天
      }
    }
    
    // 保存更新后的数据
    fs.writeFileSync(VISIT_STATS_FILE, JSON.stringify(stats, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('记录访问失败:', error);
    return NextResponse.json(
      { success: false, error: '记录访问失败' },
      { status: 500 }
    );
  }
}

// 获取统计数据
export async function GET() {
  try {
    const visitStats = getVisitStats();
    const likeStats = getLikeStats();
    const notifications = getNotifications();
    
    return NextResponse.json({
      visitStats,
      likeStats,
      notifications
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    );
  }
} 