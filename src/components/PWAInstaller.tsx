'use client';

import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 检查是否已安装
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // 监听beforeinstallprompt事件
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    // 监听appinstalled事件
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('用户接受了安装');
    } else {
      console.log('用户拒绝了安装');
    }
    
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // 设置一个标记，一段时间内不再显示
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // 检查是否应该显示安装横幅
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      // 如果距离上次拒绝不到7天，不显示
      if (now - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setShowInstallBanner(false);
        return;
      }
    }
  }, []);

  if (isInstalled || !showInstallBanner || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">📱</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">安装应用</h3>
            <p className="text-xs text-blue-100 mt-1">
              将博客添加到主屏幕，享受更好的阅读体验
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-200 hover:text-white ml-2"
          aria-label="关闭"
        >
          ✕
        </button>
      </div>
      
      <div className="flex space-x-2 mt-3">
        <button
          onClick={handleInstallClick}
          className="flex-1 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-3 py-2 rounded text-sm font-medium hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
        >
          安装
        </button>
        <button
          onClick={handleDismiss}
          className="px-3 py-2 text-blue-200 hover:text-white text-sm transition-colors"
        >
          稍后
        </button>
      </div>
    </div>
  );
};

export default PWAInstaller; 