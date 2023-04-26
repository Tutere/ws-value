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
import {CompleteProjectSchema, EditProjectSchema} from "~/schemas/projects";
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
    schema: EditProjectSchema, //using this schema because it has all fields for project tracking
    defaultValues: {
      status:"Complete",
      changeType: "Complete",
      id: project?.id.toString(),
      projectId: project?.id.toString(),
      colour: project?.colour!,
      icon: project?.icon?.toString(),
      name: project?.name?.toString(),
      description: project?.description?.toString(),
      goal: project?.goal?.toString(),
      estimatedStart: project?.estimatedStart?.toISOString(),
      estimatedEnd: project?.estimatedEnd?.toISOString(),
      trigger: project?.trigger?.toString(),
      expectedMovement: project?.expectedMovement?.toString(),
      alternativeOptions: project?.alternativeOptions?.toString(),
      estimatedRisk: project?.estimatedRisk?.toString(),
      stakeholders: project?.stakeholders! || "",
      members: project?.members.map(member => member.userId),
    },
  });

  const { data: sessionData } = useSession();
  const isMemberFound = project?.members.some(member => {
    return member.userId === sessionData?.user.id;
  });

  //read in stakeholder survey responses
  const querySurveyResponses = api.stakeholderResponse.read.useQuery({id:id}, {
    suspense: true,
  });

  const stakeholderResponses = querySurveyResponses.data;

  useEffect(() => {
    if (!isMemberFound) {
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  }, [isMemberFound, router]);

   /****  For Data lineage *******/

   const mutationProjecTracker = api.projectTracker.edit.useMutation({
    onSuccess: async () => {
      // await utilsprojectTracker.read.invalidate();
    },
  });

  /****   *******/


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
          await Promise.all ([
            mutation.mutateAsync(values),
            mutationProjecTracker.mutateAsync(values)
          ])
          methods.reset();
          router.push('/');
        })}
        className="space-y-2"
      >

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Retrospective/Overall Summary</Label>
          <div className="flex items-center">
            <Textarea {...methods.register("retrospective")} className="mr-4" defaultValue={project?.retrospective!} />
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
            <Textarea {...methods.register("lessonsLearnt")} className="mr-4" defaultValue={project?.lessonsLearnt!}/>
            <InfoIcon content="The knowledge gained from the process of conducting this activity that could be useful in the future iterations or similar work"/>
          </div> 

          {methods.formState.errors.lessonsLearnt?.message && (
            <p className="text-red-700">
              {methods.formState.errors.lessonsLearnt?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Actual Start Date</Label>
          
          <div className="flex items-center">
            <Input {...methods.register("actualStart")} type="date" className="mr-4" defaultValue={
                    project?.actualStart! ?
                    project.actualStart.toISOString().slice(0, 10) : project?.estimatedStart.toISOString().slice(0, 10)
                  } />
            <InfoIcon content="The date that the project started being worked on. Will default to the estimated start date provided during project setup"/>
          </div>

          {methods.formState.errors.actualStart?.message && (
            <p className="text-red-700">
              {methods.formState.errors.actualStart?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Actual End Date</Label>
          <div className="flex items-center">
            <Input {...methods.register("actualEnd")} className="mr-4" type="date" defaultValue={
                    project?.actualEnd! ?
                    project.actualEnd.toISOString().slice(0, 10) : project?.estimatedEnd!.toISOString().slice(0, 10)
                  } />
            <InfoIcon content="The date that the project was completed. Will default to the estimated end date provided during project setup"/>
          </div>

          {methods.formState.errors.actualEnd?.message && (
            <p className="text-red-700">
              {methods.formState.errors.actualEnd?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Outcome Score (1-10) </Label>
          <div className="flex items-center">
            <Input {...methods.register("outcomeScore")} className="mr-4" defaultValue={project?.outcomeScore!} />
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
            <Input {...methods.register("effortScore")} className="mr-4" defaultValue={project?.effortScore!}/>
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

      <h2 className="mt-10 text-2xl font-bold">Stakeholder Survey Responses:</h2>
      <div className="flex flex-row flex-wrap gap-5 py-2">
        {stakeholderResponses?.length! > 0 ? (
          stakeholderResponses?.map((stakeholderResponse) => (
            <Link
              href={"/stakeholderResponse/" + stakeholderResponse.id}
              key={stakeholderResponse.id}
              className="overflow-hidden bg-white p-4 shadow sm:rounded-lg basis-60"
              style={{ backgroundColor: `#${project?.colour}` }}
            >
              <h3 className="text-xl font-bold">{stakeholderResponse.organisation}</h3>
              <p>{"Benefits rating: " + stakeholderResponse.benefitsRating}</p>
              <p>{"Experience rating: " + stakeholderResponse.experienceRating}</p>
            </Link>
          ))): (
            <div> No survey responses yet </div> 
          )}
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