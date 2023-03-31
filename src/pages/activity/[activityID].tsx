import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Button } from "src/components/ui/Button";
import { Input } from "src/components/ui/Input";
import { Textarea } from "src/components/ui/TextArea";
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
  const id = router.query.activityID as string;
  const utils = api.useContext().activities;
  
  const query = api.projects.findByActivityId.useQuery({id:id}, {
    suspense: true,
  });

  const project = query.data;
//   const project = projects ? projects.find((p) => p.id === id) : null;

  const { data: activity } = api.activities.readSpecific.useQuery({id: id}, {
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
      <h2 className="mb-5 text-3xl font-bold">Activity Details</h2>
      <div className="flex flex-row">
        <Label className="font-medium">Activity Name:</Label>
        <p className="ml-1">{activity?.name}</p>
      </div>
      <div className="flex flex-row">
        <Label className="font-medium">Desription:</Label>
        <p className="ml-1">{activity?.description}</p>
      </div>
      <div className="flex flex-row">
        <Label className="font-medium">Start Date:</Label>
        <p className="ml-1">{activity?.startDate?.toLocaleDateString()}</p>
      </div>
      <div className="flex flex-row">
        <Label className="font-medium">Outcome:</Label>
        <p className="ml-1">{activity?.valueCreated}</p>
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
