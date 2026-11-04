import type { MetadataRoute } from "next";
import { URL_SITIO } from "./_datos/catalogo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/pedido/" },
    sitemap: URL_SITIO ? `${URL_SITIO}/sitemap.xml` : undefined,
  };
}
