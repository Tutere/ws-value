import { useZodForm } from "~/hooks/useZodForm";
import { CreateProjectSchema } from "~/schemas/projects";
import { api } from "~/utils/api";

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

      <h2 className="text-2xl font-bold">Add a Project</h2>
      <form
        onSubmit={methods.handleSubmit(async (values) => {
          await mutation.mutateAsync(values);
          methods.reset();
        })}
        className="space-y-2"
      >
        <div>
          <label>
            Name
            <br />
            <input {...methods.register("name")} className="border" />
          </label>

          {methods.formState.errors.name?.message && (
            <p className="text-red-700">
              {methods.formState.errors.name?.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={mutation.isLoading}
          className="bg-primary-500 border p-2 font-bold"
        >
          {mutation.isLoading ? "Loading" : "Add Project"}
        </button>
      </form>
    </>
  );
}
