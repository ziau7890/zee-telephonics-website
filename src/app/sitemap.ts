import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { posts } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/features", "/solutions", "/industries", "/pricing", "/about", "/resources", "/contact", "/demo", "/login", "/signup"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...posts.map((p) => ({ url: `${site.url}/resources/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
