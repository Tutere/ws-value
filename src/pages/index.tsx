import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import ProjectForm from "~/components/forms/ProjectForm";
import { Button } from "~/components/ui/Button";

const Home: NextPage = () => {
  const utils = api.useContext().projects;
  const query = api.projects.read.useQuery(undefined, {
    suspense: true,
    onError: (error) => {
      console.error(error);
    },
  });

  const projects = query.data;

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
                  if(project.status=="Active"){
                    return (
                      <Link
                        href={"/" + project.id}
                        key={project.id}
                        style={{ backgroundColor: `${project.colour}` }}
                        className="basis-60 overflow-hidden p-4 shadow sm:rounded-lg"
                      >
                        <div className="flex justify-start">
                          <div className="text-lg mr-2">{project.icon}</div>
                          <h3 className="text-xl font-bold">{project.name}</h3>
                        </div>
  
                        <p className="line-clamp-3 m-1 italic text-sm" >{project.description}</p>
                      </Link>
                    )
                  }
;
                })}
            </div>
            <Link href={"/newProject"}>
              <Button type="submit" variant={"default"} className="bg-green-500">
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
                        style={{ backgroundColor: `#${project.colour}` }}
                        className="basis-60 overflow-hidden p-4 shadow sm:rounded-lg"
                      >
                        <div className="flex justify-start">
                          <div className="text-lg mr-2">{project.icon}</div>
                          <h3 className="text-xl font-bold">{project.name}</h3>
                        </div>

                        <p className="line-clamp-3 m-1 italic text-sm" >{project.description}</p>
                      </Link>
                    )
                  }

                  ;
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
