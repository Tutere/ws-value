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
      <div className="mt-5 flex gap-7">
      <Link href={"/projectCompletion/" + project?.id}>
        <Button variant={"default"}>
            Complete Project
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
      <Link href={"/newActivity/" + id}>
        <Button type="submit" variant={"default"} className="mt-5  bg-green-500">
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
