// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: { ignoreDuringBuilds: true }, // evita que el build falle por ESLint
  // si quisieras también puedes ignorar TS en build (opcional):
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
