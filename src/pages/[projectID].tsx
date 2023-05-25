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
  const [loading, setLoading] = useState(false);

  const query = api.projects.FindByProjectId.useQuery({id:id}, {
    suspense:true,
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        router.push("/");
      }
    }
  });

  const project = query.data;

  const activities  = project?.Activity;

  const { data: sessionData } = useSession();
  const isMemberFound = project?.members.some(member => {
    return member.userId === sessionData?.user.id;
  });

  const {projectHandleDelete} = useProjectDeletion(id);

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

const mutationProjecTracker = api.projectTracker.edit.useMutation({
        
});

const methodProjectTracker= useZodForm({
  schema: ProjectChangeSchema,
  defaultValues: {
    changeType: "Re-Activate",
    projectId: project?.id.toString(),
    icon: project?.icon?.toString(),
    name: project?.name?.toString(),
    description: project?.description?.toString(),
    goal: project?.goal?.toString(),
    estimatedStart: project?.estimatedStart?.toISOString(),
    estimatedEnd: project?.estimatedEnd?.toISOString() ?? "",
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

//used for read more button
const [isReadMoreShown, setIsReadMoreShown] = useState(false);
const toggleReadMore = () => {
  setIsReadMoreShown(prevState => !prevState)
}
if(loading) {
  return  <LoadingPage></LoadingPage>
}
  if (project === null || project === undefined ) {
    return <p>Error finding project</p>
  }
  return (
    <>
    {isMemberFound ? (
    <div className="p-8">
      <h2 className="mb-5 text-3xl font-bold">Project Details</h2>
      {!isReadMoreShown ? (
        <>
        <div className="flex flex-row">
          <Label className="font-medium">Project Name:</Label>
          <p className="ml-1">{project.name}</p>
        </div>
        <div className="flex flex-row">
        <Label className="font-medium">Goal:</Label>
        <p className="ml-1">{project.goal}</p>
        </div>
        <div className="flex flex-row">
          <Label className="font-medium">Estimated Start Date:</Label>
          <p className="ml-1">{project.estimatedStart.toLocaleDateString()}</p>
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
        <Label className="font-medium">Link to Project Initiation Document: </Label>
        {project.pid? 
        <a className="ml-1 text-blue-600 hover:underline" href={project.pid?? ""} rel="noopener noreferrer" 
            target="_blank">Click Here</a>
        :
        <p className="ml-1"> N/A</p>
      }
      </div>
        </>
      ): (
        <>
      <div className="flex flex-row">
        <Label className="font-medium">Project Name:</Label>
        <p className="ml-1">{project.name}</p>
      </div>
      <div className="flex flex-row">
        <Label className="font-medium">Goal:</Label>
        <p className="ml-1">{project.goal}</p>
      </div>
      <div className="flex flex-row">
        <Label className="font-medium">Estimated Start Date:</Label>
        <p className="ml-1">{project.estimatedStart.toLocaleDateString()}</p>
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
      <div className="flex flex-row">
        <Label className="font-medium">Link to Project Initiation Document: </Label>
        {project.pid? 
        <a className="ml-1 text-blue-600 hover:underline" href={project.pid?? ""} rel="noopener noreferrer" 
            target="_blank">Click Here</a>
        :
        <p className="ml-1"> N/A</p>
      }
      </div>
     
      </>

      ) 
      } 
      <Button variant={"subtle"}
      size={"sm"}
      className="mt-2" 
      onClick={toggleReadMore}> {!isReadMoreShown ? "See More...": "See Less..."}
      </Button>

      <div className="mt-10 flex gap-7">
      <Link href={"/projectCompletion/" + project.id} onClick={() => setLoading(true)}>
        <Button variant={"default"}>
            {project.status === 'Complete' ? "View Project Completion Details" :"Complete Project"}

        </Button>
      </Link>

      <Link href={"/" + project?.id} className={project.status=="Active" ? "hidden":""} onClick={() => setLoading(true)}>
      <Button variant={"default"}  className="bg-green-500" 
      onClick={methods.handleSubmit(async (values) => {
        await console.log(methodProjectTracker.getValues());
        await Promise.all ([
          mutation.mutateAsync(values),
          mutationProjecTracker.mutateAsync(methodProjectTracker.getValues())
        ])
        methods.reset();
        window.location.reload();
      })}
      >
            Make Active
        </Button>
      </Link>


      <Link href={"/editProject/" + project.id} onClick={() => setLoading(true)}>
        <Button variant={"default"}>
            Edit Project
        </Button>
      </Link>
      

      <DeletionDialog object="Project" id={id} handleDelete={projectHandleDelete}></DeletionDialog>
      </div>

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
              onClick={() => setLoading(true)}
            >
              <h3 className="text-xl font-bold">{activity.name}</h3>
              <p className="line-clamp-3 m-1 italic text-sm">{activity.description}</p>
            </Link>
          ))}
      </div>

      <Link href={"/newActivity/" + id } className={project.status=="Complete"? "pointer-events-none":""} onClick={() => setLoading(true)}>
        <Button type="submit" variant={project?.status=="Active"?"default":"subtle"} className={project.status=="Active"?"mt-5 bg-green-500":"mt-5"}>
        Add New Activity
        </Button>
      </Link>

      <h2 className="mt-10 mb-5 text-2xl font-bold">Value Created for this Project</h2>
      <div>
        <p>TO BE COMPLETED</p>
      </div>
    </div>
    
    ): (
      <div className="p-8">
        <p>You are not a member of this project. Redirecting to homepage...</p>
      </div>
      )
    }
    </>
  );
}
