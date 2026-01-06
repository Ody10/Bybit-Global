/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  
  // Dynamic configuration based on BUILD_MODE
  output: process.env.BUILD_MODE === 'mobile' ? 'export' : undefined,
  
  images: {
    unoptimized: process.env.BUILD_MODE === 'mobile',
  },
  
  // CORS headers for API routes (only applies to backend)
  async headers() {
    // Skip headers for mobile build (no API routes)
    if (process.env.BUILD_MODE === 'mobile') {
      return []
    }
    
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGINS || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS,PATCH' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig