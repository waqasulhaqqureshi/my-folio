"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service in production
    if (process.env.NODE_ENV === "production") {
      console.error("Application error:", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0E1016] text-[#e4ded7] gap-6 p-8">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
        Something went wrong!
      </h2>
      <p className="text-center text-lg sm:text-xl max-w-md">
        We encountered an unexpected error. Please try again or return to the homepage.
      </p>
      <div className="flex gap-4 flex-col sm:flex-row">
        <button
          onClick={reset}
          className="rounded-md bg-white/10 px-6 py-3 text-white hover:bg-white/20 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md bg-white/10 px-6 py-3 text-white hover:bg-white/20 transition-colors text-center"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

