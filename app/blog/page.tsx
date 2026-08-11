import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "../lib/posts";
import SafeImage from "../components/SafeImage";

export const metadata: Metadata = {
  title: "Writing",
  description: "Articles on React, animation, design collaboration and frontend engineering.",
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <main className="min-h-screen bg-canvas pb-[clamp(4rem,10vw,9rem)] pt-[clamp(1.5rem,3vw,3rem)] text-ink">
      <div className="nm-container">
        <Link
          href="/#blog"
          className="nm-chip inline-flex items-center gap-2 bg-ink text-accent transition-transform duration-300 hover:-translate-x-1"
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to portfolio
        </Link>

        <header className="mt-[clamp(1.5rem,3vw,3rem)] flex flex-col items-start gap-4 md:gap-5">
          <span className="nm-eyebrow">Writing</span>
          <h1 className="nm-h2">From the blog</h1>
          <p className="nm-body max-w-[46ch]">
            Articles to reinforce knowledge and help others building something similar.
          </p>
        </header>

        <ul className="mt-[clamp(2.5rem,4.5vw,4.5rem)] grid grid-cols-1 gap-[clamp(1rem,1.5vw,2rem)] sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="nm-card-framed group nm-pad flex h-full flex-col gap-4 transition-transform duration-500 ease-[var(--ease-nm)] hover:-translate-y-1"
              >
                <div className="nm-plate relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-inner)]">
                  <SafeImage
                    src={post.cover}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>

                <h2 className="font-display text-[16px] font-medium uppercase leading-snug tracking-wide md:text-[18px]">
                  {post.title}
                </h2>

                <p className="nm-small line-clamp-3 text-ink/70">{post.excerpt}</p>

                <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                  <span className="nm-chip bg-ink text-accent">{post.dateLabel}</span>
                  <span className="nm-small text-ink/60">{post.readingTime}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
