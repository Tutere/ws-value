import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import ProjectForm from "~/components/forms/ProjectForm";
import { Button } from "~/components/ui/Button";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>WS Value</title>
        <meta name="description" content="Measure Value" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="p-8">
          <ProjectForm />
        </div>
      </main>
    </>
  );
};

export default Home;

