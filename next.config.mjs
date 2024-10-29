/** @type {import("next").NextConfig} */
const nextConfig = {
  // output: "standalone",
  reactStrictMode: false,
  images: {
    domains: ["localhost", "image.ocean00.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "pub-b7fd9c30cdbf439183b75041f5f71b92.r2.dev",
        port: "",
      },
      {
        protocol: "http",
        hostname: "image.ocean00.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https", // Also allow HTTPS
        hostname: "image.ocean00.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
