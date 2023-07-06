import { Label } from "@radix-ui/react-label";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Select from "react-select";
import { TextAreaSection } from "~/components/ui/TextAreaSection";
import { InfoIcon } from "~/components/ui/infoIcon";
import { InputSection } from "~/components/ui/inputSection";
import { useZodForm } from "~/hooks/useZodForm";
import { EditActivitySchema } from "~/schemas/activities";
import { FindActivityMemberSchema } from "~/schemas/activityMember";
import { api } from "~/utils/api";
import { Button } from "../../components/ui/Button";
import DiscreteSlider from "~/components/ui/slider";
import Link from "next/link";
import { LoadingPage } from "~/components/ui/loading";

export default function Project() {
  const router = useRouter();
  const id = router.query.activityID as string;
  const utils = api.useContext().activities;

  const { data: activity, isLoading } = api.activities.readSpecific.useQuery(
    { id: id },
    {
      suspense: true,
    }
  );

  const project = activity?.project;

  const mutation = api.activities.edit.useMutation({
    onSuccess: async () => {
      await utils.read.invalidate();
    },
  });

  const methods = useZodForm({
    schema: EditActivitySchema,
    defaultValues: {
      projectId: project?.id.toString(),
      id: id,
      changeType: "Edit",
      status: project?.status!,
      members: [],
      reportComments: activity?.reportComments ?? "",
    },
  });

  const { data: sessionData } = useSession();
  const isMemberFound = project?.members.some((member) => {
    if (member.userId === sessionData?.user.id) {
      return true;
    } else if (sessionData?.user.id === 'clh8vfdfq0000mj085tgdm0or') { //ganesh access
      return true;
    } else{
      return false;
    }
  });

  useEffect(() => {
    if (!isMemberFound) {
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  }, [isMemberFound, router]);


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
    { id: project?.id! },
    {
      suspense: true,
      onError: (error) => {
        console.error(error);
      },
    }
  );

  const projectMembers = queryProjectmembers.data;

  const options: Option[] =
    projectMembers?.map((projectMember) => ({
      value: projectMember.id,
      label:
        users?.find((item) => item.id === projectMember.userId)?.name ??
        "Error loading user",
    })) ?? [];

  type Option = { label: string; value: string };

  const [selectedOption, setSelectedOption] = useState<Option[]>([]);
  const [defaultValues, setDefaultValues] = useState<Option[]>([]);

  //turn current activity memebers to type Option, then add to selectedOption/dropdown
  useEffect(() => {
    // find all options where value is in activity.members array and set to default values
    const defaultValues = activity?.members
      .filter((member) =>
        options?.some((option) => option.value === member.projectMemberId)
      )
      .map((member) => {
        const option = options?.find(
          (option) => option.value === member.projectMemberId
        );
        return { label: option?.label!, value: option?.value! };
      });
    if (defaultValues && defaultValues.length > 0) {
      setDefaultValues(defaultValues);
    }

    if (defaultValues && defaultValues.length > 0) {
      setSelectedOption(defaultValues);
    }
  }, []);

  const handleChange = (options: Option[]) => {
    setSelectedOption(options);
  };

  //activity memeber deletion setup
  const mutationActivityMemberDeletion = api.activitymember.deleteSpecific.useMutation({
    onSuccess: async () => {
      await utils.read.invalidate();
    },
  });

  const methodsActivityMemberDeletion = useZodForm({
    schema: FindActivityMemberSchema,
    defaultValues: {
      id: "",
    },
  });

  const handleActivityMemberDeletions = () => {
    //get difference between default values we started with and the new selected options (if we have removed someone from the seleciton)
    const membersToDelete = defaultValues.filter(
      (element) => !selectedOption.includes(element)
    );

    membersToDelete.forEach(async (element) => {
      const activityMemberId = activity?.members.find(
        (member) => member.projectMemberId === element.value
      )?.id as string;
      await methodsActivityMemberDeletion.setValue("id", activityMemberId);
      await mutationActivityMemberDeletion.mutateAsync(
        methodsActivityMemberDeletion.getValues()
      ); //use same id input as projectMember deletion
      await methodsActivityMemberDeletion.reset();
    });
  };

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
  const [defaultValueStakeholder, setDefaultValueStakeholder] = useState<
    Option[]
  >([]);

  useEffect(() => {
    // find all options where value is in project.stakeholder field and set to default values
    const defaultValueStakeholder = stakeholderOptions
      ?.filter((option) => activity?.stakeholders?.includes(option.value))
      .map((option) => ({ label: option.label!, value: option.value! }));

    if (defaultValueStakeholder && defaultValueStakeholder.length > 0) {
      setDefaultValueStakeholder(defaultValueStakeholder);
    }

    if (defaultValueStakeholder && defaultValueStakeholder.length > 0) {
      setStakeholderSelectedOptions(defaultValueStakeholder);
    }
  }, []);

  const handleChangeStakeholder = (options: Option[]) => {
    setStakeholderSelectedOptions(options); //not sure why there is an error here as it still works?
  };

  //handling the exiting of a page (pop up confirmation)
  const [formSubmitted, setFormSubmitted] = useState(false);
  useEffect(() => {
    const warningText =
      "You may have unsaved changes - are you sure you wish to leave this page?";

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

  if(isLoading) {
    return <LoadingPage></LoadingPage>

  }

  if (activity === null || activity === undefined) {
    return <p>Error finding Activity</p>;
  }

  if (project === null || project === undefined) {
    return <p>Error finding Activity</p>;
  }

  return (
    <>
      {isMemberFound ? (
        <div className="p-8">

          <Link href={"/activity/" + activity?.id}>
            <Button className="mb-5" variant={"withIcon"}>
            <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current"  viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path clipRule="evenodd" fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"></path>
            </svg>
            {"Back to activity"}
            </Button>
          </Link>

          <h2 className="mb-5 text-3xl font-bold">Project: {project.name}</h2>

          <h2 className="mt-7 mb-5 text-xl font-bold">Edit Activity</h2>
          <form
            onSubmit={methods.handleSubmit(async (values) => {
              setFormSubmitted(true);
              await handleActivityMemberDeletions();
              await Promise.all([
                mutation.mutateAsync({
                  ...values,
                  members: selectedOption
                    .map((option) => option.value)
                    .filter(
                      (value) =>
                        !defaultValues.some((option) => option.value === value)
                    ), //don't include option that were already added to activity
                  stakeholders: stakeholderSelectedOptions
                    .map((option) => option.value)
                    .join(","),
                  membersTracking: selectedOption.map((option) => option.value),
                }),
              ]);
              methods.reset();
              router.push("/activity/" + activity?.id);
            })}
            className="space-y-2"
          >
            <InputSection
              label="Activity Title"
              methods={methods}
              infoContent="Title or name for the activity"
              methodsField="name"
              placeHolder=""
              type=""
              defaultValue={activity.name}
              required={false}
            />

            <TextAreaSection
              label="Description"
              methods={methods}
              infoContent="Description of the activity"
              methodsField="description"
              placeHolder=""
              defaultValue={activity.description}
              required={false}
            />

            <TextAreaSection
              label="Value Created (Outcome)"
              methods={methods}
              infoContent="Brief statement on the outcome/value that was achieved by carrying out this activity."
              methodsField="valueCreated"
              placeHolder=""
              defaultValue={activity.valueCreated ?? ""}
              required={false}
            />

            <InputSection
              label="Start Date"
              methods={methods}
              infoContent="The date that work was started for the activity"
              methodsField="startDate"
              placeHolder=""
              type="date"
              defaultValue={
                activity.startDate
                  ? activity.startDate.toISOString().slice(0, 10)
                  : ""
              }
              required={false}
            />

            <InputSection
              label="End Date"
              methods={methods}
              infoContent="The date that work was finished for the activity"
              methodsField="endDate"
              placeHolder=""
              type="date"
              defaultValue={
                activity.endDate
                  ? activity.endDate.toISOString().slice(0, 10)
                  : ""
              }
              required={false}
            />

            <DiscreteSlider
              defaultValue={activity.effortScore ?? 1}
              methods={methods}
              methodsField="effortScore"
              label="Effort Score"
              infoContent="If you had to rate the effort you had to put in to deliver this initiatve"
              renderType={"effort"}
              required={false}
            />
            <DiscreteSlider
              defaultValue={activity.outcomeScore ?? 1}
              methods={methods}
              methodsField="outcomeScore"
              label="Outcome Score"
              infoContent="If you had to rate the outcome that was achieved by this initiative"
              renderType={"outcome"}
              required={false}
            />

            <div className="grid w-full max-w-md items-center gap-1.5">
              <Label htmlFor="name">Stakeholders Involved</Label>
              <div className="flex items-center">
                <Select
                  options={stakeholderOptions}
                  className="mr-4 w-full"
                  isMulti={true}
                  defaultValue={defaultValueStakeholder}
                  value={stakeholderSelectedOptions}
                  closeMenuOnSelect={false}
                  onChange={(newValue) =>
                    handleChangeStakeholder(newValue as Option[])
                  }
                />
                <InfoIcon content="The external stakeholders that were involved in this activity (to edit dropdown selection, please do so at the project level)" />
              </div>
            </div>

            <TextAreaSection
              label="Engagement Pattern"
              methods={methods}
              infoContent="Brief summary on how engaging your stakeholders were - were they proactive, reactive, passive etc."
              methodsField="engagementPattern"
              placeHolder="Optional"
              defaultValue={activity.engagementPattern ?? ""}
              required={false}
            />

            <InputSection
              label="Hours taken to complete"
              methods={methods}
              infoContent="How many hours has it taken to complete this activity?"
              methodsField="hours"
              placeHolder="Optional"
              defaultValue={activity.hours?.toString() ?? ""}
              type=""
              required={false}
            />

            <div className="grid w-full max-w-md items-center gap-1.5">
              <Label htmlFor="name">Activity members</Label>
              <div className="flex items-center">
                <Select
                  options={options}
                  className="mr-4 w-full"
                  isMulti={true}
                  defaultValue={defaultValues}
                  value={selectedOption}
                  closeMenuOnSelect={false}
                  onChange={(newValue) => handleChange(newValue as Option[])}
                  noOptionsMessage={() => "Not Found - Please make sure they are a member of this project"}
                />
                <InfoIcon content="Innovation Team Members that also contributed. Only shows members of this project." />
              </div>
            </div>

            <Button
              type="submit"
              variant={"default"}
              disabled={mutation.isLoading}
            >
              <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path clipRule="evenodd" fillRule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z"></path>
              </svg>
              {mutation.isLoading ? "Loading" : "Save Changes"}
            </Button>
          </form>
        </div>
      ) : (
        <div className="p-8">
          <p>
            You are not a member of this project. Redirecting to homepage...
          </p>
        </div>
      )}
    </>
  );
}
