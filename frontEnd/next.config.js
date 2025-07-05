/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID, // 直接使用 .env.local 中的值
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
