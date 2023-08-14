import React, { useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Activity, ActivityMember, Project, ProjectMember, User } from "@prisma/client";
import { FieldValues } from "react-hook-form";
import { useZodForm } from "~/hooks/useZodForm";
import { ReportCommentSchema } from "~/schemas/activities";
import { api } from "~/utils/api";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/TextArea";
import { InfoIcon } from "../ui/infoIcon";
import { Button, buttonVariants } from "../ui/Button";
import { cn } from "~/utils/cn";
import { RemoveDialog } from "../ui/removeDialogue";


interface MonthlyReportActivtyProps<T extends FieldValues> {
  // children:React.ReactNode;
  activity: {
    activity: Activity & {
        members: ActivityMember[];
    };
    projectMembers: (ProjectMember & {
        user: User;
        ActivityMember: ActivityMember[];
    })[]; 
},
projectIcon: string | null,
contributorNames: (string | null)[],
hidden: boolean | undefined;
toggleHidden: () => void;
}

export function MonthlyReportActivity<T extends FieldValues>(
  props: MonthlyReportActivtyProps<T>
  ){
  
    const utils = api.useContext().projects;

  const mutation = api.activities.reportComments.useMutation(
    {
      onSuccess: async () => {
        await utils.read.invalidate();
      },
    }
  );

  const methods = useZodForm({
    schema: ReportCommentSchema,
    defaultValues: {
      id: props.activity.activity.id, 
    },
  });

  const [commentsSaved, setCommentSaved] = useState(
    props.activity.activity.reportComments === null || props.activity.activity.reportComments === "" ? false : true
  ); //to check if a report comment has already been added

  // const [hidden, setHidden] = useState(false);
  
  return (
    <form
    onSubmit={methods.handleSubmit(async (values) => {
      await Promise.all([
        await setCommentSaved(true),
        await mutation.mutateAsync(values),
      ])
      // methods.reset();
      // methodsActivityTracker.reset();
    })}
    >
    <div className= {props.hidden === true ? "hidden" :"mb-5 ml-5 w-4/5"}>  
        <Link className="hover:underline"  href={"/activity/" + props.activity.activity.id} 
        rel="noopener noreferrer" 
        target="_blank">
        <div className="flex">
        <div>{props.projectIcon}</div>
        <p className="ml-2 font-bold">
          {props.activity.activity.name}
        </p>
        <p className="ml-1">
        {props.activity.activity.endDate ? (
           " - Completed: " + 
           props.activity.activity.endDate?.toDateString() + " "
        ) : (
            " - Ongoing (not yet completed)"
        )}
                                 
        </p>
         </div>
      </Link>

      <ul className="list-disc ml-5">
        <li className="">Contributors: {props.contributorNames.join(", ")}{" "}</li>
        <li className="">Stakeholders Involved:{" "} {props.activity.activity.stakeholders === "" ? "N/A" : props.activity.activity.stakeholders}{" "}</li>
        <li className="">Description: {props.activity.activity.description}{" "}</li>
        <li className="mb-5">Value Statement: {props.activity.activity.valueCreated}{" "}</li>
      </ul>
    

    {commentsSaved === false || props.activity.activity?.reportComments === ""? (
    <>
    <div className="grid w-full max-w-md items-center gap-1.5">
        <Label htmlFor="reportComment">Optional Comments (for Monthly report):</Label>
        <div className="flex items-center">
            <Textarea
              className="mr-4 whitespace-pre-wrap resize"
              placeholder=""
              defaultValue={props.activity.activity.reportComments ?? ""}
              {...methods.register("reportComment")}
            />
            <InfoIcon content="These comments will be used for your monthly report" />
        </div>
        
    </div>
      <Button
      type="submit"
      variant={"withIcon"}
      disabled={mutation.isLoading}
      className="mt-2 "
    >
      <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current"  viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path clipRule="evenodd" fillRule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z"></path>
      </svg>
      {mutation.isLoading? "Loading": "Save Comments"}
    </Button>   
    </> 
    ) : (
      <>
      <p className="whitespace-pre-wrap">Optional Comments (for Monthly report): {props.activity.activity.reportComments}{" "}</p>
       <button
        className={cn (buttonVariants({ variant: "withIcon" }),"mt-2")}
        onClick={() => setCommentSaved(!commentsSaved)}
        >
      <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z"></path>
       <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z"></path>
       </svg>
       Edit Comments
        </button>
      </>
    )}
    <div className="mt-5">
      <RemoveDialog 
      setHidden={props.toggleHidden} 
      />
    </div>
    </div>                
    </form>
  );
}
