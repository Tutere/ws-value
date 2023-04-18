import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Button } from "src/components/ui/Button";
import { Input } from "src/components/ui/Input";
import { Textarea } from "src/components/ui/TextArea";
import { Label } from "@radix-ui/react-label";
import { useZodForm } from "~/hooks/useZodForm";
import { CreateActivitySchema } from "~/schemas/activities";
import { CreateProjectSchema } from "~/schemas/projects";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import {CompleteProjectSchema} from "~/schemas/projects";
import { InfoIcon } from "~/components/ui/infoIcon";

export default function ProjectCompletion() {
  const router = useRouter();
  const id = router.query.projectID as string;
  const utils = api.useContext().projects;
  const query = api.projects.read.useQuery(undefined, {
    suspense: true,
  });

  const projects = query.data;
  const project = projects ? projects.find((p) => p.id === id) : null;


  const mutation = api.projects.complete.useMutation({
    onSuccess: async () => {
      await utils.read.invalidate();
    },
  });

  const methods = useZodForm({
    schema: CompleteProjectSchema,
    defaultValues: {
      status:"Complete",
      id: project?.id.toString(),
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

  return (
    <>
    {isMemberFound ? (
    <div className="p-8 ">
      <h2 className="mt-5 mb-5 text-2xl font-bold">Project Completion Page</h2>
      <div className="flex flex-row mb-5">
        <Label className="font-medium">Project Name:</Label>
        <p className="ml-1">{project?.name}</p>
      </div>
      <form
        onSubmit={methods.handleSubmit(async (values) => {
          await mutation.mutateAsync(values);
          methods.reset();
          router.push('/');
        })}
        className="space-y-2"
      >

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Retrospective/Overall Summary</Label>
          <div className="flex items-center">
            <Textarea {...methods.register("retrospective")} className="mr-4" />
            <InfoIcon content="If you had to do this or a similar initiative, what would you have done it differently. Brief summary"/>
          </div>
          
          {methods.formState.errors.retrospective?.message && (
            <p className="text-red-700">
              {methods.formState.errors.retrospective?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Lessons Learnt</Label>
          <div className="flex items-center">
            <Textarea {...methods.register("lessonsLearnt")} className="mr-4"  />
            <InfoIcon content="The knowledge gained from the process of conducting this activity that could be useful in the future iterations or similar work"/>
          </div> 

          {methods.formState.errors.lessonsLearnt?.message && (
            <p className="text-red-700">
              {methods.formState.errors.lessonsLearnt?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5 pr-8">
          <Label htmlFor="name">Actual Start Date</Label>
          {/* default to todays date if nothing selected */}
          <Input {...methods.register("actualStart")} type="date" />

          {methods.formState.errors.actualStart?.message && (
            <p className="text-red-700">
              {methods.formState.errors.actualStart?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5 pr-8">
          <Label htmlFor="name">Actual End Date</Label>
          {/* default to todays date if nothing selected */}
          <Input {...methods.register("actualEnd")} type="date" />

          {methods.formState.errors.actualEnd?.message && (
            <p className="text-red-700">
              {methods.formState.errors.actualEnd?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Outcome Score (1-10) </Label>
          <div className="flex items-center">
            <Input {...methods.register("outcomeScore")} className="mr-4" />
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
            <Input {...methods.register("effortScore")} className="mr-4"/>
            <InfoIcon content="If you had to rate the effort you had to put in to deliver this initiatve,in the range of 1-10"/>
          </div>
          

            {methods.formState.errors.effortScore?.message && (
            <p className="text-red-700">
              {methods.formState.errors.effortScore?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Stakeholder Survey Form: </Label>
          <div className="flex items-center">
            <Link className="mr-4 font-medium text-blue-600 hover:underline" 
            href={"/stakeholderSurvey/" + project?.id}
            rel="noopener noreferrer" 
            target="_blank"
            >
              <p>Link Here</p>
            </Link> 
          </div>
        </div>

        <Button type="submit" variant={"default"} disabled={mutation.isLoading} className="bg-green-500">
          {mutation.isLoading ? "Loading" : "Complete Project"}
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