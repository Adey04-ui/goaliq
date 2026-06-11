/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ["media.api-sports.io", "lh3.googleusercontent.com"],
  },
};

export default nextConfig;
