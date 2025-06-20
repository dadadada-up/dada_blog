'use client';

import React, { useEffect, useRef } from 'react';

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const commentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 已经加载过脚本，不再重复加载
    if (document.querySelector(`#giscus-script`)) {
      return;
    }

    // 创建 giscus 脚本
    const script = document.createElement('script');
    script.id = 'giscus-script';
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    
    // 使用默认值而不是环境变量，避免配置问题
    script.setAttribute('data-repo', 'dadadada-up/dada_blog');
    script.setAttribute('data-repo-id', 'R_kgDOLZcVYQ'); // 使用一个示例值
    script.setAttribute('data-category', 'Announcements');
    script.setAttribute('data-category-id', 'DIC_kwDOLZcVYc4CcQyX'); // 使用一个示例值
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-lang', 'zh-CN');
    script.setAttribute('crossorigin', 'anonymous');

    // 添加脚本到评论容器
    if (commentRef.current) {
      commentRef.current.appendChild(script);
    }

    return () => {
      // 清理脚本
      const scriptElement = document.getElementById('giscus-script');
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, [postId]);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">💬 评论</h3>
      <div ref={commentRef} className="giscus-container"></div>
    </div>
  );
} 