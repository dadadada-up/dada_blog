'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import Link from 'next/link';
import { getAllPosts, getAllCategories, getAllTags } from '../../../lib/notion';
import { Post, VisitStats, LikeStats, Notification } from '../../../types';
import { format } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// 生成过去7天的日期
function getLast7Days() {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    result.push(format(date, 'MM-dd'));
  }
  return result;
}

// 生成模拟数据
function generateMockVisitData() {
  const dates = getLast7Days();
  return dates.map(date => ({
    date,
    count: Math.floor(Math.random() * 100) + 50
  }));
}

function generateMockLikeData() {
  const dates = getLast7Days();
  return dates.map(date => ({
    date,
    count: Math.floor(Math.random() * 20) + 5
  }));
}

function generateMockNotifications() {
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'like',
      postId: 'post-1',
      postTitle: 'Docker部署Node.js应用完全指南',
      createdAt: new Date().toISOString(),
      isRead: false,
      user: '访客123'
    },
    {
      id: '2',
      type: 'comment',
      postId: 'post-2',
      postTitle: 'React Hooks最佳实践',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isRead: false,
      user: '技术爱好者',
      content: '这篇文章非常有帮助，谢谢分享！'
    },
    {
      id: '3',
      type: 'like',
      postId: 'post-3',
      postTitle: 'Git常用命令速查手册',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      isRead: true,
      user: '程序员小王'
    },
  ];
  return notifications;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalPosts: 0,
    totalCategories: 0,
    totalTags: 0,
  });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [visitStats, setVisitStats] = useState<VisitStats[]>([]);
  const [likeStats, setLikeStats] = useState<LikeStats[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 获取数据
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // 获取文章数据
        let posts: Post[] = [];
        let categories: { name: string; count: number }[] = [];
        let tags: { name: string; count: number }[] = [];
        
        try {
          posts = await getAllPosts();
        } catch (error) {
          console.error('获取文章失败:', error);
          posts = [];
        }
        
        try {
          categories = await getAllCategories();
        } catch (error) {
          console.error('获取分类失败:', error);
          categories = [];
        }
        
        try {
          tags = await getAllTags();
        } catch (error) {
          console.error('获取标签失败:', error);
          tags = [];
        }
        
        // 更新数据
        setDashboardData({
          totalPosts: posts.length,
          totalCategories: categories.length,
          totalTags: tags.length,
        });
        
        // 获取最近发布的6篇文章
        const sortedPosts = [...posts].sort((a, b) => {
          const dateA = a.publishDate ? new Date(a.publishDate).getTime() : 0;
          const dateB = b.publishDate ? new Date(b.publishDate).getTime() : 0;
          return dateB - dateA;
        });
        
        setRecentPosts(sortedPosts.slice(0, 6));
        
        // 设置模拟数据
        setVisitStats(generateMockVisitData());
        setLikeStats(generateMockLikeData());
        setNotifications(generateMockNotifications());
      } catch (error) {
        console.error('获取数据失败:', error);
        // 设置默认数据
        setDashboardData({
          totalPosts: 0,
          totalCategories: 0,
          totalTags: 0,
        });
        setRecentPosts([]);
        setVisitStats([]);
        setLikeStats([]);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'yyyy-MM-dd');
  };
  
  // 格式化通知时间
  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}小时前`;
    
    return format(date, 'MM-dd HH:mm');
  };
  
  // 标记通知为已读
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
  };
  
  // 回复评论
  const replyToComment = (id: string) => {
    alert('回复功能即将上线，敬请期待！');
  };

  // 图表配置
  const visitChartData = {
    labels: visitStats.map(item => item.date),
    datasets: [
      {
        label: '访问量',
        data: visitStats.map(item => item.count),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  const likeChartData = {
    labels: likeStats.map(item => item.date),
    datasets: [
      {
        label: '点赞数',
        data: likeStats.map(item => item.count),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">📊 数据概览</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <svg className="animate-spin h-8 w-8 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-gray-600">加载中...</span>
        </div>
      ) : (
        <>
          {/* 数据卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border rounded-lg shadow-sm p-6">
              <div className="text-lg font-medium text-gray-800">文章总数</div>
              <div className="text-3xl font-bold mt-2">{dashboardData.totalPosts}</div>
            </div>
            
            <div className="bg-white border rounded-lg shadow-sm p-6">
              <div className="text-lg font-medium text-gray-800">分类数</div>
              <div className="text-3xl font-bold mt-2">{dashboardData.totalCategories}</div>
            </div>
            
            <div className="bg-white border rounded-lg shadow-sm p-6">
              <div className="text-lg font-medium text-gray-800">标签数</div>
              <div className="text-3xl font-bold mt-2">{dashboardData.totalTags}</div>
            </div>
          </div>
          
          {/* 统计图表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-medium mb-4">📈 访问统计</h2>
              <div className="h-64">
                <Line data={visitChartData} options={chartOptions} />
              </div>
            </div>
            
            <div className="bg-white border rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-medium mb-4">👍 点赞统计</h2>
              <div className="h-64">
                <Line data={likeChartData} options={chartOptions} />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 最新文章 */}
            <div>
              <h2 className="text-xl font-bold mb-4">📝 最新发布文章</h2>
              <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                {recentPosts.length > 0 ? (
                  <ul className="divide-y">
                    {recentPosts.map((post) => (
                      <li key={post.id} className="flex justify-between items-center p-4 hover:bg-gray-50">
                        <Link href={`/posts/${post.id}`} target="_blank" className="text-blue-600 hover:text-blue-800">
                          {post.title}
                        </Link>
                        <span className="text-gray-500 text-sm">{formatDate(post.publishDate)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-gray-500">暂无文章</div>
                )}
              </div>
            </div>
            
            {/* 消息通知 */}
            <div>
              <h2 className="text-xl font-bold mb-4">🔔 消息通知</h2>
              <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                {notifications.length > 0 ? (
                  <ul className="divide-y">
                    {notifications.map((notification) => (
                      <li 
                        key={notification.id} 
                        className={`p-4 hover:bg-gray-50 ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              {notification.type === 'like' ? (
                                <span className="text-red-500 mr-2">👍</span>
                              ) : (
                                <span className="text-blue-500 mr-2">💬</span>
                              )}
                              <span className="font-medium">{notification.user}</span>
                            </div>
                            <p className="text-gray-600 mt-1">
                              {notification.type === 'like' 
                                ? '点赞了你的文章' 
                                : '评论了你的文章'}: 
                              <Link 
                                href={`/posts/${notification.postId}`} 
                                className="text-blue-600 hover:underline ml-1"
                              >
                                {notification.postTitle}
                              </Link>
                            </p>
                            {notification.content && (
                              <p className="text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                                "{notification.content}"
                              </p>
                            )}
                            <div className="flex items-center mt-2 text-sm">
                              <span className="text-gray-500">{formatNotificationTime(notification.createdAt)}</span>
                              {!notification.isRead && (
                                <button 
                                  className="ml-4 text-blue-600 hover:text-blue-800"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  标记为已读
                                </button>
                              )}
                              {notification.type === 'comment' && (
                                <button 
                                  className="ml-4 text-green-600 hover:text-green-800"
                                  onClick={() => replyToComment(notification.id)}
                                >
                                  回复
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-gray-500">暂无通知</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
} 