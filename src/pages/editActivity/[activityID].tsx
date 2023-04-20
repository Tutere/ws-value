import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/TextArea";
import { Label } from "@radix-ui/react-label";
import { useZodForm } from "~/hooks/useZodForm";
import { EditActivitySchema } from "~/schemas/activities";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { InfoIcon } from "~/components/ui/infoIcon";

export default function Project() {
  const router = useRouter();
  const id = router.query.activityID as string;
  const utils = api.useContext().activities;

   const query = api.projects.findByActivityId.useQuery({id:id}, {
    suspense: true,
  });
  const project = query.data;

  const { data: activity } = api.activities.readSpecific.useQuery({id: id}, {
    suspense: true,
  });

  const mutation = api.activities.edit.useMutation({
    onSuccess: async () => {
      await utils.read.invalidate();
    },
  });

  const methods = useZodForm({
    schema: EditActivitySchema,
    defaultValues: {
      projectId: project?.id.toString(),
      id: id,
      changeType: "Edit",
      status: project?.status!,
    },
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


   /****  For Data lineage *******/

   const mutationActivityTracker = api.activityTracker.edit.useMutation({
    onSuccess: async () => {
      //TBC
    },
  });

  /****   *******/

  return (
    <>
    {isMemberFound ? (
    <div className="p-8">
      <h2 className="mb-5 text-3xl font-bold">Project: {project?.name}</h2>

      <h2 className="mt-7 text-xl font-bold">Edit Activity</h2>
      <form
        onSubmit={methods.handleSubmit(async (values) => {
          await Promise.all ([
            mutation.mutateAsync(values),
            mutationActivityTracker.mutateAsync(values)
          ])
          methods.reset();
          router.push('/activity/' + id);
        })}
        className="space-y-2"
      >
        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Name</Label>
          <div className="flex items-center">
             <Input {...methods.register("name")} className="mr-4"
             defaultValue={activity?.name}/>
             <InfoIcon content="Name test tooltip"/>
          </div>
         

          {methods.formState.errors.name?.message && (
            <p className="text-red-700">
              {methods.formState.errors.name?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Description</Label>
          <div className="flex items-center">
            <Textarea {...methods.register("description")} className="mr-4"
            defaultValue={activity?.description}/>
            <InfoIcon content="Description test tooltip"/>
          </div>
          

          {methods.formState.errors.description?.message && (
            <p className="text-red-700">
              {methods.formState.errors.description?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Engagement Pattern</Label>
          <div className="flex items-center">
            <Textarea {...methods.register("engagementPattern")} className="mr-4"
            defaultValue={activity?.engagementPattern}/>
            <InfoIcon content="Brief summary on how engaging were your stakeholders - where they proactive, reactive, passive etc."/>
          </div>
          
          {methods.formState.errors.engagementPattern?.message && (
            <p className="text-red-700">
              {methods.formState.errors.engagementPattern?.message}
            </p>
          )}
        </div>
        
        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Value Created (Outcome)</Label>
          <div className="flex items-center">
            <Textarea {...methods.register("valueCreated")} className="mr-4"
            defaultValue={activity?.valueCreated!}/>
            <InfoIcon content="Brief summary on the consequence/outcome that was achieved by carrying out this initiaitve."/>
          </div>
          

          {methods.formState.errors.valueCreated?.message && (
            <p className="text-red-700">
              {methods.formState.errors.valueCreated?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5 pr-8">
          <Label htmlFor="name">Start Date</Label>
          {/* default to todays date if nothing selected */}
          <Input {...methods.register("startDate")} type="date" 
          defaultValue={
            activity?.startDate! &&
            activity.startDate.toISOString().slice(0, 10)
          }/>

          {methods.formState.errors.startDate?.message && (
            <p className="text-red-700">
              {methods.formState.errors.startDate?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5 pr-8">
          <Label htmlFor="name">End Date</Label>
          <Input {...methods.register("endDate")} type="date" 
          defaultValue={
            activity?.endDate! &&
            activity.endDate.toISOString().slice(0, 10)
          }/>

          {methods.formState.errors.endDate?.message && (
            <p className="text-red-700">
              {methods.formState.errors.endDate?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Outcome Score (1-10) </Label>
          <div className="flex items-center">
            <Input {...methods.register("outcomeScore")} className="mr-4"  defaultValue={activity?.outcomeScore!}/>
            <InfoIcon content="If you had to rate the outcome that was achieved by this initiative, in the range of 1-10"/>
          </div>
          

            {methods.formState.errors.outcomeScore?.message && (
            <p className="text-red-700">
              {methods.formState.errors.outcomeScore?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Effort Score (1-10) </Label>
          <div className="flex items-center">
            <Input {...methods.register("effortScore")} className="mr-4" defaultValue={activity?.effortScore!}/>
            <InfoIcon content="If you had to rate the effort you had to put in to deliver this initiatve,in the range of 1-10"/>
          </div>
          

            {methods.formState.errors.effortScore?.message && (
            <p className="text-red-700">
              {methods.formState.errors.effortScore?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">

            <Label htmlFor="name">External Stakeholders</Label>
            <div className="flex items-center">
              <Input
                {...methods.register("stakeholders")}
                className="mr-4"
                defaultValue={project?.stakeholders!}
              />
              <InfoIcon content="Who did you work with that is not a part of Worksafe?" />
            </div>

            {methods.formState.errors.stakeholders?.message && (
              <p className="text-red-700">
                {methods.formState.errors.stakeholders?.message}
              </p>
            )}
          </div>

          <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Hours taken to complete  </Label>
          <div className="flex items-center">
            <Input {...methods.register("hours")} className="mr-4" defaultValue={activity?.hours!}/>
            <InfoIcon content="How many hours has it taken to complete this activity?"/>
          </div>
          

            {methods.formState.errors.effortScore?.message && (
            <p className="text-red-700">
              {methods.formState.errors.effortScore?.message}
            </p>
          )}
        </div>



        <Button type="submit" variant={"default"} disabled={mutation.isLoading}>
          {mutation.isLoading ? "Loading" : "Edit Activity"}
        </Button>
      </form>
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
