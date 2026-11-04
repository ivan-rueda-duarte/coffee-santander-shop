import type { NextConfig } from "next";

// GitHub Pages solo sirve archivos estáticos: exportamos HTML en `out/`.
// El basePath solo se aplica en el despliegue (GITHUB_PAGES=true).
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "coffee-santander-shop";
const enPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: enPages ? `/${repo}` : "",
  assetPrefix: enPages ? `/${repo}/` : undefined,
  env: { NEXT_PUBLIC_BASE_PATH: enPages ? `/${repo}` : "" },
};

export default nextConfig;
