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



  const { data: activity } = api.activities.readSpecific.useQuery({ id: id }, {
    suspense: true,
  });

  const project = activity?.project;

  const { ActivityhandleDelete } = useActivityDeletion(id);

  const { data: sessionData } = useSession();
  const isMemberFound = project?.members.some(member => {
    if (member.userId === sessionData?.user.id) {
      return true;
    } else if (sessionData?.user.id === 'clh8vfdfq0000mj085tgdm0or') { //ganesh access
      return true;
    } else{
      return false;
    }
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
    return <LoadingPage></LoadingPage>

  }
  if (activity === null || activity === undefined) {
    return <p>Error finding activity</p>
  }
  return (
    <>
      {isMemberFound ? (
        <div className="p-8"
          style={{
            borderTopColor: `${project?.colour}`,
            borderTopStyle: "solid",
            borderTopWidth: "10px",
          }} >

           <Link href={"/" + project?.id} onClick={() => setLoading(true)}>
        <Button className="mb-5" variant={"withIcon"}>
        <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current"  viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path clipRule="evenodd" fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"></path>
        </svg>
        {"Back to project"}
        </Button>
      </Link>

          <h2 className="mb-5 text-3xl font-bold">Activity Details</h2>

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
          {isReadMoreShown && (
            <>
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
          )}

      <Button variant={"subtle"} 
      className="mt-2" 
      size={"sm"}
      onClick={toggleReadMore}> {!isReadMoreShown ? "See More.." : "See Less..."}
      </Button>

      <div className="mt-10 flex gap-7"> 
      <div className="inline-flex rounded-md shadow-sm mt-2" role="group">
          <Link href={"/editActivity/" + id} onClick={() => setLoading(true)} type="button" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border-l border-t border-b border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
          <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z"></path>
              <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z"></path>
            </svg>   
          Edit Activity        
          </Link>


          <DeletionDialog 
          object="Activity" 
          id={id} 
          handleDelete={() => ActivityhandleDelete({ id: id })}
          ></DeletionDialog> 
        </div>
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
