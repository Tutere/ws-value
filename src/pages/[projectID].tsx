import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/TextArea";
import { Label } from "@radix-ui/react-label";
import { useZodForm } from "~/hooks/useZodForm";
import { CreateActivitySchema } from "~/schemas/activities";

export default function Project () {
    const router = useRouter();
    const id = router.query.projectID;

    const utils = api.useContext().projects;
    const query = api.projects.read.useQuery(undefined, {
        suspense: true,
    });

    const projects = query.data;
    const project = projects ? projects.find((p) => p.id === id): null;

    const mutation = api.activities.create.useMutation({
        onSuccess: async () => {
          await utils.read.invalidate();
        },
      });

    const methods = useZodForm({
        schema: CreateActivitySchema,
        defaultValues: {
        //   name: "",
        },
      });

    return (
        <div>
            <h2 className="text-3xl font-bold mb-5">Project Details</h2>
            <p>{project?.goal}</p>
            <p>{project?.estimatedStart.toLocaleDateString()}</p>

            <h2 className="mt-5 text-2xl font-bold">Project Activities</h2>

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
                <Textarea
                    {...methods.register("description")}
                />

                {methods.formState.errors.description?.message && (
                    <p className="text-red-700">
                    {methods.formState.errors.description?.message}
                    </p>
                )}
                </div>
                
                <Button type="submit" variant={"default"} disabled={mutation.isLoading}>
                {mutation.isLoading ? "Loading" : "Add Activity"}
                </Button>
            </form>
        </div>
    )
}
