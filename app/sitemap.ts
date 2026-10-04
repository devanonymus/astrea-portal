import type { MetadataRoute } from "next";
import { publicContent } from "@/lib/public-content";
export default function sitemap(): MetadataRoute.Sitemap { if (!process.env.APP_URL) return []; const origin = new URL(process.env.APP_URL).origin; return ["", "sportello-tecnologico", "contatti", ...Object.keys(publicContent)].map(path=>({ url: `${origin}/${path}` })); }
