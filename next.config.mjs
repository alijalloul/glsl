/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl)$/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;
