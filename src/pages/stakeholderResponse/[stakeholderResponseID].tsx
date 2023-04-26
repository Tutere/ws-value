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
  const id = router.query.stakeholderResponseID as string;
  const utils = api.useContext().activities;
  
  const query = api.stakeholderResponse.readSpecific.useQuery({id:id}, {
    suspense: true,
  });

  const stakeholderResponse = query.data;

//   const { data: sessionData } = useSession();
//   const isMemberFound = project?.members.some(member => {
//     return member.userId === sessionData?.user.id;
//   });

//   useEffect(() => {
//     if (!isMemberFound) {
//       setTimeout(() => {
//         router.push("/");
//       }, 3000);
//     }
//   }, [isMemberFound, router]);

const isMemberFound = true;

  return (
    <>
    {isMemberFound ? (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h2 className="mb-5 text-3xl font-bold">Survey Response Details:</h2>
      <div className="flex flex-row mb-4">
        <Label className="font-medium">Orgsanisation Name:</Label>
        <p className="ml-1">{stakeholderResponse?.organisation}</p>
      </div>
      <div className="flex flex-row mb-4">
        <Label className="font-medium">Benefits Rating:</Label>
        <p className="ml-1">{stakeholderResponse?.benefitsRating}</p>
      </div>
      <div className="flex flex-row mb-4">
        <Label className="font-medium">Experience Rating:</Label>
        <p className="ml-1">{stakeholderResponse?.experienceRating}</p>
      </div>
      <div className="flex flex-row mb-4">
        <Label className="font-medium">Suggested Improvements:</Label>
        <p className="ml-1">{stakeholderResponse?.improvements}</p>
      </div>
      <div className="flex flex-row mb-4 ">
        <Label className="font-medium">Complaints:</Label>
        <p className="ml-1">{stakeholderResponse?.complaints}</p>
      </div>
      <div className="flex flex-row mb-4">
        <Label className="font-medium">Date Submitted:</Label>
        <p className="ml-1">{stakeholderResponse?.createdAt.toLocaleDateString()}</p>
      </div>
      <div className="mt-5 flex gap-7"> 
      {/* <Link href={"/editActivity/" + id}>
        <Button variant={"default"}>
            Edit Activity
        </Button>
      </Link> */}
      <DeletionDialog object="Stakeholder Response" id={id}></DeletionDialog>
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
