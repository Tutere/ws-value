import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/TextArea";
import { Label } from "@radix-ui/react-label";
import { useZodForm } from "~/hooks/useZodForm";
import { CreateActivitySchema } from "~/schemas/activities";
import Link from "next/link";

export default function Project() {
  const router = useRouter();
  const id = router.query.projectID;
  const utils = api.useContext().activities;
  const query = api.projects.read.useQuery(undefined, {
    suspense: true,
  });

  const projects = query.data;
  const project = projects ? projects.find((p) => p.id === id) : null;

  const { data: activities } = api.activities.read.useQuery(undefined, {
    suspense: true,
  });

  const mutation = api.activities.create.useMutation({
    onSuccess: async () => {
      await utils.read.invalidate();
    },
  });

  const methods = useZodForm({
    schema: CreateActivitySchema,
    defaultValues: {
      projectId: project?.id.toString(),
    },
  });

  return (
    <div className="p-8">
      <h2 className="mb-5 text-3xl font-bold">Project Details</h2>
      <div className="flex flex-row">
        <Label className="font-medium">Project Name:</Label>
        <p className="ml-1">{project?.name}</p>
      </div>
      <div className="flex flex-row">
        <Label className="font-medium">Goal:</Label>
        <p className="ml-1">{project?.goal}</p>
      </div>
      <div className="flex flex-row">
        <Label className="font-medium">Start Date:</Label>
        <p className="ml-1">{project?.estimatedStart.toLocaleDateString()}</p>
      </div>

      <h2 className="mt-5 text-2xl font-bold">Project Activities</h2>
      <div className="flex flex-col gap-2 py-2">
        {activities &&
          activities.map((activity) => (
            <article
              key={activity.id}
              className="overflow-hidden bg-white p-4 shadow sm:rounded-lg"
            >
              <h3 className="text-xl font-bold">{activity.name}</h3>
              <p>{activity.description}</p>
            </article>
          ))}
      </div>

      <h2 className="mt-5 text-2xl font-bold">Add a New Activity</h2>
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
          <Textarea {...methods.register("description")} />

          {methods.formState.errors.description?.message && (
            <p className="text-red-700">
              {methods.formState.errors.description?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">Engagement Pattern</Label>
          <Textarea {...methods.register("engagementPattern")} />

          {methods.formState.errors.engagementPattern?.message && (
            <p className="text-red-700">
              {methods.formState.errors.engagementPattern?.message}
            </p>
          )}
        </div>

        <Button type="submit" variant={"default"} disabled={mutation.isLoading}>
          {mutation.isLoading ? "Loading" : "Add Activity"}
        </Button>
      </form>
    </div>
  );
}
