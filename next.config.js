import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import './src/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint errors
  },
  webpack(config) {
    config.resolve.alias['~'] = resolve(__dirname, 'src');
    return config;
  },
};

export default nextConfig;