import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/TextArea";
import { Label } from "@radix-ui/react-label";
import { useZodForm } from "~/hooks/useZodForm";
import { CreateActivitySchema } from "~/schemas/activities";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { InfoIcon } from "~/components/ui/infoIcon";
import { ActivityChangeSchema } from "~/schemas/activityTracker";

export default function Project() {
  const router = useRouter();
  const id = router.query.projectID as string;
  const utils = api.useContext().activities;
  const query = api.projects.read.useQuery(undefined, {
    suspense: true,
  });

  const projects = query.data;
  const project = projects ? projects.find((p) => p.id === id) : null;


  const mutation = api.activities.create.useMutation({
    onSuccess: async (data) => {
      console.log(data.id);
      methods.setValue("id" , data.id);
      await utils.read.invalidate();
    },
  });

  const methods = useZodForm({
    schema: CreateActivitySchema,
    defaultValues: {
      projectId: project?.id.toString(),
      changeType: "Create",
      id: "" //placeholder before getting id from newly created activity 
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
   const mutationActivityTracker = api.activityTracker.edit.useMutation();

  return (
    <>
    {isMemberFound ? (    
    <div className="p-8">
      <h2 className="mb-5 text-3xl font-bold">Project: {project?.name}</h2>

      <h2 className="mt-7 text-xl font-bold">Add a New Activity</h2>
      <form
        onSubmit={methods.handleSubmit(async (values) => {
          await Promise.all ([
            await mutation.mutateAsync(values),
            await mutationActivityTracker.mutateAsync({
              ...values,
              id: methods.getValues("id") // update id feild with the created activity's id
            })
          ])
          methods.reset();
          router.push('/' + id);
        })}
        className="space-y-2"
      >
        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Name</Label>
          <div className="flex items-center">
             <Input {...methods.register("name")} className="mr-4"/>
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
            <Textarea {...methods.register("description")} className="mr-4"/>
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
            <Textarea {...methods.register("engagementPattern")} className="mr-4"/>
            <InfoIcon content="Engagement Pattern test tooltip"/>
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
            <Textarea {...methods.register("valueCreated")} className="mr-4"/>
            <InfoIcon content="Engagement Pattern test tooltip"/>
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
          <Input {...methods.register("startDate")} type="date" />

          {methods.formState.errors.startDate?.message && (
            <p className="text-red-700">
              {methods.formState.errors.startDate?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5 pr-8">
          <Label htmlFor="name">End Date</Label>
          <Input {...methods.register("endDate")} type="date" />

          {methods.formState.errors.endDate?.message && (
            <p className="text-red-700">
              {methods.formState.errors.endDate?.message}
            </p>
          )}
        </div>


        <Button type="submit" variant={"default"} disabled={mutation.isLoading}>
          {mutation.isLoading ? "Loading" : "Add Activity"}
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
