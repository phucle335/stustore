import type { NextConfig } from "next";
import { buildImageRemotePatterns } from "@/lib/store/allowed-image-hosts";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: buildImageRemotePatterns(),
  },
};

export default nextConfig;
