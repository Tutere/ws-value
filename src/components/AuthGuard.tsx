import { signIn, signOut, useSession } from "next-auth/react";
import React, { ReactNode } from "react";
import { Button } from "./ui/Button";

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { data: sessionData, status } = useSession();

  switch (status) {
    case "loading":
      return <div className="flex justify-center items-center h-screen text-7xl">
        ⏳</div>;
    case "unauthenticated":
      return (
        <div className="flex justify-center items-center h-screen">
          <Button
            onClick={sessionData ? () => void signOut() : () => void signIn()}
          >
            {sessionData ? "Sign out" : "Sign in"}
          </Button>
        </div>
      );
    case "authenticated":
      return <div>{children}</div>;

    default:
      return <div>Unknown status: {status}</div>;
  }
};
export default AuthGuard;
