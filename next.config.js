/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['cdn.nlark.com', 'images.unsplash.com', 'picsum.photos', 'fastly.picsum.photos'],
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
    ],
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
  // 添加webpack配置，解决fs模块问题
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
  
  // 显式添加别名配置，确保与tsconfig.json一致
  modularizeImports: {
    '@components/(.*)': {
      transform: "@/components/$1",
    },
    '@lib/(.*)': {
      transform: "@/lib/$1",
    },
    '@types/(.*)': {
      transform: "@/types/$1",
    }
  },

  // 确保styled-jsx配置正确
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig; 