import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/Button";
import { LoadingPage } from "~/components/ui/loading";
import { Card } from "~/components/ui/Card";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const utils = api.useContext().projects;
 
  const {data: projects, isLoading, } = api.projects.read.useQuery(undefined, {
    onError: (error) => {
      console.error(error);
    },
  });
//test

  if (isLoading) {
    return (
      <LoadingPage></LoadingPage>
    );
  }

  return (
    <>
      <Head>
        <title>WS Value</title>
        <meta name="description" content="Measure Value" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="p-8 ">
          <div>
            <h2 className="text-3xl font-bold mb-3">Current Projects</h2>
            <div className="flex flex-row flex-wrap gap-5 py-4">
              {projects &&
                projects.map((project) => {
                  if (project.status == "Active") {

                    return (
                      <Card project={project}></Card>
                    );
                  }
                })}
            </div>
            <Link href={"/newProject"}>
              <Button
                type="submit"
                variant={"withIcon"}
                className="text-green-600 my-3"
              >
                <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current"  viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"></path>
                </svg>
                Start New Project
              </Button>
            </Link>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-bold">Completed Projects</h2>
            <div className="flex flex-row flex-wrap gap-5 py-4">
              {projects &&
                projects.map((project) => {
                  if (project.status == "Complete") {
                    return (
                      <Card project={project}></Card>
                    );
                  }
                })}
            </div>
          </div>

          <h2 className="py-8 text-2xl font-bold">
            Value Created Across All Projects
          </h2>
          <div>
            <p>TO BE COMPLETED</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
