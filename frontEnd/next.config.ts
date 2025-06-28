import type { NextConfig } from 'next'
import path from 'path' // 添加path模块导入

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export', // 静态导出必需
  distDir: 'out',   // 明确输出目录
  
  // 环境变量配置
  env: {
    WORKER_URL: process.env.WORKER_URL,
    NEXT_PUBLIC_WORKER_URL: process.env.NEXT_PUBLIC_WORKER_URL || 'game-events-api.cheongszesuen.workers.dev',
  },

  // 静态资源设置
  images: {
    unoptimized: true, // 必须禁用优化
  },

  // 路径别名配置
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    }
    return config
  }
}

export default nextConfig