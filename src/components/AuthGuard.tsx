import { signIn, signOut, useSession } from "next-auth/react";
import React, { ReactNode } from "react";
import { Button } from "./ui/Button";
import { useRouter } from "next/router";

const AuthGuard = ({ children, }: { children: ReactNode, }) => {
  const { data: sessionData, status } = useSession();

  // const router = useRouter();
  // const isPublicPage = router.pathname.includes("stakeholderSurvey");

  switch (status) {
    case "loading":
      return <div className="flex justify-center items-center h-screen text-7xl">
        ⏳</div>;
    case "unauthenticated":
      // if (isPublicPage) {
      //   return <div>{children}</div>;
      // }
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
