  // next.config.js
  const nextConfig = {
    reactStrictMode: true,
    env: {
      // 仅保留必要的变量
      NEXT_PUBLIC_WORKER_URL: process.env.NEXT_PUBLIC_WORKER_URL,
    },
  };
  