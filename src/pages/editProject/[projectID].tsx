import { Label } from "@radix-ui/react-label";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useZodForm } from "~/hooks/useZodForm";
import { CreateProjectSchema, EditProjectSchema } from "~/schemas/projects";
import { api } from "~/utils/api";
import { Button } from "src/components/ui/Button";
import { Input } from "src/components/ui/Input";
import { Textarea } from "src/components/ui/TextArea";
import { InfoIcon } from "src/components/ui/infoIcon";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Select, { MultiValue } from "react-select";
import { FindProjectmemberSchema } from "~/schemas/projectmember";
import { FindActivityMemberSchema } from "~/schemas/activityMember";
import { InputSection } from "~/components/ui/inputSection";
import { TextAreaSection } from "~/components/ui/TextAreaSection";

export default function ProjectForm() {
  const router = useRouter();
  const id = router.query.projectID as string;

  const utils = api.useContext().projects;
  const query = api.projects.read.useQuery(undefined, {
    suspense: true,
    onError: (error) => {
      console.error(error);
    },
  });

  const projects = query.data;
  const project = projects ? projects.find((p) => p.id === id) : null;

  const mutation = api.projects.edit.useMutation({
    onSuccess: async () => {
      await utils.read.invalidate();
    },
  });

  const methods = useZodForm({
    schema: EditProjectSchema,
    defaultValues: {
      changeType: "Edit",
      id: project?.id.toString(),
      projectId: project?.id.toString(),
      outcomeScore: project?.outcomeScore || 1,
      effortScore: project?.effortScore || 1,
      actualStart:
        project?.actualStart?.toISOString() ||
        project?.estimatedStart?.toISOString(),
      actualEnd: project?.actualEnd?.toISOString() || "",
      lessonsLearnt: project?.lessonsLearnt! || "",
      retrospective: project?.retrospective! || "",
      status: project?.status!,
      colour: project?.colour!,
      members: [],
      stakeholders: project?.stakeholders! || "",
    },
  });

  const { data: sessionData } = useSession();

  const isMemberFound = project?.members.some((member) => {
    return member.userId === sessionData?.user.id;
  });

  useEffect(() => {
    if (!isMemberFound) {
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  }, [isMemberFound, router]);

  /****  For Data lineage *******/

  const mutationProjecTracker = api.projectTracker.edit.useMutation({
    onError: (error) => {
      console.error(error);
    },
  });

  /***********/

  // ****** get users for dropdown selection options**********
  const queryUsers = api.users.read.useQuery(undefined, {
    suspense: true,
    onError: (error) => {
      console.error(error);
    },
  });

  const users = queryUsers.data;

  const options =
    users?.map((user) => ({
      value: user.id,
      label: user.name ?? "Error loading user",
    })) ?? [];

  type Option = { label: string; value: string };

  const [selectedOption, setSelectedOption] = useState<Option[]>([]);
  const [defaultValues, setDefaultValues] = useState<Option[]>([]);

  //turn current project memebers to type Option, then add to selectedOption/dropdown selection
  useEffect(() => {
    // find all options where value is in project.members array and set to default values
    const defaultValues = project?.members
      .filter((member) =>
        options?.some((option) => option.value === member.userId)
      )
      .map((member) => {
        const option = options?.find(
          (option) => option.value === member.userId
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
    console.log(options);
    setSelectedOption(options); //not sure why there is an error here as it still works?
  };

  //project memeber deletion setup
  const mutationProjectMemberDeletion = api.projectmember.delete.useMutation({
    onSuccess: async () => {
      await utils.read.invalidate();
    },
  });
  const methodsProjectMemberDeletion = useZodForm({
    schema: FindProjectmemberSchema,
    defaultValues: {
      id: "",
    },
  });

  //for each member deleted, also need to delete where they are an activity member
  const mutationActivityMemberDeletion = api.activitymember.delete.useMutation({
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

  const handleProjectMemberDeletions = () => {
    //get difference between default values we started with and the new selected options
    const membersToDelete = defaultValues.filter(
      (element) => !selectedOption.includes(element)
    );

    //firstly delete associated activity members before deleting project meember
    membersToDelete.forEach(async (element) => {
      const projectmemberId = project?.members.find(
        (member) => member.userId === element.value
      )?.id as string;
      await console.log(projectmemberId);
      await methodsProjectMemberDeletion.setValue("id", projectmemberId);
      await methodsActivityMemberDeletion.setValue("id", projectmemberId);
      await mutationActivityMemberDeletion.mutateAsync(
        methodsActivityMemberDeletion.getValues()
      ); //use same id input as projectMember deletion
      await mutationProjectMemberDeletion.mutateAsync(
        methodsProjectMemberDeletion.getValues()
      );
      await methodsActivityMemberDeletion.reset();
      await methodsProjectMemberDeletion.reset();
    });
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

  if (project === null || project === undefined) {
    return <p>Error finding project</p>;
  }
  return (
    <>
      {isMemberFound ? (
        <div className="p-8">
          <h2 className="py-2 text-2xl font-bold">Edit Project</h2>
          <form
            onSubmit={methods.handleSubmit(async (values) => {
              setFormSubmitted(true);
              await console.log(methods.getValues());
              await console.log(selectedOption);
              await handleProjectMemberDeletions();
              await Promise.all([
                mutation.mutateAsync({
                  ...values,
                  members: selectedOption
                    .map((option) => option.value)
                    .filter(
                      (value) =>
                        !defaultValues.some((option) => option.value === value)
                    ), //don't include option that were already added to project
                }),
                mutationProjecTracker.mutateAsync({
                  ...values,
                  members: selectedOption.map((option) => option.value),
                }),
              ]);
              methods.reset();
              router.push("/" + id);
            })}
            className="space-y-2"
          >
            <div className="flex">
              <div>
                <Label htmlFor="name">Icon</Label>
                <div className="flex items-center">
                  {project.icon ? (
                    <Input
                      {...methods.register("icon")}
                      className="mr-4"
                      defaultValue={project.icon}
                    />
                  ) : (
                    <Input {...methods.register("icon")} className="mr-4" />
                  )}
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
                  {project.colour ? (
                    <Input
                      type="color"
                      {...methods.register("colour")}
                      className="mr-4 w-20"
                      defaultValue={project.colour}
                    />
                  ) : (
                    <Input
                      {...methods.register("colour")}
                      className="mr-4 w-20"
                      value="#FFFFFF"
                    />
                  )}
                  <InfoIcon content="Hex code for a colour." />
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
              defaultValue={project.name}
            />

            <TextAreaSection
              label="Description"
              methods={methods}
              infoContent="A brief summary describing the initiative"
              methodsField="description"
              placeHolder=""
              defaultValue={project.description ?? ""}
            />

            <div className="grid w-full max-w-md items-center gap-1.5">
              <Label htmlFor="name">Goal</Label>
              <div className="flex items-center">
                {project.goal ? (
                  <Textarea
                    {...methods.register("goal")}
                    className="mr-4"
                    defaultValue={project.goal}
                  />
                ) : (
                  <Textarea {...methods.register("goal")} className="mr-4" />
                )}
                <InfoIcon content="Remember SMART - Specific, Measurable, Achievable, Relevant, and Time-Bound." />
              </div>
              {methods.formState.errors.goal?.message && (
                <p className="text-red-700">
                  {methods.formState.errors.goal?.message}
                </p>
              )}
            </div>

            <TextAreaSection
              label="Goal"
              methods={methods}
              infoContent="Remember SMART - Specific, Measurable, Achievable, Relevant, and Time-Bound."
              methodsField="goal"
              placeHolder=""
              defaultValue={project.goal}
            />

            <TextAreaSection
              label="Expected Outcomes"
              methods={methods}
              infoContent="Which outcomes do you expect from completing this project (if separate to your goal)?"
              methodsField="expectedMovement"
              placeHolder="Optional"
              defaultValue={project.expectedMovement ?? ""}
            />

            <InputSection
              label="Estimated Start Date"
              methods={methods}
              infoContent="The date that is estimated for the project to start being worked on"
              methodsField="estimatedStart"
              placeHolder=""
              type="date"
              defaultValue={project.estimatedStart.toISOString().slice(0, 10)}
            />

            <InputSection
              label="Estimated End Date"
              methods={methods}
              infoContent="The date that is estimated for the project to be completed"
              methodsField="estimatedEnd"
              placeHolder=""
              type="date"
              defaultValue={
                project.estimatedEnd
                  ? project.estimatedEnd.toISOString().slice(0, 10)
                  : ""
              }
            />

            <TextAreaSection
              label="Trigger"
              methods={methods}
              infoContent="What was the trigger to kick start this initiative - add information on the back story, context, any due diligence etc"
              methodsField="trigger"
              placeHolder="Optional"
              defaultValue={project.trigger ?? ""}
            />

            <TextAreaSection
              label="Alternative Options or Solutions Considered"
              methods={methods}
              infoContent=""
              methodsField="alternativeOptions"
              placeHolder="Optional"
              defaultValue={project.alternativeOptions ?? ""}
            />

            <TextAreaSection
              label="Estimated Risks/Concerns/Bottleknecks"
              methods={methods}
              infoContent=""
              methodsField="estimatedRisk"
              placeHolder="Optional"
              defaultValue={project.estimatedRisk ?? ""}
            />

            <div className="grid w-full max-w-md items-center gap-1.5">
              <Label htmlFor="name">Project members</Label>
              <div className="flex items-center">
                <Select
                  options={options}
                  className="mr-4 w-full"
                  isMulti
                  defaultValue={defaultValues}
                  value={selectedOption}
                  closeMenuOnSelect={false}
                  onChange={(newValue) => handleChange(newValue as Option[])}
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
              infoContent=""
              methodsField="stakeholders"
              placeHolder="Optional"
              defaultValue={project.stakeholders ?? ""}
            />

            <InputSection
              label="Link to Project Initiation Document"
              methods={methods}
              infoContent=""
              methodsField="pid"
              placeHolder="Optional"
              type=""
              defaultValue={project.pid ?? ""}
            />

            <Button
              type="submit"
              variant={"default"}
              disabled={mutation.isLoading}
            >
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
