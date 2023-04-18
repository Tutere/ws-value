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
import Select, { MultiValue } from 'react-select'
import { SetStateAction, useState } from "react";

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
    onSuccess: async (data) => {
      methods.setValue("projectId", data.id);
      await utils.read.invalidate();
    },
  });

  const methods = useZodForm({
    schema: CreateProjectSchema,
    defaultValues: {
      name: "",
      status: "Active",
      changeType: "Create",
      projectId: "",//placeholder before getting id from newly created project
      members: [],
    },
  });

  const mutationProjecTracker = api.projectTracker.create.useMutation({

  });

  const { data: sessionData } = useSession();


  // ****** get users for dropdown selection **********
  const queryUsers = api.users.read.useQuery(undefined, {
    suspense: true,
    onError: (error) => {
      console.error(error);
    },
  });

  const users = queryUsers.data;

  const options = users?.map((user) => ({
    value: user.id,
    label: user.name,
  }));

  //set current logged in user as default value (will pre-load the dropdown)
  const defaultValue = options?.find((option) => option.value === sessionData?.user.id);

  type Option = { label: string, value: string }

  const [selectedOption, setSelectedOption] = useState<Option[]>([]);

  //turn logged in (default) user to type Option, then add to selectedOption/dropdown
  const user: Option = { label: defaultValue?.label!, value: defaultValue?.value! }
  if (selectedOption.length === 0) {
    selectedOption.push(user);
  }

  const handleChange = (options: readonly Option[]) => {
    console.log(options);
    setSelectedOption(options); //not sure why there is an error here as it still works?
  };

  // ****************

  return (
    <>
      <div className="p-8">
        <h2 className="py-2 text-2xl font-bold">Start A New Project</h2>
        <form
          onSubmit={methods.handleSubmit(async (values) => {
            await console.log(selectedOption);
            await Promise.all([
              await mutation.mutateAsync({
                ...values,
                members: selectedOption.map((option) => option.value)
              }),
              await mutationProjecTracker.mutateAsync({
                ...values,
                projectId: methods.getValues("projectId"),
              })
            ])
            methods.reset();
            router.push("/");
          })}
          className="space-y-2"
        >

          {/* <div className="flex">
            <div>
              <Label htmlFor="name">Icon</Label>
              <div className="flex items-center">
                <Input {...methods.register("icon")} className="mr-4" defaultValue={"📄"} />
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
                <Input {...methods.register("colour")} className="mr-4" defaultValue={"cfdfdc"} />
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
              <Input {...methods.register("name")} className="mr-4" />
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
              <Textarea {...methods.register("goal")} className="mr-4" />
              <InfoIcon content="Goal" />
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
              <Textarea
                {...methods.register("expectedMovement")}
                className="mr-4"
              />
              <InfoIcon content="This is very abstract concept. With your initiative, (brief summary) where you able to create a desired movement for the stakeholders, wider H&S community and NZ workforce. E.g., I presented the product to the union, and they are taking to forward to another PCBU to trial this as a part of their tool box sessions. " />
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
              <InfoIcon content="Explanation goes here" />
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
              <InfoIcon content="Explanation goes here" />
            </div>

            {methods.formState.errors.estimatedRisk?.message && (
              <p className="text-red-700">
                {methods.formState.errors.estimatedRisk?.message}
              </p>
            )}
          </div>

          <div className="grid w-full max-w-md items-center gap-1.5">
            <Label htmlFor="name">Project members</Label>
            <div className="flex items-center">
              <Select options={options}
                className="mr-4 w-full"
                isMulti
                defaultValue={defaultValue}
                value={selectedOption}
                closeMenuOnSelect={false}
                onChange={handleChange}
              />
              <InfoIcon content="Innovation Team Members that also contributed. Only shows members who have an account on Measuring Value." />
            </div>
            {methods.formState.errors.icon?.message && (
              <p className="text-red-700">
                {methods.formState.errors.icon?.message}
              </p>
            )}
          </div>

          <div className="grid w-full max-w-md items-center gap-1.5">
            <Label htmlFor="name">External Stakeholders</Label>
            <div className="flex items-center">
              <Input
                {...methods.register("stakeholders")}
                className="mr-4"
              />
              <InfoIcon content="Who did you work with that is not a part of Worksafe?" />
            </div>

            {methods.formState.errors.stakeholders?.message && (
              <p className="text-red-700">
                {methods.formState.errors.stakeholders?.message}
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

