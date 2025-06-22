'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 800,
  height = 600,
  className = '',
  priority = false,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // 处理图片URL
  const processImageSrc = (url: string): string => {
    if (!url) return '';
    
    try {
      // 处理相对路径
      if (!url.startsWith('http') && !url.startsWith('/')) {
        return `/${url}`;
      }
      
      // 修复语雀图片URL格式问题
      if (url.startsWith('/https:/')) {
        return url.substring(1);
      }
      
      // 处理语雀图片URL
      if (url.includes('cdn.nlark.com') || url.includes('yuque')) {
        if (url.indexOf('https:/') === 0 && url.indexOf('https://') !== 0) {
          return url.replace('https:/', 'https://');
        }
        // 使用图片代理服务解决跨域问题
        return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=${width}&h=${height}&fit=cover&output=webp`;
      }
      
      return url;
    } catch (e) {
      console.error('图片URL处理错误:', e);
      return url;
    }
  };

  const imgSrc = processImageSrc(src);

  // 图片加载失败显示占位符
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg p-4 my-6 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>图片加载失败</span>
        <span className="text-xs mt-1">{alt || '无法显示图片'}</span>
      </div>
    );
  }

  // 加载中的骨架屏
  const skeletonClass = loading ? 'animate-pulse bg-gray-200 dark:bg-gray-700' : '';

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {loading && (
        <div className={`absolute inset-0 ${skeletonClass} z-10`} />
      )}
      
      <Image
        src={imgSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        className={`transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'} object-cover w-full h-auto`}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </div>
  );
};

export default OptimizedImage; 