import React from "react";
import Link from "next/link";
import Image from "next/image";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas p-8 text-ink">
      <h1 className="nm-display text-ink">404</h1>
      <p className="nm-h3 uppercase text-center">Page Not Found</p>
      <p className="nm-body max-w-md text-center">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Image
        src="https://user-images.githubusercontent.com/84178696/228884970-66a9687c-b364-48e4-91ca-05332dadbba9.png"
        alt="404 Error"
        width={858}
        height={483}
        className="w-[90%] rounded-[var(--radius-card)] sm:w-[80%] md:w-[70%] lg:w-[60%]"
        priority
      />
      <div className="mt-4">
        <Link href="/" className="nm-btn">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
