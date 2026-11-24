/** @type {import('next').NextConfig} */
const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");

const nextConfig = {
  // The browser only ever talks to this server. /api/* and /uploads/* are forwarded to FastAPI,
  // so no URL, IP or CORS setting is baked into the frontend (works from any VM address).
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      { source: "/uploads/:path*", destination: `${BACKEND_URL}/uploads/:path*` },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "10.**" },
      { protocol: "http", hostname: "192.168.**" },
      { protocol: "http", hostname: "172.**" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
