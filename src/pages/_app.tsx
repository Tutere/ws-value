import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import AuthGuard from "~/components/AuthGuard";
import { Navbar } from "~/components/ui/navbar";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <AuthGuard>
        <Navbar />
        <Component {...pageProps} />
      </AuthGuard>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
