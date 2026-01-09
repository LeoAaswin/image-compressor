/** @type {import('next').NextConfig} */
const nextConfig = {

  images: { unoptimized: true },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-*', 'lucide-react', 'sonner'],
  },
};

module.exports = nextConfig;
