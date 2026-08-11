import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPost, getPostSlugs } from "../../lib/posts";
import SafeImage from "../../components/SafeImage";
import ArticleChrome from "./ArticleChrome";
import TocList from "./TocList";
import "../article.css";

/*
 * Posts are known at build time, so pre-render every one and refuse anything
 * else. dynamicParams=false turns an unknown slug into a 404 without ever
 * hitting the filesystem — the route becomes fully static.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    // The canonical points at the original Hashnode article: this is a
    // republished copy, and claiming the canonical would compete with the
    // author's own ranking for identical text.
    alternates: { canonical: post.canonical || undefined },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      tags: post.tags,
      images: post.cover ? [{ url: post.cover, width: 1200, height: 630, alt: post.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.cover ? [post.cover] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const others = (await getAllPosts()).filter((p) => p.slug !== slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.cover ? [post.cover] : undefined,
    datePublished: post.date,
    keywords: post.tags.join(", "),
    mainEntityOfPage: post.canonical || undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Static, server-authored object — not user input. JSON.stringify is
        // safe here because no field can contain a `</script>` sequence.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ArticleChrome />

      <article className="min-h-screen bg-canvas pb-[clamp(4rem,10vw,9rem)] pt-[clamp(1.5rem,3vw,3rem)] text-ink">
        <div className="nm-container">
          <Link
            href="/blog"
            className="nm-chip inline-flex items-center gap-2 bg-ink text-accent transition-transform duration-300 hover:-translate-x-1"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All writing
          </Link>

          <header className="mt-[clamp(1.5rem,3vw,3rem)] flex flex-col gap-[clamp(1rem,1.6vw,1.75rem)]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="nm-eyebrow">{post.dateLabel}</span>
              <span className="nm-small text-ink-50">{post.readingTime}</span>
            </div>

            <h1 className="nm-h2 max-w-[20ch]">{post.title}</h1>

            {post.excerpt && (
              <p className="nm-body max-w-[62ch] text-[clamp(0.95rem,1.25vw,1.4rem)]">
                {post.excerpt}
              </p>
            )}

            {post.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li key={tag} className="nm-chip bg-chip">
                    #{tag}
                  </li>
                ))}
              </ul>
            )}
          </header>

          {post.cover && (
            <div className="nm-plate relative mt-[clamp(2rem,3.5vw,3.5rem)] aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-card)]">
              <SafeImage
                src={post.cover}
                alt=""
                fill
                priority
                sizes="(max-width: 767px) 100vw, 93vw"
                className="object-cover"
              />
            </div>
          )}

          {/*
            The contents rail is sticky in its own column on desktop and hidden
            below lg. Grid (not float) so the prose column keeps a hard max
            measure rather than wrapping around the rail.
          */}
          <div className="mt-[clamp(2.5rem,4.5vw,4.5rem)] grid grid-cols-1 gap-[clamp(2rem,3vw,4rem)] lg:grid-cols-[minmax(0,1fr)_15rem]">
            <div
              className="post-body max-w-[68ch]"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />

            {post.headings.length > 1 && (
              <aside className="hidden lg:block">
                <div className="lg:sticky lg:top-[clamp(2rem,5vw,5rem)]">
                  <TocList headings={post.headings} />
                </div>
              </aside>
            )}
          </div>

          <footer className="mt-[clamp(3rem,6vw,6rem)] border-t border-[var(--line)] pt-[clamp(2rem,3vw,3rem)]">
            {post.canonical && (
              <p className="nm-small text-ink-50">
                Originally published at{" "}
                <a
                  href={post.canonical}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-ink"
                >
                  blog.victorwilliams.me
                </a>
              </p>
            )}

            {others.length > 0 && (
              <div className="mt-[clamp(2rem,3vw,3rem)]">
                <h2 className="nm-h3 mb-6">Keep reading</h2>
                <ul className="grid grid-cols-1 gap-[clamp(1rem,1.5vw,2rem)] sm:grid-cols-2">
                  {others.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/blog/${p.slug}`}
                        className="nm-card-framed group nm-pad flex h-full flex-col gap-4 transition-transform duration-500 ease-[var(--ease-nm)] hover:-translate-y-1"
                      >
                        <div className="nm-plate relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-inner)]">
                          <SafeImage
                            src={p.cover}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 92vw, 420px"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        </div>
                        <h3 className="font-display text-[16px] font-medium uppercase leading-snug tracking-wide md:text-[18px]">
                          {p.title}
                        </h3>
                        <span className="nm-chip mt-auto bg-ink text-accent">{p.dateLabel}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </footer>
        </div>
      </article>
    </>
  );
}
