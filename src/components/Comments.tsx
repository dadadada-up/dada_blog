'use client';

import React, { useEffect, useRef, useState } from 'react';

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const commentRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 清理之前可能存在的giscus元素
    const giscusContainer = document.querySelector('.giscus');
    if (giscusContainer) {
      giscusContainer.remove();
    }

    // 创建 giscus 脚本
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    
    // Giscus配置
    script.setAttribute('data-repo', 'dadadada-up/dada_blog');
    script.setAttribute('data-repo-id', 'R_kgDOLZcVYQ'); // 需要替换为你的仓库ID
    script.setAttribute('data-category', 'Announcements');
    script.setAttribute('data-category-id', 'DIC_kwDOLZcVYc4CcQyX'); // 需要替换为你的分类ID
    script.setAttribute('data-mapping', 'specific');
    script.setAttribute('data-term', postId); // 使用文章ID作为唯一标识
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-lang', 'zh-CN');
    script.setAttribute('crossorigin', 'anonymous');
    
    // 添加加载事件监听
    script.onload = () => {
      setIsLoaded(true);
    };

    // 添加脚本到评论容器
    if (commentRef.current) {
      commentRef.current.appendChild(script);
    }

    return () => {
      // 清理脚本
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [postId]);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">💬 评论</h3>
      {!isLoaded && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">加载评论...</p>
        </div>
      )}
      <div ref={commentRef} className="giscus-container"></div>
    </div>
  );
} 