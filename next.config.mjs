/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      canvas: false, // Prevent Konva from requiring node-canvas
    };
    return config;
  },
};

export default nextConfig;


