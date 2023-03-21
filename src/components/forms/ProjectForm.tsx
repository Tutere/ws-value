import { Label } from "@radix-ui/react-label";
import { useZodForm } from "~/hooks/useZodForm";
import { CreateProjectSchema } from "~/schemas/projects";
import { api } from "~/utils/api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export default function ProjectForm() {
  const utils = api.useContext().projects;
  const query = api.projects.read.useQuery(undefined, {
    suspense: true,
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
    },
  });

  return (
    <>
      <h2 className="text-3xl font-bold">Projects</h2>
      <div className="flex flex-col gap-2 py-2">
        {projects &&
          projects.map((project) => (
            <article
              key={project.id}
              className="overflow-hidden bg-white p-4 shadow sm:rounded-lg"
            >
              <h3 className="text-xl font-bold">{project.name}</h3>
            </article>
          ))}
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

        <Button type="submit" disabled={mutation.isLoading}>
          {mutation.isLoading ? "Loading" : "Start Project"}
        </Button>
      </form>
    </>
  );
}
