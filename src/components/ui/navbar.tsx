import React from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./Button";


export function Navbar() {
    const { data: sessionData } = useSession();
    
  return (
    <div className="sticky top-0">
      <div className="flex items-center justify-between bg-gray-800 h-[70px]">
        <div className="flex items-center px-8 cursor-pointer">
          <Link href={"/"} >
            <h1 className="text-xl font-bold text-white cursor-pointer mr-14">
              Measuring Value
            </h1>
          </Link>
          <div className="flex items-center gap-8">
          <Link href={"/"} className="text-white" >
            Home
          </Link>
          <Link href={"/monthlyReport"} className="text-white">
            Monthly Report
          </Link>
          <Link href={"/emailPreferences"} className="text-white">
            Email Preferences
          </Link>
          <Link href={"/newProject"} className="text-white">
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
