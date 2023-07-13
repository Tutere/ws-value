import { Label } from "@radix-ui/react-label";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { DeletionDialog } from "~/components/ui/deletionDialog";
import { LoadingPage } from "~/components/ui/loading";
import { useStakeholderResponseDeletion } from "~/hooks/useStakeholderResponseDeletion";
import { api } from "~/utils/api";

export default function Project() {
  const router = useRouter();
  const id = router.query.stakeholderResponseID as string;
  const utils = api.useContext().activities;
  const [loading, setLoading] = useState(false);
  
  const query = api.stakeholderResponse.readSpecific.useQuery({id:id}, {
    suspense: true,
  });

  const stakeholderResponse = query.data;

  const {stakeholderResponseHandleDelete} = useStakeholderResponseDeletion(id);

const isMemberFound = true;

if (loading) {
  return <LoadingPage></LoadingPage>

}

if (stakeholderResponse === null || stakeholderResponse === undefined ) {
  return <p>Error finding project</p>
}
  return (
    <>
    {isMemberFound ? (
      <div className="p-8"
      style={{
        // borderTopColor: `${stakeholderResponse.project.colour}`,
        // borderTopStyle: "solid",
        // borderTopWidth: "10px",
        backgroundImage: 'linear-gradient(' + stakeholderResponse.project?.colour + '5D' + ', #FFFFFF)',

      }} >

          <Link href={"/projectCompletion/" + stakeholderResponse.project?.id} onClick={() => setLoading(true)}>
            <Button className="mb-5" variant={"withIcon"}>
              <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path clipRule="evenodd" fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"></path>
              </svg>
              {"Back to project completion page"}
            </Button>
          </Link>

      <h2 className="mb-5 text-3xl font-bold">Survey Response Details:</h2>

      <div className="grid gap-3">

        <div className="flex flex-col">
          <Label className="font-bold">Orgsanisation Name:</Label>
          <p className="ml-1">{stakeholderResponse.organisation}</p>
        </div>
        <div className="flex flex-col">
          <Label className="font-bold">Benefits Rating:</Label>
          <p className="ml-1">{stakeholderResponse.benefitsRating}</p>
        </div>
        <div className="flex flex-col">
          <Label className="font-bold">Experience Rating:</Label>
          <p className="ml-1">{stakeholderResponse.experienceRating}</p>
        </div>
        <div className="flex flex-col">
          <Label className="font-bold">Suggested Improvements:</Label>
          <p className="ml-1">{stakeholderResponse.improvements}</p>
        </div>
        <div className="flex flex-col ">
          <Label className="font-bold">Complaints:</Label>
          <p className="ml-1">{stakeholderResponse.positives}</p>
        </div>
        <div className="flex flex-col">
          <Label className="font-bold">Date Submitted:</Label>
          <p className="ml-1">{stakeholderResponse.createdAt.toLocaleDateString()}</p>
        </div>
        <div className="mt-5 flex gap-7"> 
        {/* <Link href={"/editActivity/" + id}>
          <Button variant={"default"}>
              Edit Activity
          </Button>
        </Link> */}
        <DeletionDialog 
        object="Stakeholder Response" 
        id={id} 
        handleDelete={() => stakeholderResponseHandleDelete({ id: id })}
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
