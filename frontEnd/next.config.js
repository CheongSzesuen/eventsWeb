/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // 仅转发环境变量，移除硬编码ID
    NEXT_PUBLIC_GA_ID: process.env.GOOGLE_ANALYTICS, // 完全依赖环境变量
    NEXT_PUBLIC_WORKER_URL: process.env.NEXT_PUBLIC_WORKER_URL,
  },
  serverRuntimeConfig: {
    WORKER_URL: process.env.WORKER_URL
  }
};

// 调试日志（构建后自动删除）
if (process.env.NODE_ENV !== 'production') {
  console.log('[DEBUG] GA ID:', process.env.GOOGLE_ANALYTICS ? '***MASKED***' : 'undefined');
}

module.exports = nextConfig;
