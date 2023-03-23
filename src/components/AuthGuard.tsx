import { signIn, signOut, useSession } from "next-auth/react";
import React, { ReactNode } from "react";
import { Button } from "./ui/Button";

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { data: sessionData, status } = useSession();

  switch (status) {
    case "loading":
      return <div>⏳</div>;
    case "unauthenticated":
      return (
        <Button
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          {sessionData ? "Sign out" : "Sign in"}
        </Button>
      );
    case "authenticated":
      return <div>{children}</div>;

    default:
      return <div>Unknown status: {status}</div>;
  }
};
export default AuthGuard;
