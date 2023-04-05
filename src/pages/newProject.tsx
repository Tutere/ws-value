import { Label } from "@radix-ui/react-label";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useZodForm } from "~/hooks/useZodForm";
import { CreateProjectSchema } from "~/schemas/projects";
import { api } from "~/utils/api";
import { Button } from "src/components/ui/Button";
import { Input } from "src/components/ui/Input";
import { Textarea } from "src/components/ui/TextArea";
import { InfoIcon } from "src/components/ui/infoIcon";
import { useRouter } from "next/router";

export default function ProjectForm() {
  const utils = api.useContext().projects;
  const query = api.projects.read.useQuery(undefined, {
    suspense: true,
    onError: (error) => {
      console.error(error);
    },
  });

  const router = useRouter();

  const projects = query.data;

  const mutation = api.projects.create.useMutation({
    onSuccess: async () => {
      await utils.read.invalidate();
    },
  });

  const methods = useZodForm({
    schema: CreateProjectSchema,
    defaultValues: {
      name: "",
      status: "Active",
    },
  });

  const { data: sessionData } = useSession();
  return (
    <>
      <div className="p-8">
        <h2 className="py-2 text-2xl font-bold">Start A New Project</h2>
        <form
          onSubmit={methods.handleSubmit(async (values) => {
            await mutation.mutateAsync(values);
            methods.reset();
            router.push("/");
          })}
          className="space-y-2"
        >
          <div className="grid w-full max-w-md items-center gap-1.5">
            <Label htmlFor="name">Name</Label>
            <div className="flex items-center">
              <Input {...methods.register("name")} className="mr-4" />
              <InfoIcon content="name test tooltip" />
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
              />
              <InfoIcon content="description test tooltip" />
            </div>

            {methods.formState.errors.description?.message && (
              <p className="text-red-700">
                {methods.formState.errors.description?.message}
              </p>
            )}
          </div>

          <div className="grid w-full max-w-md items-center gap-1.5">
            <Label htmlFor="name">Colour</Label>
            <div className="flex items-center">
              <Input {...methods.register("colour")} className="mr-4" />
              <InfoIcon content="Colour of project tooltip" />
            </div>
            {methods.formState.errors.colour?.message && (
              <p className="text-red-700">
                {methods.formState.errors.colour?.message}
              </p>
            )}
          </div>

          <div className="grid w-full max-w-md items-center gap-1.5">
            <Label htmlFor="name">Goal</Label>
            <div className="flex items-center">
              <Textarea {...methods.register("goal")} className="mr-4" />
              <InfoIcon content="goal test tooltip" />
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
            <Input {...methods.register("estimatedStart")} type="date" />

            {methods.formState.errors.estimatedStart?.message && (
              <p className="text-red-700">
                {methods.formState.errors.estimatedStart?.message}
              </p>
            )}
          </div>

          <div className="grid w-full max-w-md items-center gap-1.5 pr-8">
            <Label htmlFor="name">Estimated End Date</Label>
            <Input {...methods.register("estimatedEnd")} type="date" />

            {methods.formState.errors.estimatedEnd?.message && (
              <p className="text-red-700">
                {methods.formState.errors.estimatedEnd?.message}
              </p>
            )}
          </div>

          <div className="grid w-full max-w-md items-center gap-1.5">
            <Label htmlFor="name">Trigger</Label>
            <div className="flex items-center">
              <Textarea {...methods.register("trigger")} className="mr-4" />
              <InfoIcon content="trigger test tooltip" />
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
              <Textarea
                {...methods.register("expectedMovement")}
                className="mr-4"
              />
              <InfoIcon content="expected movement test tooltip" />
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
              <Textarea
                {...methods.register("alternativeOptions")}
                className="mr-4"
              />
              <InfoIcon content="alternative solutions test tooltip" />
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
              <Textarea
                {...methods.register("estimatedRisk")}
                className="mr-4"
              />
              <InfoIcon content="risks test tooltip" />
            </div>

            {methods.formState.errors.estimatedRisk?.message && (
              <p className="text-red-700">
                {methods.formState.errors.estimatedRisk?.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant={"default"}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Loading" : "Start Project"}
          </Button>
        </form>
      </div>
    </>
  );
}
