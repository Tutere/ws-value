import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Button } from "src/components/ui/Button";
import { Input } from "src/components/ui/Input";
import { Textarea } from "src/components/ui/TextArea";
import { Label } from "@radix-ui/react-label";
import { useZodForm } from "~/hooks/useZodForm";
import {CreateStakeholderResponseSchema} from "~/schemas/stakeholderResponse";
import { InfoIcon } from "~/components/ui/infoIcon";

export default function stakeholderSurveyForm() {
  const router = useRouter();
  const id = router.query.projectID as string;
  const utils = api.useContext().stakeholderResponse;
  const query = api.projects.read.useQuery(undefined, {
    suspense: true,
  });

  const projects = query.data;
  const project = projects ? projects.find((p) => p.id === id) : null;


  const mutation = api.stakeholderResponse.create.useMutation({
    onSuccess: async () => {
      await utils.read.invalidate();
    },
  });

  const methods = useZodForm({
    schema: CreateStakeholderResponseSchema,
    defaultValues: {
      projectId: project?.id.toString(),
    },
  });

  return (
    <>
    <div className="p-8 ">
      <h2 className="mt-5 mb-5 text-2xl font-bold">Stakeholder Survey Form</h2>
      <div className="flex flex-row mb-5">
        <Label className="font-medium">Project Name:</Label>
        <p className="ml-1">{project?.name}</p>
      </div>
      <form
        onSubmit={methods.handleSubmit(async (values) => {
          await mutation.mutateAsync(values);
          methods.reset();
          router.push('/stakeholderSurvey/completionPage');
        })}
        className="space-y-2"
      >

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Stakeholder Name</Label>
          <div className="flex items-center">
            <Input {...methods.register("organisation")} className="mr-4" />
            <InfoIcon content="Name of the organisation, group or individual that this survey repsonse is on behalf of."/>
          </div>
          
          {methods.formState.errors.organisation?.message && (
            <p className="text-red-700">
              {methods.formState.errors.organisation?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">How do you rate the benefits from this project? (1-10)</Label>
          <div className="flex items-center">
            <Input {...methods.register("benefitsRating")} className="mr-4"  />
            <InfoIcon content="1 is bad, 10 is perfect"/>
          </div> 

          {methods.formState.errors.benefitsRating?.message && (
            <p className="text-red-700">
              {methods.formState.errors.benefitsRating?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">How do you rate the experience from this project? (1-10)</Label>
          <div className="flex items-center">
            <Input {...methods.register("experienceRating")} className="mr-4"  />
            <InfoIcon content="1 is bad, 10 is perfect"/>
          </div> 

          {methods.formState.errors.experienceRating?.message && (
            <p className="text-red-700">
              {methods.formState.errors.experienceRating?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">How can we improve your experience?</Label>
          <div className="flex items-center">
            <Textarea {...methods.register("improvements")} className="mr-4"  />
            <InfoIcon content="TO BE COMPLETED"/>
          </div> 

          {methods.formState.errors.improvements?.message && (
            <p className="text-red-700">
              {methods.formState.errors.improvements?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">What was missing or disappointing in your experience with us?</Label>
          <div className="flex items-center">
            <Textarea {...methods.register("complaints")} className="mr-4" />
            <InfoIcon content="TO BE COMPLETED"/>
          </div>
          
            {methods.formState.errors.complaints?.message && (
            <p className="text-red-700">
              {methods.formState.errors.complaints?.message}
            </p>
          )}
        </div>

        <Button type="submit" variant={"default"} disabled={mutation.isLoading}>
          {mutation.isLoading ? "Loading" : "Submit Survey"}
        </Button>
      </form>
    </div>
    </>
  );
}