import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { blogPosts } from "@/content/blog";
import { getProgramsServer } from "@/lib/programsServer";
import { programSlug } from "@/lib/programs";

// read on every request so newly added programs show up without a redeploy
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/about",
    "/programs",
    "/admission",
    "/books",
    "/gallery",
    "/contact",
    "/teachers",
    "/blog",
    "/notices",
    "/practical-learning",
    "/resources",
    "/scholarship",
    "/faq",
    "/verify",
    "/admission-policy",
    "/refund-policy",
    "/terms",
    "/privacy-policy",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const blogRoutes = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const programs = await getProgramsServer();
  const programRoutes = programs.map((p) => ({
    url: `${SITE_URL}/programs/${programSlug(p)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...programRoutes, ...blogRoutes];
}
