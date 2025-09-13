/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-*', 'lucide-react', 'sonner'],
  },
};

module.exports = nextConfig;
