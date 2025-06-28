// frontend/next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    WORKER_URL: process.env.WORKER_URL,
    NEXT_PUBLIC_WORKER_URL: process.env.NEXT_PUBLIC_WORKER_URL,
  },
}

module.exports = nextConfig