import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { LoadingPage } from "~/components/ui/loading";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const utils = api.useContext().projects;
  const [loading, setLoading] = useState(false);
  const query = api.projects.read.useQuery(undefined, {
    suspense: true,
    onError: (error) => {
      console.error(error);
    },
  });

  const projects = query.data;

  if (loading) {
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
            <h2 className="text-3xl font-bold">Current Projects</h2>
            <div className="flex flex-row flex-wrap gap-5 py-4">
              {projects &&
                projects.map((project) => {
                  if (project.status == "Active") {
                    return (
                      <Link
                        href={"/" + project.id}
                        key={project.id}
                        style={{
                          borderTopColor: `${project.colour}`,
                          borderTopStyle: "solid",
                          borderTopWidth: "thick",
                        }}
                        className={`top-4 basis-60 overflow-hidden rounded-lg p-4 shadow`}
                        onClick={() => setLoading(true)}
                      >
                        <div className="flex justify-start">
                          <div className="mr-2 text-lg">{project.icon}</div>
                          <h3 className="text-xl font-bold">{project.name}</h3>
                        </div>

                        <p className="m-1 text-sm italic line-clamp-3">
                          {project.description}
                        </p>
                      </Link>
                    );
                  }
                })}
            </div>
            <Link href={"/newProject"}>
              <Button
                type="submit"
                variant={"default"}
                className="bg-green-500"
              >
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
                      <Link
                        href={"/" + project.id}
                        key={project.id}
                        style={{
                          borderTopColor: `${project.colour}`,
                          borderTopStyle: "solid",
                          borderTopWidth: "thick",
                        }}
                        className={`top-4 basis-60 overflow-hidden rounded-lg p-4 shadow`}
                        onClick={() => setLoading(true)}
                      >
                        <div className="flex justify-start">
                          <div className="mr-2 text-lg">{project.icon}</div>
                          <h3 className="text-xl font-bold">{project.name}</h3>
                        </div>

                        <p className="m-1 text-sm italic line-clamp-3">
                          {project.description}
                        </p>
                      </Link>
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
