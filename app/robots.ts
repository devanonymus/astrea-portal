import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/professionista", "/area-riservata", "/api/", "/completa-profilo", "/reimposta-password", "/verifica-email", "/accedi"] }, ...(process.env.APP_URL ? { sitemap: `${new URL(process.env.APP_URL).origin}/sitemap.xml` } : {}) }; }
