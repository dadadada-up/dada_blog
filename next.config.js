/** @type {import('next').NextConfig} */
const nextConfig = {
  // 只在生产环境使用standalone输出
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  
  images: {
    domains: ['cdn.nlark.com', 'images.unsplash.com', 'picsum.photos', 'fastly.picsum.photos', 'images.weserv.nl'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.nlark.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.weserv.nl',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1年缓存
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 启用压缩
  compress: true,
  
  // 代码分割优化
  experimental: {
    optimizePackageImports: ['react-icons', 'date-fns'],
  },
  // 添加ESLint配置，禁用构建时的ESLint检查
  eslint: {
    // 在构建时不进行ESLint检查
    ignoreDuringBuilds: true,
  },
  // 禁用TypeScript类型检查
  typescript: {
    // 在构建时不进行TypeScript类型检查
    ignoreBuildErrors: true,
  },
  // 简化webpack配置
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 客户端构建时，将node模块设置为空模块
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    return config;
  },
  
  // 编译器优化
  compiler: {
    // 移除console.log在生产环境
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 设置环境变量以禁用TypeScript
  env: {
    DISABLE_TYPESCRIPT: "true",
    NEXT_SKIP_TYPECHECKING: "true"
  }
};

module.exports = nextConfig; 