import { Label } from "@radix-ui/react-label";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DeletionDialog } from "~/components/ui/deletionDialog";
import { useZodForm } from "~/hooks/useZodForm";
import { ProjectChangeSchema } from "~/schemas/projectTracker";
import { ActivateProjectSchema } from "~/schemas/projects";
import { api } from "~/utils/api";
import { Button } from "../components/ui/Button";
import { useProjectDeletion } from "~/hooks/useProjectDeletion";
import { LoadingPage } from "~/components/ui/loading";

export default function Project() {
  const router = useRouter();
  const id = router.query.projectID as string;
  const utils = api.useContext().activities;

  const {data: project, isLoading} = api.projects.FindByProjectId.useQuery(
    { id: id },
    {
      suspense: true,
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          router.push("/");
        }
      },
    }
  );

  const activities = project?.Activity;

  const { data: sessionData } = useSession();
  const isMemberFound = project?.members.some((member) => {
    return member.userId === sessionData?.user.id;
  });

  const { projectDelete } = useProjectDeletion(id);

  useEffect(() => {
    if (!isMemberFound) {
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  }, [isMemberFound, router]);

  //project members
  const queryUsers = api.users.read.useQuery(undefined, {
    suspense: true,
    onError: (error) => {
      console.error(error);
    },
  });

  const users = queryUsers.data;

  const projectMembers = project?.members.map((member) =>
    users?.find((user) => user.id === member.userId)
  );

  const mutation = api.projects.activate.useMutation({
    onSuccess: async () => {
      await utils.read.invalidate();
    },
  });

  const methods = useZodForm({
    schema: ActivateProjectSchema,
    defaultValues: {
      status: "Active",
      id: project?.id,
    },
  });

  //data lineage for "reactivating" a project

  const mutationProjecTracker = api.projectTracker.edit.useMutation({});

  const methodProjectTracker = useZodForm({
    schema: ProjectChangeSchema,
    defaultValues: {
      changeType: "Re-Activate",
      projectId: project?.id.toString(),
      icon: project?.icon?.toString(),
      name: project?.name?.toString(),
      description: project?.description?.toString(),
      goal: project?.goal?.toString(),
      estimatedStart: project?.estimatedStart?.toISOString(),
      estimatedEnd: project?.estimatedEnd?.toISOString()?? "",
      trigger: project?.trigger?.toString(),
      expectedMovement: project?.expectedMovement?.toString(),
      alternativeOptions: project?.alternativeOptions?.toString(),
      estimatedRisk: project?.estimatedRisk?.toString(),
      outcomeScore: project?.outcomeScore!,
      effortScore: project?.effortScore!,
      actualStart: project?.actualStart?.toISOString(),
      actualEnd: project?.actualEnd?.toISOString(),
      lessonsLearnt: project?.lessonsLearnt!,
      retrospective: project?.retrospective!,
      status: project?.status!,
      colour: project?.colour!,
      stakeholders: project?.stakeholders! || "",
      members: project?.members.map(member => member.userId),
    },
  });

  useEffect(() => { 
    if (project) {
      methodProjectTracker.reset({
        changeType: "Re-Activate",
        projectId: project.id.toString(),
        icon: project.icon?.toString(),
        name: project.name?.toString(),
        description: project.description?.toString(),
        goal: project.goal?.toString(),
        estimatedStart: project.estimatedStart?.toISOString(),
        estimatedEnd: project.estimatedEnd?.toISOString() ?? "",
        trigger: project.trigger?.toString(),
        expectedMovement: project.expectedMovement?.toString(),
        alternativeOptions: project.alternativeOptions?.toString(),
        estimatedRisk: project.estimatedRisk?.toString(),
        outcomeScore: project.outcomeScore!,
        effortScore: project.effortScore!,
        actualStart: project.actualStart?.toISOString(),
        actualEnd: project.actualEnd?.toISOString(),
        lessonsLearnt: project.lessonsLearnt!,
        retrospective: project.retrospective!,
        status: project.status!,
        colour: project.colour!,
        stakeholders: project.stakeholders! || "",
        members: project.members.map((member) => member.userId),
      });
    }
  }, [project, methodProjectTracker]);

  //used for read more button
  const [isReadMoreShown, setIsReadMoreShown] = useState(false);
  const toggleReadMore = () => {
    setIsReadMoreShown(prevState => !prevState)
  }
  if (isLoading) {
    return <LoadingPage></LoadingPage>
  }
  if (project === null || project === undefined) {
    return <p>Error finding project</p>
  }
  return (
    <>
      {isMemberFound ? (
        <div className="p-8"
        style={{
          borderTopColor: `${project.colour}`,
          borderTopStyle: "solid",
          borderTopWidth: "10px",
        }}
        >

          <h2 className="mb-5 text-3xl font-bold">{project.name}</h2>
          <div 
          className={`${isReadMoreShown ? 'max-h-[1000px]' : 'max-h-0'} transition-all duration-500 ease overflow-hidden`} //won't stretch to max height unless content fills that much space
          >
              <div className="flex flex-row">
                <Label className="font-medium">Goal:</Label>
                <p className="ml-1">{project.goal}</p>
              </div>
              
              <div className="flex flex-row">
                <Label className="font-medium">Estimated Start Date:</Label>
                <p className="ml-1">
                  {project.estimatedStart.toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-row">
                <Label className="font-medium">Description:</Label>
                <p className="ml-1">{project.description}</p>
              </div>
              <div className="flex flex-row">
                <Label className="font-medium">Project Members:</Label>
                <p className="ml-1">
                  {projectMembers?.map((member) => member?.name).join(", ")}
                </p>
              </div>
              <div className="flex flex-row">
                <Label className="font-medium">Stakeholders:</Label>
                <p className="ml-1">{project.stakeholders}</p>
              </div>
              <div className="flex flex-row">
                <Label className="font-medium">
                  Link to Project Initiation Document:{" "}
                </Label>
                {project.pid ? (
                  <a
                    className="ml-1 text-blue-600 hover:underline"
                    href={project.pid ?? ""}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Click Here
                  </a>
                ) : (
                  <p className="ml-1"> N/A</p>
                )}
              </div>
            
            <div className="flex flex-row">
              <Label className="font-medium">Trigger:</Label>
              <p className="ml-1">{project.trigger === "" ? "N/A" : project.trigger}</p>
            </div>
            <div className="flex flex-row">
              <Label className="font-medium">Expected Outcome:</Label>
              <p className="ml-1">{project.expectedMovement === "" ? "N/A" : project.expectedMovement}</p>
            </div>
            <div className="flex flex-row">
              <Label className="font-medium">Alternatives Considered:</Label>
              <p className="ml-1">{project.alternativeOptions === "" ? "N/A" : project.alternativeOptions}</p>
            </div>
            <div className="flex flex-row">
              <Label className="font-medium">Estimated Risks:</Label>
              <p className="ml-1">{project.estimatedRisk === "" ? "N/A" : project.estimatedRisk}</p>
            </div>
          


        <div className="mt-5 mb-5 flex gap-7"> 
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <Link href={"/editProject/" + project.id}  type="button" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
            <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z"></path>
              <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z"></path>
            </svg>
            Edit Project Details
         </Link>
        
          <Link href={"/projectCompletion/" + project.id} type="button" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
          <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current"  viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"></path>
          </svg>            
          {project.status === 'Complete' ? "View Project Completion Details" :"Complete Project"}
          </Link>

          <Link href={"/" + project?.id} type="button" className={project.status=="Active" ? "hidden":"inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-l border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"}
          onClick={methods.handleSubmit(async (values) => {
            await console.log(project);
            await console.log(methodProjectTracker.getValues());
            await Promise.all ([
              mutation.mutateAsync(values),
              mutationProjecTracker.mutateAsync(methodProjectTracker.getValues())
            ])
            methods.reset();
            window.location.reload();
          })}
          >
            <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current"  viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path clipRule="evenodd" fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"></path>
            </svg>
            Make Active
          </Link>

          <DeletionDialog
              object="Project"
              id={id}
              handleDelete={() => projectDelete({ id: id })}
            ></DeletionDialog>

        </div>
      </div>
      </div>

      <Button variant={"withIcon"}
      size={"sm"}
      className="" 
      onClick={toggleReadMore}>
      {!isReadMoreShown ? (     
        <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current"  viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path clipRule="evenodd" fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"></path>
        </svg>
      ): (
        <svg fill="none" className="w-4 h-4 mr-2"  stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5"></path>
        </svg>
      )
      }

      <p>
        {!isReadMoreShown ? 'View & Edit Project Details' : (isReadMoreShown ? 'Hide Details' : '')}
      </p>
      </Button>

      

      <h2 className="mt-10 text-2xl font-bold">Project Activities</h2>
      <div className="flex flex-row flex-wrap gap-5 py-2">
        {activities &&
          activities
          .sort((a, b) => {
            const aStartDate = a.startDate ? a.startDate.getTime() : new Date(0).getTime();
            const bStartDate = b.startDate ? b.startDate.getTime() : new Date(0).getTime(); 
            return bStartDate - aStartDate; // sort the activities array by startDate in descending order
          })
          .map((activity) => (
            <Link
              href={"/activity/" + activity.id}
              key={activity.id}
              style={{
                borderTopColor: `${project.colour}`,
                borderTopStyle: "solid",
                borderTopWidth: "thick",
              }}
              className={`top-4 basis-60 overflow-hidden rounded-lg p-4 shadow`}
            >
              <h3 className="text-xl font-bold mx-1">{activity.name}</h3>
              <p className="line-clamp-3 m-1 italic text-sm">{activity.description}</p>
            </Link>
          ))}
      </div>


      <Link href={"/newActivity/" + id } className={project.status=="Complete"? "pointer-events-none":""} >
        <Button type="submit" variant={project?.status=="Active"?"withIcon":"subtle"} className={project.status=="Active"?"mt-5 text-green-600":"mt-5"}>
        <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current"  viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"></path>
      </svg>
        Add New Activity
        </Button>
      </Link>

          <h2 className="mt-10 mb-5 text-2xl font-bold">Value Created for this Project</h2>
          <div>
            <p>TO BE COMPLETED</p>
          </div>
        </div>

      ) : (
        <div className="p-8">
          <p>You are not a member of this project. Redirecting to homepage...</p>
        </div>
      )
      }
    </>
  );
}