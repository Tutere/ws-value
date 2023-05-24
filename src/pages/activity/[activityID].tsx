import { Label } from "@radix-ui/react-label";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "src/components/ui/Button";
import { DeletionDialog } from "~/components/ui/deletionDialog";
import { LoadingPage } from "~/components/ui/loading";
import { useActivityDeletion } from "~/hooks/useActivityDeletion";
import { api } from "~/utils/api";

export default function Project() {
  const router = useRouter();
  const id = router.query.activityID as string;
  const utils = api.useContext().activities;
  const [loading, setLoading] = useState(false);
  
 

  const { data: activity } = api.activities.readSpecific.useQuery({id: id}, {
    suspense: true,
  });

  const project = activity?.project;

  const {ActivityhandleDelete} = useActivityDeletion(activity?.id ?? "");

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


  //get list of users first, then filter against activity members to get names
  const queryUsers = api.users.read.useQuery(undefined, {
    suspense: true,
    onError: (error) => {
      console.error(error);
    },
  });

  const users = queryUsers.data;


  const activityMembers = activity?.members.flatMap((member) => //flatmap to get rid of nesting
    users?.filter((user) =>
      user.projects?.some((projectMember) => projectMember.id === member.projectMemberId)
    )
  );
  
  //used for read more button
const [isReadMoreShown, setIsReadMoreShown] = useState(false);
const toggleReadMore = () => {
  setIsReadMoreShown(prevState => !prevState)
}

  if(loading) {
    <LoadingPage></LoadingPage>
  }
  if (activity === null || activity === undefined ) {
    return <p>Error finding activity</p>
  }
  return (
    <>
    {isMemberFound ? (
    <div className="p-8 bg-white rounded-lg shadow-md">
      
      <Link href={"/" + project?.id}>
        <Button className="mb-5" variant={"subtle"}>
         {"< Back to project"}
        </Button>
      </Link>
       
      <h2 className="mb-5 text-3xl font-bold">Activity Details</h2>
      {!isReadMoreShown ? (
        <>
        <div className="flex flex-row">
        <Label className="font-medium">Activity Name:</Label>
        <p className="ml-1">{activity.name}</p>
        </div>
        <div className="flex flex-row">
          <Label className="font-medium">Desription:</Label>
          <p className="ml-1">{activity.description}</p>
        </div>
        <div className="flex flex-row">
          <Label className="font-medium">Value Created:</Label>
          <p className="ml-1">{activity.valueCreated}</p>
        </div>
        <div className="flex flex-row">
          <Label className="font-medium">Outcome Score:</Label>
          <p className="ml-1">{activity.outcomeScore}</p>
        </div>
        <div className="flex flex-row">
          <Label className="font-medium">Effort Score:</Label>
          <p className="ml-1">{activity.effortScore}</p>
        </div>
        <div className="flex flex-row">
          <Label className="font-medium">Hours Spent on Activity:</Label>
          <p className="ml-1">{activity.hours + " hours"}</p>
        </div>
        </>
      ) : (
        <>
        <div className="flex flex-row">
        <Label className="font-medium">Activity Name:</Label>
        <p className="ml-1">{activity.name}</p>
        </div>
        <div className="flex flex-row">
          <Label className="font-medium">Desription:</Label>
          <p className="ml-1">{activity.description}</p>
        </div>
        <div className="flex flex-row">
          <Label className="font-medium">Value Created:</Label>
          <p className="ml-1">{activity.valueCreated}</p>
        </div>
        <div className="flex flex-row">
          <Label className="font-medium">Outcome Score:</Label>
          <p className="ml-1">{activity.outcomeScore}</p>
        </div>
        <div className="flex flex-row">
          <Label className="font-medium">Effort Score:</Label>
          <p className="ml-1">{activity.effortScore}</p>
        </div>
        <div className="flex flex-row">
          <Label className="font-medium">Hours Spent on Activity:</Label>
          <p className="ml-1">{activity.hours + " hours"}</p>
        </div>
        <div className="flex flex-row">
          <Label className="font-medium">Start Date:</Label>
          <p className="ml-1">{activity.startDate?.toLocaleDateString()}</p>
        </div>
        <div className="flex flex-row">
          <Label className="font-medium">End Date:</Label>
          <p className="ml-1">{activity.endDate?.toLocaleDateString()}</p>
        </div>
        <div className="flex flex-row ">
          <Label className="font-medium">Engagement Pattern:</Label>
          <p className="ml-1">{activity.engagementPattern}</p>
        </div>
        <div className="flex flex-row">
          <Label className="font-medium">Activity Members:</Label>
          <p className="ml-1">
            {activityMembers?.map((member) => member?.name).join(", ")}   
          </p>
        </div>
        <div className="flex flex-row">
          <Label className="font-medium">Stakeholders Involved:</Label>
          <p className="ml-1">
            {activity?.stakeholders}   
          </p>
        </div>
      </>
      )
    }
      <Button variant={"subtle"} 
      className="mt-2" 
      size={"sm"}
      onClick={toggleReadMore}> {!isReadMoreShown ? "See More.." : "See Less..."}
      </Button>
      
      <div className="mt-10 flex gap-7"> 
      <Link href={"/editActivity/" + id} onClick={() => setLoading(true)}>
        <Button variant={"default"}>
            Edit Activity
        </Button>
      </Link>
      <DeletionDialog object="Activity" id={id} handleDelete={ActivityhandleDelete}></DeletionDialog>
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
