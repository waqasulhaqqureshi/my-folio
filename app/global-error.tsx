"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0E1016] text-[#e4ded7] gap-6 p-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Something went wrong!
          </h2>
          <p className="text-center text-lg sm:text-xl max-w-md">
            A critical error occurred. Please refresh the page or try again later.
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-white/10 px-6 py-3 text-white hover:bg-white/20 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

