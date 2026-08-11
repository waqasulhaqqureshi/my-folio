import { MetadataRoute } from "next";
import { getAllPosts } from "./lib/posts";

/*
 * The previous version listed /about-section, /work-section, … which are not
 * routes — they are on-page anchors of the single-page portfolio. Submitting
 * URLs that 404 wastes crawl budget and reports as sitemap errors, so only
 * real routes are emitted here.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";
  const posts = await getAllPosts();

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      // Publication date, not build time: a stable value tells crawlers the
      // content has not changed between deploys.
      lastModified: post.date ? new Date(post.date) : new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
