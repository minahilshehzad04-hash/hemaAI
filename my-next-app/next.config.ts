import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "react-icons", "@heroicons/react", "flowbite-react", "@headlessui/react"],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
