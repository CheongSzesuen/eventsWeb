// frontEnd/next.config.js
const path = require('path');

module.exports = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    config.resolve.alias['@utils'] = path.join(__dirname, 'utils');
    return config;
  },
  // 移除不必要的重写规则
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/events/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787'}/api/events/:path*`
  //     }
  //   ]
  // },
  env: {
    NEXT_PUBLIC_WORKER_URL: process.env.NEXT_PUBLIC_WORKER_URL,
    
  },
};
