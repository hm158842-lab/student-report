/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Notion 이미지를 사용하는 경우 도메인 추가
  images: {
    domains: ['www.notion.so', 's3.us-west-2.amazonaws.com'],
  },
}

module.exports = nextConfig
