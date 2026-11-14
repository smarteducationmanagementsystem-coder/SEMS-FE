import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      { source: "/admin/signup", destination: "/signup", permanent: false },
      { source: "/admin/login", destination: "/login", permanent: false },
      { source: "/admin", destination: "/dashboard", permanent: false },
      { source: "/admin/:path*", destination: "/dashboard/:path*", permanent: false },
      { source: "/shop", destination: "/", permanent: false },
      { source: "/shop/:path*", destination: "/", permanent: false },
      { source: "/collections", destination: "/", permanent: false },
      { source: "/collections/:path*", destination: "/", permanent: false },
      { source: "/solutions", destination: "/", permanent: false },
      { source: "/solutions/:path*", destination: "/", permanent: false },
      { source: "/new-arrivals", destination: "/features", permanent: false },
      { source: "/products/:path*", destination: "/features", permanent: false },
      { source: "/wishlist", destination: "/features", permanent: false },
      { source: "/account", destination: "/dashboard", permanent: false },
      { source: "/search", destination: "/faq", permanent: false },
      { source: "/shipping", destination: "/faq", permanent: false },
      { source: "/returns", destination: "/faq", permanent: false },
      { source: "/size-guide", destination: "/faq", permanent: false },
      { source: "/features", destination: "/service", permanent: false },
      { source: "/abilities", destination: "/service", permanent: false },
    ];
  },
  images: {
    qualities: [75],
  },
};

export default nextConfig;
