import { Label } from "@radix-ui/react-label";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useZodForm } from "~/hooks/useZodForm";
import { CreateProjectSchema,EditProjectSchema } from "~/schemas/projects";
import {ProjectChangeSchema } from "~/schemas/projectTracker";
import { api } from "~/utils/api";
import { Button } from "src/components/ui/Button";
import { Input } from "src/components/ui/Input";
import { Textarea } from "src/components/ui/TextArea";
import {InfoIcon} from "src/components/ui/infoIcon";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ProjectForm() {
  
  const router = useRouter();
  const id = router.query.projectID as string;

  const utils = api.useContext().projects;
  const query = api.projects.read.useQuery(undefined, {
    suspense: true,
    onError: (error) => {
      console.error(error);
    },
  });

  const projects = query.data;
  const project = projects ? projects.find((p) => p.id === id) : null;

  const mutation = api.projects.edit.useMutation({
    onSuccess: async () => {
      await utils.read.invalidate();
    },
  });

  const methods = useZodForm({
    schema: EditProjectSchema,
    defaultValues: {
      id: project?.id.toString(),
      projectId: project?.id.toString(),
      changeType: "Edit",
      outcomeScore: project?.outcomeScore!,
      effortScore: project?.effortScore!,
      actualStart: project?.actualStart?.toISOString(),
      actualEnd: project?.actualStart?.toISOString(),
      lessonsLearnt: project?.lessonsLearnt!,
      retrospective: project?.retrospective!,
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

  const utilsprojectTracker = api.useContext().projectTracker;
  const mutationProjecTracker = api.projectTracker.create.useMutation({
    onSuccess: async () => {
      // await utilsprojectTracker.read.invalidate();
    },
  });

  /****   *******/


  return (
    <>
    {isMemberFound ? (
    <div className="p-8">
      <h2 className="py-2 text-2xl font-bold">Edit Project</h2>
      <form
        onSubmit={methods.handleSubmit(async (values) => {
          await Promise.all ([
            mutation.mutateAsync(values),
            mutationProjecTracker.mutateAsync(values)
          ])
          // methods.reset();
          router.push('/' + id);
        })}
        className="space-y-2"
      >
        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Name</Label>
          <div className="flex items-center">
            <Input {...methods.register("name")} 
            // {...methodsProjectTracker.register("name")} 
            className="mr-4" defaultValue={project?.name}/>
            <InfoIcon content="name test tooltip"/>
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
             <Textarea
            placeholder="Optional"
            {...methods.register("description")}
            // {...methodsProjectTracker.register("description")}
            className="mr-4"
            defaultValue={project?.description!}
            />
            <InfoIcon content="description test tooltip"/>
          </div>
         
          {methods.formState.errors.description?.message && (
            <p className="text-red-700">
              {methods.formState.errors.description?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Goal</Label>
          <div className="flex items-center">
            <Textarea {...methods.register("goal")} 
            // {...methodsProjectTracker.register("goal")} 
            className="mr-4" defaultValue={project?.goal}/>
            <InfoIcon content="goal test tooltip"/>
          </div>
          {methods.formState.errors.goal?.message && (
            <p className="text-red-700">
              {methods.formState.errors.goal?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5 pr-8">
          <Label htmlFor="name">Estimated Start Date</Label>
          {/* default to todays date if nothing selected */}
          <Input {...methods.register("estimatedStart")} 
          // {...methodsProjectTracker.register("estimatedStart")}
          type="date" 
          defaultValue={
            project?.estimatedStart &&
            project.estimatedStart.toISOString().slice(0, 10)
          }
          />

          {methods.formState.errors.estimatedStart?.message && (
            <p className="text-red-700">
              {methods.formState.errors.estimatedStart?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5 pr-8">
          <Label htmlFor="name">Estimated End Date</Label>
          <Input {...methods.register("estimatedEnd")} 
          // {...methodsProjectTracker.register("estimatedEnd")} 
          type="date" 
          defaultValue={
            project?.estimatedEnd ?
            project.estimatedEnd.toISOString().slice(0, 10)
            : undefined
          }
          />

          {methods.formState.errors.estimatedEnd?.message && (
            <p className="text-red-700">
              {methods.formState.errors.estimatedEnd?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Trigger</Label>
          <div className="flex items-center">
            <Textarea {...methods.register("trigger")} 
            // {...methodsProjectTracker.register("trigger")} 
            className="mr-4"defaultValue={project?.trigger!}/>
            <InfoIcon content="trigger test tooltip"/>
          </div>
          {methods.formState.errors.trigger?.message && (
            <p className="text-red-700">
              {methods.formState.errors.trigger?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Expected Movement</Label>
          <div className="flex items-center">
            <Textarea {...methods.register("expectedMovement")} 
            // {...methodsProjectTracker.register("expectedMovement")} 
            className="mr-4"  defaultValue={project?.expectedMovement!}/>
            <InfoIcon content="expected movement test tooltip"/>
          </div>
          
          {methods.formState.errors.expectedMovement?.message && (
            <p className="text-red-700">
              {methods.formState.errors.expectedMovement?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">
            Alternative Options or Solutions Considered
          </Label>
          <div className="flex items-center">
            <Textarea {...methods.register("alternativeOptions")} 
            // {...methodsProjectTracker.register("alternativeOptions")} 
            className="mr-4" defaultValue={project?.alternativeOptions!}/>
            <InfoIcon content="alternative solutions test tooltip"/>
          </div>
          
          {methods.formState.errors.alternativeOptions?.message && (
            <p className="text-red-700">
              {methods.formState.errors.alternativeOptions?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Estimated Risks/Concerns/Bottleknecks</Label>
          <div className="flex items-center">
            <Textarea {...methods.register("estimatedRisk")} 
            // {...methodsProjectTracker.register("estimatedRisk")} 
            className="mr-4" defaultValue={project?.estimatedRisk!}/>
            <InfoIcon content="risks test tooltip"/>
          </div>
          
          {methods.formState.errors.estimatedRisk?.message && (
            <p className="text-red-700">
              {methods.formState.errors.estimatedRisk?.message}
            </p>
          )}
        </div>

        <Button type="submit" variant={"default"} disabled={mutation.isLoading}>
          {mutation.isLoading ? "Loading" : "Edit Project"}
        </Button>
      </form>
      </div>
      ) : (
      <div className="p-8">
        <p>You are not a member of this project. Redirecting to homepage...</p>
      </div>
      )
    }
    </>
  );
}
