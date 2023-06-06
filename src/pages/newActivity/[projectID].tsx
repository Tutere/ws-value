import { Label } from "@radix-ui/react-label";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Select from "react-select";
import { TextAreaSection } from "~/components/ui/TextAreaSection";
import { InfoIcon } from "~/components/ui/infoIcon";
import { InputSection } from "~/components/ui/inputSection";
import { useZodForm } from "~/hooks/useZodForm";
import { CreateActivitySchema } from "~/schemas/activities";
import { api } from "~/utils/api";
import { Button } from "../../components/ui/Button";
import { useCurrentDate } from "~/hooks/useCurrentDate";
import { LoadingPage } from "~/components/ui/loading";
import DiscreteSlider from "~/components/ui/slider";

export default function Project() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const id = router.query.projectID as string;
  const utils = api.useContext().activities;
  const query = api.projects.FindByProjectId.useQuery({ id: id }, {
    suspense: true,
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        router.push("/");
      }
    }
  });


  const project = query.data;

  const mutation = api.activities.create.useMutation({
    onSuccess: async (data) => {
      methods.setValue("id", data.id);
      await utils.read.invalidate();
    },
  });

  const methods = useZodForm({
    schema: CreateActivitySchema,
    defaultValues: {
      projectId: project?.id.toString(),
      changeType: "Create",
      id: "", //placeholder before getting id from newly created activity
      status: "Active",
      members: [],
    },
  });

  const { data: sessionData } = useSession();


  /****  For Data lineage *******/
  const mutationActivityTracker = api.activityTracker.edit.useMutation();

  // *** get users for later searching ***//
  const queryUsers = api.users.read.useQuery(undefined, {
    suspense: true,
    onError: (error) => {
      console.error(error);
    },
  });

  const users = queryUsers.data;

  // ****** get project members for dropdown selection **********
  const queryProjectmembers = api.projectmember.read.useQuery(
    { id: id },
    {
      suspense: true,
      onError: (error) => {
        console.error(error);
      },
    }
  );

  const projectMembers = queryProjectmembers.data;

  const options = projectMembers?.map((projectMember) => ({
    value: projectMember.id,
    label: users?.find((item) => item.id === projectMember.userId)?.name,
  }));

  //current logged in user
  const currentUser = projectMembers?.find(
    (projectMember) => projectMember.userId === sessionData?.user.id
  );

  //set current logged in user as default value (will pre-load the dropdown)
  const defaultValue = options?.find(
    (option) => option.value === currentUser?.id
  );

  type Option = { label: string; value: string };

  const [selectedOption, setSelectedOption] = useState<Option[]>([]);

  //turn logged in (default) user to type Option, then add to selectedOption/dropdown
  const user: Option = {
    label: defaultValue?.label!,
    value: defaultValue?.value!,
  };
  if (selectedOption.length === 0) {
    selectedOption.push(user);
  }

  const handleChange = (options: Option[]) => {
    setSelectedOption(options); //not sure why there is an error here as it still works?
  };

  // ****************

  //setup for stakeholder dropdown
  const stakeholderOptions = project?.stakeholders
    ?.split(",")
    .map((stakeholder) => ({
      value: stakeholder,
      label: stakeholder,
    }));

  const [stakeholderSelectedOptions, setStakeholderSelectedOptions] = useState<
    Option[]
  >([]);

  const handleChangeStakeholder = (options: Option[]) => {
    setStakeholderSelectedOptions(options); //not sure why there is an error here as it still works?
  };

  //handling the exiting of a page (pop up confirmation)
  const [formSubmitted, setFormSubmitted] = useState(false);
  useEffect(() => {
    const warningText =
      "You have unsaved changes - are you sure you wish to leave this page?";

    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (formSubmitted) return;
      e.preventDefault();
      return (e.returnValue = warningText);
    };

    const handleBrowseAway = () => {
      if (formSubmitted) return;
      if (window.confirm(warningText)) return;
      router.events.emit("routeChangeError");
      throw "routeChange aborted.";
    };

    window.addEventListener("beforeunload", handleWindowClose);
    router.events.on("routeChangeStart", handleBrowseAway);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
      router.events.off("routeChangeStart", handleBrowseAway);
    };
  }, [formSubmitted]);

  if (loading) {
    return <LoadingPage></LoadingPage>
  }

  return (
    <>
      <div className="p-8">
        <h2 className="mb-5 text-3xl font-bold">Project: {project?.name}</h2>

        <h2 className="mt-7 text-xl font-bold">Add a New Activity</h2>
        <form
          onSubmit={methods.handleSubmit(async (values) => {
            setFormSubmitted(true);
            await Promise.all([
              await mutation.mutateAsync({
                ...values,
                members: selectedOption.map((option) => option.value),
                stakeholders: stakeholderSelectedOptions
                  .map((option) => option.value)
                  .join(","),
              }),
              await mutationActivityTracker.mutateAsync({
                ...values,
                id: methods.getValues("id"), // update id feild with the created activity's id
                members: selectedOption.map((option) => option.value),
                stakeholders: stakeholderSelectedOptions
                  .map((option) => option.value)
                  .join(","),
              }),
            ]);
            methods.reset();
            router.push("/" + id);
          })}
          className="space-y-2"
        >
          <InputSection
            label="Name"
            methods={methods}
            infoContent="Name for the activity"
            methodsField="name"
            placeHolder=""
            type=""
            defaultValue=""
            required={true}
          />

          <TextAreaSection
            label="Description"
            methods={methods}
            infoContent="Description of the activity"
            methodsField="description"
            placeHolder=""
            defaultValue=""
            required={true}
          />

          <div className="grid w-full max-w-md items-center gap-1.5">
            <Label htmlFor="name">Stakeholders Involved</Label>
            <div className="flex items-center">
              <Select
                options={stakeholderOptions}
                className="mr-4 w-full"
                isMulti
                // defaultValue={defaultValue}
                value={stakeholderSelectedOptions}
                closeMenuOnSelect={false}
                onChange={(newValue) =>
                  handleChangeStakeholder(newValue as Option[])
                }
                placeholder="Optional"
              />
              <InfoIcon content="External Stakeholders that were involved. Only shows up if indicated they are involved in the project overall." />
            </div>
            {methods.formState.errors.members?.message && (
              <p className="text-red-700">
                {methods.formState.errors.members?.message}
              </p>
            )}
          </div>

          <TextAreaSection
            label="Engagement Pattern"
            methods={methods}
            infoContent="Brief summary on how engaging your stakeholders were - were they proactive, reactive, passive etc."
            methodsField="engagementPattern"
            placeHolder="Optional"
            defaultValue=""
            required={false}
          />

          <TextAreaSection
            label="Value Created (Outcome)"
            methods={methods}
            infoContent="Brief statement on the outcome/value that was achieved by carrying out this activity."
            methodsField="valueCreated"
            placeHolder=""
            defaultValue=""
            required={true}
          />

          <InputSection
            label="Start Date"
            methods={methods}
            infoContent="The date that work was started for the activity"
            methodsField="startDate"
            placeHolder=""
            type="date"
            defaultValue={useCurrentDate()}
            required={true}
          />

          <InputSection
            label="End Date"
            methods={methods}
            infoContent="The date that work was finished for the activity"
            methodsField="endDate"
            placeHolder=""
            type="date"
            defaultValue=""
            required={false}
          />

          <DiscreteSlider

            methods={methods}
            methodsField="effortScore"
            label="Effort Score"
            infoContent="If you had to rate the effort you had to put in to deliver this initiatve"
            renderType={"effort"}
            defaultValue={1}
          />
            <DiscreteSlider
             
              methods={methods}
              methodsField="outcomeScore"
              label="Outcome Score"
              infoContent="If you had to rate the outcome that was achieved by this initiative"
              renderType={"outcome"}
              defaultValue={1}
              
            />

          <InputSection
            label="Hours taken to complete"
            methods={methods}
            infoContent="How many hours has it taken to complete this activity?"
            methodsField="hours"
            placeHolder="Optional"
            defaultValue=""
            type=""
            required={false}
          />

          <div className="grid w-full max-w-md items-center gap-1.5">
            <Label htmlFor="name">Activity members</Label>
            <div className="flex items-center">
              <Select
                options={options}
                className="mr-4 w-full"
                isMulti
                defaultValue={defaultValue}
                value={selectedOption}
                closeMenuOnSelect={false}
                onChange={(newValue) => handleChange(newValue as Option[])}
              />
              <InfoIcon content="Innovation Team Members that also contributed. Only shows members who have an account on Measuring Value." />
            </div>
            {/* {methods.formState.errors.icon?.message && (
              <p className="text-red-700">
                {methods.formState.errors.icon?.message}
              </p>
            )} */}
          </div>

          <Button
            type="submit"
            variant={"default"}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Loading" : "Add Activity"}
          </Button>
        </form>
      </div>
    </>
  );
}
