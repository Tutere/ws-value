import { Label } from "@radix-ui/react-label";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Select from 'react-select';
import { Button } from "src/components/ui/Button";
import { Input } from "src/components/ui/Input";
import { InfoIcon } from "src/components/ui/infoIcon";
import { TextAreaSection } from "~/components/ui/TextAreaSection";
import { InputSection } from "~/components/ui/inputSection";
import { useCurrentDate } from "~/hooks/useCurrentDate";
import { useZodForm } from "~/hooks/useZodForm";
import { CreateProjectSchema } from "~/schemas/projects";
import { api } from "~/utils/api";


export default function ProjectForm() {
  const utils = api.useContext().projects;

  const router = useRouter();

  const mutation = api.projects.create.useMutation({
    onSuccess: async (data) => {
      // methods.setValue("projectId", data.id);
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

  type Option = { label: string | null, value: string }

  const [selectedOption, setSelectedOption] = useState<Option[]>([]);

  //turn logged in (default) user to type Option, then add to selectedOption/dropdown
  const user: Option = { label: defaultValue?.label!, value: defaultValue?.value! }
  if (selectedOption.length === 0) {
    selectedOption.push(user);
  }

  const handleChange = (options: Option[]) => {
    setSelectedOption(options); //not sure why there is an error here as it still works?
  };

  // ****************

  //handling the exiting of a page (pop up confirmation)
  const [formSubmitted, setFormSubmitted] = useState(false);
  useEffect(() => {
    const warningText = 'You have unsaved changes - are you sure you wish to leave this page?';

    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (formSubmitted) return;
      e.preventDefault();
      return (e.returnValue = warningText);
    };

    const handleBrowseAway = () => {
      if (formSubmitted) return;
      if (window.confirm(warningText)) return;
      router.events.emit('routeChangeError');
      throw 'routeChange aborted.';
    };

    window.addEventListener('beforeunload', handleWindowClose);
    router.events.on('routeChangeStart', handleBrowseAway);

    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      router.events.off('routeChangeStart', handleBrowseAway);
    };

  }, [formSubmitted]);

  return (
    <>
      <div className="p-8">
        <h2 className="py-2 text-2xl font-bold">Start A New Project</h2>
        <form
          onSubmit={methods.handleSubmit(async (values) => {
            setFormSubmitted(true);
            await Promise.all([
              await mutation.mutateAsync({
                ...values,
                members: selectedOption.map((option) => option.value)
              }),
            ])
            methods.reset();
            router.push("/");
          })}
          className="space-y-2"
        >

          <div className="flex">
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
                <Input type = "color" {...methods.register("colour")} className="mr-4 w-20" defaultValue="#FFFFFF" />
                <InfoIcon content="This colour is shown from the homepage." />
              </div>
              {methods.formState.errors.colour?.message && (
                <p className="text-red-700">
                  {methods.formState.errors.colour?.message}
                </p>
              )}
            </div>
          </div>


          <InputSection
          label="Name"
          methods={methods}
          infoContent="Name of this project"
          methodsField="name"
          placeHolder=""
          type=""
          defaultValue=""
          required={true}
          />

          <TextAreaSection
          label="Description"
          methods={methods}
          infoContent="A brief summary describing the initiative"
          methodsField="description"
          placeHolder="Optional"
          defaultValue=""
          required={false}
          />

          <TextAreaSection
          label="Goal"
          methods={methods}
          infoContent="Remember SMART - Specific, Measurable, Achievable, Relevant, and Time-Bound."
          methodsField="goal"
          placeHolder=""
          defaultValue=""
          required={true}
          />
          
          <TextAreaSection
          label="Expected Outcomes"
          methods={methods}
          infoContent="Which outcomes do you expect from completing this project (if separate to your goal)?"
          methodsField="expectedMovement"
          placeHolder="Optional"
          defaultValue=""
          required={false}
          />

          <InputSection
          label="Estimated Start Date"
          methods={methods}
          infoContent="The date that is estimated for the project to start being worked on"
          methodsField="estimatedStart"
          placeHolder=""
          type="date"
          defaultValue={useCurrentDate()}
          required={false}
          />

          <InputSection
          label="Estimated End Date"
          methods={methods}
          infoContent="The date that is estimated for the project to be completed"
          methodsField="estimatedEnd"
          placeHolder=""
          type="date"
          defaultValue=""
          required={false}
          />
          
          <TextAreaSection
          label="Trigger"
          methods={methods}
          infoContent="What was the trigger to kick start this initiative - add information on the back story, context, any due diligence etc"
          methodsField="trigger"
          placeHolder="Optional"
          defaultValue=""
          required={false}
          />

          <TextAreaSection
          label="Alternative Options or Solutions Considered"
          methods={methods}
          infoContent="What other solutions were considered prior to initiating this project?"
          methodsField="alternativeOptions"
          placeHolder="Optional"
          defaultValue=""
          required={false}
          />

          <TextAreaSection
          label="Estimated Risks/Concerns"
          methods={methods}
          infoContent="What are the main risks or concerns with this project?"
          methodsField="estimatedRisk"
          placeHolder="Optional"
          defaultValue=""
          required={false}
          />

          <div className="grid w-full max-w-md items-center gap-1.5">
            <Label htmlFor="name">Project members</Label>
            <div className="flex items-center">
              <Select options={options}
                className="mr-4 w-full"
                isMulti = {true}
                defaultValue={defaultValue}
                value={selectedOption}
                closeMenuOnSelect={false}
                onChange={(newValue) => handleChange(newValue as Option[])}
                noOptionsMessage={() => "Not Found - Maybe they don't have an account here yet?"}
              />
              <InfoIcon content="Innovation Team Members that also contributed. Only shows members who have an account on Measuring Value." />
            </div>
            {methods.formState.errors.icon?.message && (
              <p className="text-red-700">
                {methods.formState.errors.icon?.message}
              </p>
            )}
          </div>

          <TextAreaSection
          label="Stakeholders (separate by comma)"
          methods={methods}
          infoContent="The stakeholders that will be involved in this project (please seperate each stakeholder by comma)"
          methodsField="stakeholders"
          placeHolder="Optional"
          defaultValue=""
          required={false}
          />

          <InputSection
          label="Link to Project Initiation Document"
          methods={methods}
          infoContent="Copy and paste the link to the project initiation document, if you have one."
          methodsField="pid"
          placeHolder="Optional"
          type=""
          defaultValue=""
          required={false}
          />


          <Button
            type="submit"
            variant={"default"}
            disabled={mutation.isLoading}
          >
            <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
            </svg>
            {mutation.isLoading ? "Loading" : "Start Project"}
          </Button>
        </form>
      </div>
    </>
  );
}

