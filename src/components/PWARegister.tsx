'use client';

import { useEffect } from 'react';
import { registerSW } from '@/utils/pwa';

const PWARegister: React.FC = () => {
  useEffect(() => {
    registerSW();
  }, []);

  return null; // 这个组件不渲染任何内容，只是注册Service Worker
};

export default PWARegister; 