import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // get rid of the default cache behaviour
  experimental: {
    // might be useless as it's next version > 15
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
