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
import {ReadProjectSchema} from "~/schemas/projects";

export default function ProjectCompletion() {
  const router = useRouter();
  const id = router.query.projectID as string;
  const utils = api.useContext().projects;
  const query = api.projects.read.useQuery(undefined, {
    suspense: true,
  });

  const projects = query.data;
  const project = projects ? projects.find((p) => p.id === id) : null;


  const mutation = api.projects.update.useMutation({
    onSuccess: async () => {
      await utils.read.invalidate();
    },
  });

  const methods = useZodForm({
    schema: ReadProjectSchema,
    defaultValues: {
    //    outcomeScore:4,
    //    effortScore:7,
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
    <div className="p-8">
      <h2 className="mt-5 mb-5 text-2xl font-bold">Project Completion Page</h2>
      <div className="flex flex-row mb-5">
        <Label className="font-medium">Project Name:</Label>
        <p className="ml-1">{project?.name}</p>
      </div>
      <form
        onSubmit={methods.handleSubmit(async (values) => {
            console.log(values.outcomeScore);
          await mutation.mutateAsync(values);
          methods.reset();
        })}
        className="space-y-2"
      >
        {/* <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">Overall Summary</Label>
          <Input {...methods.register("name")} />

          {methods.formState.errors.name?.message && (
            <p className="text-red-700">
              {methods.formState.errors.name?.message}
            </p>
          )}
        </div> */}

        {/* <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">Alternatives/Retrospective</Label>
          <Textarea {...methods.register("description")} />

          {methods.formState.errors.description?.message && (
            <p className="text-red-700">
              {methods.formState.errors.description?.message}
            </p>
          )}
        </div> */}

        {/* <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">Lessons Learnt</Label>
          <Textarea {...methods.register("engagementPattern")} />

          {methods.formState.errors.engagementPattern?.message && (
            <p className="text-red-700">
              {methods.formState.errors.engagementPattern?.message}
            </p>
          )}
        </div> */}

        {/* <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">Effort Score</Label>
          <Textarea {...methods.register("outcomeScore")} />

          {methods.formState.errors.outcomeScore?.message && (
            <p className="text-red-700">
              {methods.formState.errors.outcomeScore?.message}
            </p>
          )}
        </div> */}

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">Outcome Score (1-10) </Label>
          <div className="rating rating-lg">
            <input {...methods.register("outcomeScore")} type="radio" className="mask mask-star-2 bg-orange-400" value="1"/>
            <input {...methods.register("outcomeScore")} type="radio" className="mask mask-star-2 bg-orange-400" value="2"/>
            <input {...methods.register("outcomeScore")} type="radio" className="mask mask-star-2 bg-orange-400" value="3"/>
            <input {...methods.register("outcomeScore")} type="radio" className="mask mask-star-2 bg-orange-400" value="4"/>
            <input {...methods.register("outcomeScore")} type="radio" className="mask mask-star-2 bg-orange-400" value="5"/>
            <input {...methods.register("outcomeScore")} type="radio" className="mask mask-star-2 bg-orange-400" value="6"/>
            <input {...methods.register("outcomeScore")} type="radio" className="mask mask-star-2 bg-orange-400" value="7"/>
            <input {...methods.register("outcomeScore")} type="radio" className="mask mask-star-2 bg-orange-400" value="8"/>
            <input {...methods.register("outcomeScore")} type="radio" className="mask mask-star-2 bg-orange-400" value="9"/>
            <input {...methods.register("outcomeScore")} type="radio" className="mask mask-star-2 bg-orange-400" value="10"/>

            {methods.formState.errors.outcomeScore?.message && (
            <p className="text-red-700">
              {methods.formState.errors.outcomeScore?.message}
            </p>
          )}
          </div>
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">Effort Score (1-10) </Label>
          <div className="rating rating-lg">
            <input {...methods.register("effortScore")} type="radio"  className="mask mask-star-2 bg-orange-400" value="1"/>
            <input {...methods.register("effortScore")} type="radio"  className="mask mask-star-2 bg-orange-400" value="2"/>
            <input {...methods.register("effortScore")} type="radio"  className="mask mask-star-2 bg-orange-400" value="3"/>
            <input {...methods.register("effortScore")} type="radio"  className="mask mask-star-2 bg-orange-400" value="4"/>
            <input {...methods.register("effortScore")} type="radio"  className="mask mask-star-2 bg-orange-400" value="5"/>
            <input {...methods.register("effortScore")} type="radio"  className="mask mask-star-2 bg-orange-400" value="6"/>
            <input {...methods.register("effortScore")} type="radio"  className="mask mask-star-2 bg-orange-400" value="7"/>
            <input {...methods.register("effortScore")} type="radio"  className="mask mask-star-2 bg-orange-400" value="8"/>
            <input {...methods.register("effortScore")} type="radio"  className="mask mask-star-2 bg-orange-400" value="9"/>
            <input {...methods.register("effortScore")} type="radio"  className="mask mask-star-2 bg-orange-400" value="10"/>
            
            {methods.formState.errors.effortScore?.message && (
            <p className="text-red-700">
              {methods.formState.errors.effortScore?.message}
            </p>
          )}
          </div>
        </div>

        <Button type="submit" variant={"default"} disabled={mutation.isLoading}>
          {mutation.isLoading ? "Loading" : "Add Activity"}
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