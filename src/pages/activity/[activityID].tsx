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



  const { data: activity, isLoading } = api.activities.readSpecific.useQuery({ id: id }, {
    // suspense: true,
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        alert("Sorry, you are not a member of this activity");
        router.push("/");
      }
    },
  });

  const project = activity?.project;

  const { ActivityhandleDelete } = useActivityDeletion(id);

  //get list of users first, then filter against activity members to get names
  const queryUsers = api.users.read.useQuery(undefined, {
    // suspense: true,
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

  if (loading || isLoading) {
    return <LoadingPage></LoadingPage>

  }
  if (activity === null || activity === undefined) {
    return <p>Error finding activity</p>
  }
  return (
    <>
        <div className="p-8"
          // style={{
          //   borderTopColor: `${project?.colour}`,
          //   borderTopStyle: "solid",
          //   borderTopWidth: "10px",
          // }} 
          style={{
            backgroundImage: 'linear-gradient(' + project?.colour + '5D' + ', #FFFFFF)',
          }}
          >

          <Link href={"/" + project?.id} onClick={() => setLoading(true)}>
            <Button className="mb-5" variant={"withIcon"}>
              <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path clipRule="evenodd" fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"></path>
              </svg>
              {"Back to project"}
            </Button>
          </Link>

          <h2 className="mb-8 text-3xl font-bold flex-col flex ">{activity.name}</h2>

          <div className="grid gap-3">

            <div className="flex flex-col">
              <Label className="font-bold">Description:</Label>
              <p className="">{activity.description}</p>
            </div>
            <div className="flex flex-col">
              <Label className="font-bold">Value Created:</Label>
              <p className="">{activity.valueCreated}</p>
            </div>
            <div className="flex flex-col">
              <Label className="font-bold">Outcome Score:</Label>
              <p className="">{activity.outcomeScore}</p>
            </div>
            <div className="flex flex-col">
              <Label className="font-bold">Effort Score:</Label>
              <p className="">{activity.effortScore}</p>
            </div>
            <div className="flex flex-col ">
              <Label className="font-bold">Hours Spent on Activity:</Label>
              <p className="">{activity.hours + " hours"}</p>
            </div>
            <div className="flex flex-col gap-1 ">
              <Label className="font-bold">Start Date:</Label>
              <p className="">{activity.startDate?.toLocaleDateString()}</p>
            </div>
            <div className="flex flex-col">
              <Label className="font-bold">End Date:</Label>
              <p className="">{activity.endDate?.toLocaleDateString() == null ? "N/A" : activity.endDate?.toLocaleDateString()}</p>
            </div>
            <div className="flex flex-col ">
              <Label className="font-bold">Engagement Pattern:</Label>
              <p className="">{activity.engagementPattern === "" ? "N/A" : activity.engagementPattern }</p>
            </div>
            <div className="flex flex-col">
              <Label className="font-bold">Activity Members:</Label>
              <p className="">
                {activityMembers?.map((member) => member?.name).join(", ") === "" ? "N/A" : activityMembers?.map((member) => member?.name).join(", ")}
              </p>
            </div>
            <div className="flex flex-col">
              <Label className="font-bold">Stakeholders Involved:</Label>
              <p className="">
                {activity?.stakeholders === "" ? "N/A" : activity?.stakeholders}
              </p>
            </div>
          </div>




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

    </>
  );
}
