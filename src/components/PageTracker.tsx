'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface PageTrackerProps {
  postId?: string;
  postTitle?: string;
}

export default function PageTracker({ postId, postTitle }: PageTrackerProps) {
  const pathname = usePathname();
  
  useEffect(() => {
    // 记录页面访问
    async function recordPageView() {
      try {
        // 如果是文章页面，则记录具体文章ID
        if (postId) {
          await fetch('/api/stats', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postId, postTitle }),
          });
        }
      } catch (error) {
        console.error('记录页面访问失败:', error);
      }
    }
    
    // 延迟一秒执行，避免频繁请求
    const timer = setTimeout(() => {
      recordPageView();
    }, 1000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [pathname, postId, postTitle]);
  
  // 这是一个不可见的组件，不渲染任何内容
  return null;
} 