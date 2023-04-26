import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/TextArea";
import { Label } from "@radix-ui/react-label";
import { useZodForm } from "~/hooks/useZodForm";
import { CreateActivitySchema } from "~/schemas/activities";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { InfoIcon } from "~/components/ui/infoIcon";
import { DeletionDialog } from "~/components/ui/deletionDialog";
import { ActivateProjectSchema } from "~/schemas/projects";
import { ProjectChangeSchema } from "~/schemas/projectTracker";

export default function Project() {
  const router = useRouter();
  const id = router.query.projectID as string;
  const utils = api.useContext().activities;
  const query = api.projects.read.useQuery(undefined, {
    suspense: true,
  });

  const projects = query.data;
  const project = projects ? projects.find((p) => p.id === id) : null;

  const { data: activities } = api.activities.read.useQuery({projectId: id}, {
    suspense: true,
  });

  const { data: sessionData } = useSession();
  const isMemberFound = project?.members.some(member => {
    return member.userId === sessionData?.user.id;
  });

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
    estimatedEnd: project?.estimatedEnd?.toISOString(),
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

  return (
    <>
    {isMemberFound ? (
    <div className="p-8">
      <h2 className="mb-5 text-3xl font-bold">Project Details</h2>
      <div className="flex flex-row">
        <Label className="font-medium">Project Name:</Label>
        <p className="ml-1">{project?.name}</p>
      </div>
      <div className="flex flex-row">
        <Label className="font-medium">Goal:</Label>
        <p className="ml-1">{project?.goal}</p>
      </div>
      <div className="flex flex-row">
        <Label className="font-medium">Start Date:</Label>
        <p className="ml-1">{project?.estimatedStart.toLocaleDateString()}</p>
      </div>
      <div className="flex flex-row">
        <Label className="font-medium">Description:</Label>
        <p className="ml-1">{project?.description}</p>
      </div>
      <div className="flex flex-row">
        <Label className="font-medium">Project Members:</Label>
        <p className="ml-1">
          {projectMembers?.map((member) => member?.name).join(", ")}   
        </p>
      </div>
      <div className="flex flex-row">
        <Label className="font-medium">Stakeholders:</Label>
        <p className="ml-1">{project?.stakeholders}</p>
      </div>
      <div className="mt-5 flex gap-7">

        
      <Link href={"/projectCompletion/" + project?.id}>
        <Button variant={"default"}>
            {project?.status === 'Complete' ? "View Project Completion Details" :"Complete Project"}

        </Button>
      </Link>

      <Link href={"/" + project?.id} className={project?.status=="Active" ? "hidden":""} >
      <Button variant={"default"}  className="bg-green-500" 
      onClick={methods.handleSubmit(async (values) => {
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


      <Link href={"/editProject/" + project?.id}>
        <Button variant={"default"}>
            Edit Project
        </Button>
      </Link>
      

      <DeletionDialog object="Project" id={id}></DeletionDialog>
      </div>

      <h2 className="mt-10 text-2xl font-bold">Project Activities</h2>
      <div className="flex flex-row flex-wrap gap-5 py-2">
        {activities &&
          activities.map((activity) => (
            <Link
              href={"/activity/" + activity.id}
              key={activity.id}
              className="overflow-hidden bg-white p-4 shadow sm:rounded-lg basis-60"
            >
              <h3 className="text-xl font-bold">{activity.name}</h3>
              <p>{activity.description}</p>
            </Link>
          ))}
      </div>

      <Link href={"/newActivity/" + id } className={project?.status=="Complete"? "pointer-events-none":""}>
        <Button type="submit" variant={project?.status=="Active"?"default":"subtle"} className={project?.status=="Active"?"mt-5 bg-green-500":"mt-5"}>
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
