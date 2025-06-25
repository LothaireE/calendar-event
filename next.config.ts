import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // get rid of the default cache behaviour
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
