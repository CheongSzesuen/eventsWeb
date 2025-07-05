// frontEnd/next.config.js
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/events/:path*',
        destination: `${process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787'}/api/events/:path*`
      }
    ]
  },
  env: {
    NEXT_PUBLIC_WORKER_URL: process.env.NEXT_PUBLIC_WORKER_URL,
  },
};

module.exports = nextConfig;
