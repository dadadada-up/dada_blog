'use client';

import React, { useState } from 'react';

interface ShareButtonProps {
  title: string;
  url?: string;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  title, 
  url = typeof window !== 'undefined' ? window.location.href : '',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareOptions = [
    {
      name: '复制链接',
      icon: '🔗',
      action: () => copyToClipboard(url),
    },
    {
      name: '微信',
      icon: '💬',
      action: () => shareToWeChat(),
    },
    {
      name: 'Twitter',
      icon: '🐦',
      action: () => shareToTwitter(),
    },
    {
      name: 'Facebook',
      icon: '📘',
      action: () => shareToFacebook(),
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      action: () => shareToLinkedIn(),
    },
    {
      name: '邮件',
      icon: '📧',
      action: () => shareByEmail(),
    },
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setIsOpen(false);
    } catch (err) {
      console.error('复制失败:', err);
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setIsOpen(false);
    }
  };

  const shareToWeChat = () => {
    // 微信分享需要使用微信JS-SDK，这里提供一个简单的实现
    // 实际项目中需要配置微信JS-SDK
    alert('请复制链接手动分享到微信');
    copyToClipboard(url);
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const shareByEmail = () => {
    const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`我发现了一篇不错的文章：${title}\n\n${url}`)}`;
    window.location.href = emailUrl;
    setIsOpen(false);
  };

  // 原生分享API支持检测
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        console.error('分享失败:', err);
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleNativeShare}
        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="分享文章"
      >
        <span className="text-lg">📤</span>
        <span className="hidden md:inline">分享</span>
      </button>

      {/* 复制成功提示 */}
      {copied && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-green-500 text-white text-xs rounded-md whitespace-nowrap z-30">
          链接已复制
        </div>
      )}

      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 分享菜单 */}
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
            <div className="py-2">
              {shareOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={option.action}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-lg">{option.icon}</span>
                  <span>{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton; 