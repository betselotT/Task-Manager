import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";
import SignOutButton from "@/components/sign-out-button";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav className="flex items-center p-10 gap-400">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Tick Logo" width={60} height={60} />
          <h2 className="text-primary-100">Tick</h2>
        </Link>
        <SignOutButton />
      </nav>

      {children}
    </div>
  );
};

export default Layout;
