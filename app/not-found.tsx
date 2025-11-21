import React from "react";
import Link from "next/link";
import Image from "next/image";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0E1016] text-[#e4ded7] gap-6 p-8">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">404</h1>
      <p className="text-xl sm:text-2xl md:text-3xl text-center">
        Page Not Found
      </p>
      <p className="text-center text-lg max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Image
        src="https://user-images.githubusercontent.com/84178696/228884970-66a9687c-b364-48e4-91ca-05332dadbba9.png"
        alt="404 Error"
        width={858}
        height={483}
        className="w-[90%] sm:w-[80%] md:w-[70%] lg:w-[60%] rounded-lg"
        priority
      />
      <div className="mt-4">
        <Link
          href="/"
          className="text-xl sm:text-2xl md:text-3xl uppercase hover:underline underline-offset-2 transition-all"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
