"use client";

import React, { useEffect, useState } from "react";
import { User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { ModeToggle } from "@/components/global/mode-toggle";

type Props = {
  user?: null | User;
};

const Navigation = ({ user }: Props) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine logo based on theme (default to green for SSR)
  const logoSrc =
    mounted && resolvedTheme === "dark"
      ? "/pixora_dark_mode.svg"
      : "/pixora_green.svg";

  return (
    <div className="p-4 flex items-center justify-between relative">
      <aside className="flex items-center gap-2">
        {/* Adjust width/height to resize the logo */}
        <div className="relative w-[200px] h-[80px] overflow-hidden">
          <Image
            src={logoSrc}
            alt="logo"
            fill
            className="object-contain object-left"
          />
        </div>
      </aside>
      <nav className="hidden md:block absolute left-[50%] top-[50%]  transform translate-x-[-50%] translate-y-[-50%]">
        <ul className="flex items-center justify-center gap-8">
          <Link href="#">Home</Link>
          <Link href="#">About</Link>
          <Link href="#">Contact</Link>
          <Link href="#">Pricing</Link>
        </ul>
      </nav>
      <aside className="flex items-center gap-2">
        <Link
          href={"/agency/sign-in"}
          className="bg-primary text-white p-2 px-4 rounded-md hover:bg-primary/80"
        >
          Login
        </Link>
        <UserButton />
        <ModeToggle />
      </aside>
    </div>
  );
};
export default Navigation;
