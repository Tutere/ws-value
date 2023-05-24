import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import AuthGuard from "~/components/AuthGuard";
import { Navbar } from "~/components/ui/navbar";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Url } from "next/dist/shared/lib/router/router";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {


  //setup to handle loading states when using the Navbar
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClickLink = (path: Url) => {
    setIsLoading(true);
    router.push(path); //is this needed??
  };

  // Handle the router change events to remove the loading state when the new page has rendered
  useEffect(() => {
    const handleRouteChangeComplete = () => {
      setIsLoading(false);
    };

    router.events.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, []);

  return (
    <SessionProvider session={session}>
      <AuthGuard>
      <Navbar onClickLink={handleClickLink} />
        {isLoading ? (
          <div className="flex justify-center items-center h-screen text-7xl"> ⏳</div>
        ) : (
          <Component {...pageProps} />
        )}
      </AuthGuard>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
