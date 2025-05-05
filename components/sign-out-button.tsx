"use client";

import { useTransition } from "react";
import { signOut } from "@/lib/actions/auth.action";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SignOutButton = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut(); // this will clear the session
      router.push("/sign-in"); // redirect to sign-in page
    });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="flex items-center gap-2"
    >
      <Image src="/logout.png" alt="Logout" width={38} height={32} />
      <h2 className="text-primary-100">{isPending ? "Signing out..." : "Sign Out"}</h2>
    </button>
  );
};

export default SignOutButton;
