import React from "react";
import { User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

type Props = {
  user?: null | User;
};

const Navigation = ({ user }: Props) => {
  return (
    <div className="p-2 flex item-center justify-between relative">
      <aside className="flex items-center gap-2">
        <Image src="./pixora1.svg" alt="logo" width={200} height={200} />
      </aside>
      <nav className="hidden md:block absolute left-[50%] top-[50%]  transform translate-x-[-50%] translate-y-[-50%]">
        <ul className="flex items-center justify-center gap-8">
          <Link href="#">Home</Link>
          <Link href="#">About</Link>
          <Link href="#">Contact</Link>
          <Link href="#">Contact</Link>
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
      </aside>
    </div>
  );
};
export default Navigation;
