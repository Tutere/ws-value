import { Label } from "@radix-ui/react-label";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useZodForm } from "~/hooks/useZodForm";
import { CreateProjectSchema } from "~/schemas/projects";
import { api } from "~/utils/api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/TextArea";

export default function ProjectForm() {
  const utils = api.useContext().projects;
  const query = api.projects.read.useQuery(undefined, {
    suspense: true,
    onError: (error) => {
      console.error(error);
    },
  });

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
      <h2 className="text-3xl font-bold">Projects</h2>
      <div className="flex flex-col gap-2 py-2">
        {projects &&
          projects.map((project) => {
          return (
            <Link
              href={"/" + project.id}
              key={project.id}
              className="overflow-hidden bg-white p-4 shadow sm:rounded-lg"
            >
              <h3 className="text-xl font-bold">{project.name}</h3>
              <p>{project.description}</p>
            </Link>
            )
          })}
      </div>

      <h2 className="py-2 text-2xl font-bold">Start A New Project</h2>
      <form
        onSubmit={methods.handleSubmit(async (values) => {
          await mutation.mutateAsync(values);
          methods.reset();
        })}
        className="space-y-2"
      >
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input {...methods.register("name")} />

          {methods.formState.errors.name?.message && (
            <p className="text-red-700">
              {methods.formState.errors.name?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">Description</Label>
          <Textarea
            placeholder="Optional"
            {...methods.register("description")}
          />

          {methods.formState.errors.description?.message && (
            <p className="text-red-700">
              {methods.formState.errors.description?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">Goal</Label>
          <Textarea {...methods.register("goal")} />

          {methods.formState.errors.goal?.message && (
            <p className="text-red-700">
              {methods.formState.errors.goal?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">Estimated Start Date</Label>
          {/* default to todays date if nothing selected */}
          <Input {...methods.register("estimatedStart")} type="date" />

          {methods.formState.errors.estimatedStart?.message && (
            <p className="text-red-700">
              {methods.formState.errors.estimatedStart?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">Estimated End Date</Label>
          {/* default to todays date if nothing selected */}
          <Input {...methods.register("estimatedEnd")} type="date" />

          {methods.formState.errors.estimatedEnd?.message && (
            <p className="text-red-700">
              {methods.formState.errors.estimatedEnd?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">Trigger</Label>
          <Textarea {...methods.register("trigger")} />

          {methods.formState.errors.trigger?.message && (
            <p className="text-red-700">
              {methods.formState.errors.trigger?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">Expected Movement</Label>
          <Textarea {...methods.register("expectedMovement")} />

          {methods.formState.errors.expectedMovement?.message && (
            <p className="text-red-700">
              {methods.formState.errors.expectedMovement?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">
            Alternative Options or Solutions Considered
          </Label>
          <Textarea {...methods.register("expectedMovement")} />

          {methods.formState.errors.alternativeOptions?.message && (
            <p className="text-red-700">
              {methods.formState.errors.alternativeOptions?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">Estimated Risks/Concerns/Bottleknecks</Label>
          <Textarea {...methods.register("estimatedRisk")} />

          {methods.formState.errors.estimatedRisk?.message && (
            <p className="text-red-700">
              {methods.formState.errors.estimatedRisk?.message}
            </p>
          )}
        </div>

        <Button type="submit" variant={"outline"} disabled={mutation.isLoading}>
          {mutation.isLoading ? "Loading" : "Start Project"}
        </Button>
      </form>
    </>
  );
}
