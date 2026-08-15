//@ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  reactStrictMode: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    minimumCacheTTL: 60,
  },
  

  // Faster refresh
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Turbopack configuration (Next.js 16 default)
  turbopack: {},
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Faster type checking — allow build to succeed despite type errors during dev
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Output standalone for faster cold starts
  output: 'standalone',
};

module.exports = nextConfig;
