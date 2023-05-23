import React from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./Button";

interface NavbarProps {
  onClickLink: (path: string) => void;
}

export function Navbar({onClickLink}: NavbarProps) {
    const { data: sessionData } = useSession();
    
  return (
    <div className="sticky top-0">
      <div className="flex items-center justify-between bg-gray-800 h-[70px]">
        <div className="flex items-center px-8 cursor-pointer">
          <Link href={"/"} onClick={() => onClickLink("/")}>
            <h1 className="text-xl font-bold text-white cursor-pointer mr-14">
              Measuring Value
            </h1>
          </Link>
          <div className="flex items-center gap-8">
          <Link href={"/"} className="text-white" onClick={() => onClickLink("/")}>
            Home
          </Link>
          <Link href={"/monthlyReport"} className="text-white" onClick={() => onClickLink("/monthlyReport")}>
            Monthly Report
          </Link>
          <Link href={"/emailPreferences"} className="text-white" onClick={() => onClickLink("/emailPreferences")}>
            Email Preferences
          </Link>
          <Link href={"/newProject"} className="text-white" onClick={() => onClickLink("/newProject")}>
            <Button variant={"subtle"}>
              Start New Project
            </Button>
          </Link>
          </div>
        </div>
        <div className="px-8 cursor-pointer">
            <button
            className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
            onClick={sessionData ? () => void signOut() : () => void signIn()}
            >
            {sessionData ? "Sign out" : "Sign in"}
            </button>
        </div>
      </div>
    </div>
  );
}
