import Link from "next/link";
import Image from "next/image";
import React from "react";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-svh justify-center items-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href={"/"}
          className="flex items-center gap-2 self-center font-medium"
        >
          <Image
            src="/mainAssets/logoDark.svg"
            alt="Zach Coding Interview"
            width={300}
            height={300}
          />
        </Link>
        {children}
      </div>
    </div>
  );
};
