import { Label } from "@radix-ui/react-label";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useZodForm } from "~/hooks/useZodForm";
import { CreateProjectSchema, EditProjectSchema } from "~/schemas/projects";
import { api } from "~/utils/api";
import { Button } from "src/components/ui/Button";
import { Input } from "src/components/ui/Input";
import { Textarea } from "src/components/ui/TextArea";
import { InfoIcon } from "src/components/ui/infoIcon";
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
      changeType: "Edit",
      id: project?.id.toString(),
      projectId: project?.id.toString(),
      outcomeScore: project?.outcomeScore || 1,
      effortScore: project?.effortScore || 1,
      actualStart: project?.actualStart?.toISOString() || project?.estimatedStart?.toISOString(),
      actualEnd: project?.actualEnd?.toISOString() || project?.estimatedEnd?.toISOString(),
      lessonsLearnt: project?.lessonsLearnt! || "",
      retrospective: project?.retrospective! || "",
      status: project?.status!,
      colour: project?.colour!,
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

  const mutationProjecTracker = api.projectTracker.edit.useMutation({
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
              console.log(methods.getValues())
              await Promise.all([
                mutation.mutateAsync(values),
                mutationProjecTracker.mutateAsync(values)
              ])
              methods.reset();
              router.push('/' + id);
            })}
            className="space-y-2"
          >
            {/* <div className="flex">
            <div>
              <Label htmlFor="name">Icon</Label>
              <div className="flex items-center">
                <Input {...methods.register("icon")} className="mr-4" defaultValue={project?.icon} />
                <InfoIcon content="Choose an Emoji, or stick with the default." />
              </div>
              {methods.formState.errors.icon?.message && (
                <p className="text-red-700">
                  {methods.formState.errors.icon?.message}
                </p>
              )}
            </div>

            <div className="ml-5">
              <Label htmlFor="name">Colour</Label>
              <div className="flex items-center">
                <Input {...methods.register("colour")} className="mr-4" defaultValue={project?.colour} />
                <InfoIcon content="Hex code for a colour." />
              </div>
              {methods.formState.errors.colour?.message && (
                <p className="text-red-700">
                  {methods.formState.errors.colour?.message}
                </p>
              )}
            </div>
          </div> */}

            <div className="grid w-full max-w-md items-center gap-1.5">
              <Label htmlFor="name">Name</Label>
              <div className="flex items-center">
                <Input {...methods.register("name")} className="mr-4" defaultValue={project?.name} />
                <InfoIcon content="Name of the person filling this information" />
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
                  className="mr-4"
                  defaultValue={project?.description!}
                />
                <InfoIcon content="A brief summary describing the initiative" />
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
                <Textarea {...methods.register("goal")} className="mr-4" defaultValue={project?.goal} />
                <InfoIcon content="Remember SMART - Specific, Measurable, Achievable, Relevant, and Time-Bound." />
              </div>
              {methods.formState.errors.goal?.message && (
                <p className="text-red-700">
                  {methods.formState.errors.goal?.message}
                </p>
              )}
            </div>

            <div className="grid w-full max-w-md items-center gap-1.5">
              <Label htmlFor="name">Estimated Start Date</Label>
              <div className="flex items-center">
              {/* default to todays date if nothing selected */}
              <Input {...methods.register("estimatedStart")} type="date" className="mr-4"
                defaultValue={
                  project?.estimatedStart &&
                  project.estimatedStart.toISOString().slice(0, 10)
                }

              />
              <InfoIcon content="The date that is estimated for the project to start being worked on" />
              </div>
              {methods.formState.errors.estimatedStart?.message && (
                <p className="text-red-700">
                  {methods.formState.errors.estimatedStart?.message}
                </p>
              )}
            </div>

            <div className="grid w-full max-w-md items-center gap-1.5">
              <Label htmlFor="name">Estimated End Date</Label>
              <div className="flex items-center">
              <Input {...methods.register("estimatedEnd")} type="date" className="mr-4"
                defaultValue={
                  project?.estimatedEnd ?
                    project.estimatedEnd.toISOString().slice(0, 10)
                    : undefined
                }
              />
              <InfoIcon content="The date that is estimated for the project to be completed" />
              </div>

              {methods.formState.errors.estimatedEnd?.message && (
                <p className="text-red-700">
                  {methods.formState.errors.estimatedEnd?.message}
                </p>
              )}
            </div>

            <div className="grid w-full max-w-md items-center gap-1.5">
              <Label htmlFor="name">Trigger</Label>
              <div className="flex items-center">
                <Textarea {...methods.register("trigger")} className="mr-4" defaultValue={project?.trigger!} />
                <InfoIcon content="What was the trigger to kick start this initiative - add information on the back story, context, any due diligence etc" />
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
                <Textarea {...methods.register("expectedMovement")} className="mr-4" defaultValue={project?.expectedMovement!} />
                <InfoIcon content="What outcome are you expected to provide the stakeholders, worksafe, etc. " />
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
                <Textarea {...methods.register("alternativeOptions")} className="mr-4" defaultValue={project?.alternativeOptions!} />
                <InfoIcon content="" />
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
                <Textarea {...methods.register("estimatedRisk")} className="mr-4" defaultValue={project?.estimatedRisk!} />
                <InfoIcon content="" />
              </div>

              {methods.formState.errors.estimatedRisk?.message && (
                <p className="text-red-700">
                  {methods.formState.errors.estimatedRisk?.message}
                </p>
              )}
            </div>

            <Button type="submit" variant={"default"} disabled={mutation.isLoading}>
              {mutation.isLoading ? "Loading" : "Done Editing"}
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
