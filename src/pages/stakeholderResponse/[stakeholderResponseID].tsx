import { Label } from "@radix-ui/react-label";
import { useRouter } from "next/router";
import { DeletionDialog } from "~/components/ui/deletionDialog";
import { useStakeholderResponseDeletion } from "~/hooks/useStakeholderResponseDeletion";
import { api } from "~/utils/api";

export default function Project() {
  const router = useRouter();
  const id = router.query.stakeholderResponseID as string;
  const utils = api.useContext().activities;
  
  const query = api.stakeholderResponse.readSpecific.useQuery({id:id}, {
    suspense: true,
  });

  const stakeholderResponse = query.data;

  const {stakeholderResponseHandleDelete} = useStakeholderResponseDeletion(id);

const isMemberFound = true;

if (stakeholderResponse === null || stakeholderResponse === undefined ) {
  return <p>Error finding project</p>
}
  return (
    <>
    {isMemberFound ? (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h2 className="mb-5 text-3xl font-bold">Survey Response Details:</h2>
      <div className="flex flex-row mb-4">
        <Label className="font-medium">Orgsanisation Name:</Label>
        <p className="ml-1">{stakeholderResponse.organisation}</p>
      </div>
      <div className="flex flex-row mb-4">
        <Label className="font-medium">Benefits Rating:</Label>
        <p className="ml-1">{stakeholderResponse.benefitsRating}</p>
      </div>
      <div className="flex flex-row mb-4">
        <Label className="font-medium">Experience Rating:</Label>
        <p className="ml-1">{stakeholderResponse.experienceRating}</p>
      </div>
      <div className="flex flex-row mb-4">
        <Label className="font-medium">Suggested Improvements:</Label>
        <p className="ml-1">{stakeholderResponse.improvements}</p>
      </div>
      <div className="flex flex-row mb-4 ">
        <Label className="font-medium">Complaints:</Label>
        <p className="ml-1">{stakeholderResponse.complaints}</p>
      </div>
      <div className="flex flex-row mb-4">
        <Label className="font-medium">Date Submitted:</Label>
        <p className="ml-1">{stakeholderResponse.createdAt.toLocaleDateString()}</p>
      </div>
      <div className="mt-5 flex gap-7"> 
      {/* <Link href={"/editActivity/" + id}>
        <Button variant={"default"}>
            Edit Activity
        </Button>
      </Link> */}
      <DeletionDialog object="Stakeholder Response" id={id} handleDelete={stakeholderResponseHandleDelete}></DeletionDialog>
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
