/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // 明确使用 GOOGLE_ANALYTICS 作为前端变量
    NEXT_PUBLIC_GA_ID: process.env.GOOGLE_ANALYTICS, // 直接映射
    NEXT_PUBLIC_WORKER_URL: process.env.NEXT_PUBLIC_WORKER_URL,
  },
  serverRuntimeConfig: {
    WORKER_URL: process.env.WORKER_URL
  }
};

module.exports = nextConfig;
