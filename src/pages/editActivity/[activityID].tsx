import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/TextArea";
import { Label } from "@radix-ui/react-label";
import { useZodForm } from "~/hooks/useZodForm";
import { EditActivitySchema } from "~/schemas/activities";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { InfoIcon } from "~/components/ui/infoIcon";
import Select, { MultiValue } from 'react-select';
import { FindActivityMemberSchema } from "~/schemas/activityMember";

export default function Project() {
  const router = useRouter();
  const id = router.query.activityID as string;
  const utils = api.useContext().activities;

   const query = api.projects.findByActivityId.useQuery({id:id}, {
    suspense: true,
  });
  const project = query.data;

  const { data: activity } = api.activities.readSpecific.useQuery({id: id}, {
    suspense: true,
  });

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


   /****  For Data lineage *******/

   const mutationActivityTracker = api.activityTracker.edit.useMutation({
    onSuccess: async () => {
      //TBC
    },
  });

  /****   *******/

  // *** get users for later searching ***//
  const queryUsers = api.users.read.useQuery(undefined, {
    suspense: true,
    onError: (error) => {
      console.error(error);
    },
  });

  const users = queryUsers.data;

// ****** get project members for dropdown selection **********
const queryProjectmembers = api.projectmember.read.useQuery({id: project?.id!}, { 
  suspense: true,
  onError: (error) => {
    console.error(error);
  },
});

const projectMembers = queryProjectmembers.data;

const options: Option[] = projectMembers?.map((projectMember) => ({
  value: projectMember.id,
  label: users?.find((item) => item.id === projectMember.userId)?.name ?? "Error loading user"
})) ?? [];

type Option = { label: string, value: string }

const [selectedOption, setSelectedOption] = useState<Option[]>([]);
const [defaultValues, setDefaultValues] = useState<Option[]>([]);


//turn current activity memebers to type Option, then add to selectedOption/dropdown
useEffect(() => {
  // find all options where value is in project.members array and set to default values
  const defaultValues = activity?.members
  .filter((member) => options?.some((option) => option.value === member.projectMemberId))
  .map((member) => {
    const option = options?.find((option) => option.value === member.projectMemberId);
    return { label: option?.label!, value: option?.value!};
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
  setSelectedOption(options); 
};


 //activity memeber deletion setup
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

const handleActivityMemberDeletions = () => {
  //get difference between default values we started with and the new selected options (if we have removed someone from the seleciton)
  const membersToDelete = defaultValues.filter((element) => !selectedOption.includes(element));
  
  membersToDelete.forEach( async (element) => {
    const projectmemberId = project?.members.find((member) => member.userId === element.value)?.id as string
    await console.log(projectmemberId);
    await methodsActivityMemberDeletion.setValue("id",projectmemberId);
    await mutationActivityMemberDeletion.mutateAsync(methodsActivityMemberDeletion.getValues()); //use same id input as projectMember deletion
     await methodsActivityMemberDeletion.reset();
  });
  
};

 //setup for stakeholder dropdown
 const stakeholderOptions = project?.stakeholders?.split(',').map((stakeholder) => ({
  value: stakeholder,
  label: stakeholder,
}));

const [stakeholderSelectedOptions, setStakeholderSelectedOptions] = useState<Option[]>([]);
const [defaultValueStakeholder, setDefaultValueStakeholder] = useState<Option[]>([]);

useEffect(() => {
  // find all options where value is in project.stakeholder field and set to default values
    const defaultValueStakeholder = stakeholderOptions?.
    filter((option) => activity?.stakeholders?.includes(option.value))
    .map((option) => ({ label: option.label!, value: option.value! }));

    if (defaultValueStakeholder && defaultValueStakeholder.length > 0) {
      setDefaultValueStakeholder(defaultValueStakeholder);
    }

    if (defaultValueStakeholder && defaultValueStakeholder.length > 0) {
      setStakeholderSelectedOptions(defaultValueStakeholder);
  }
  
  }, []);



  const handleChangeStakeholder = (options:  Option[]) => {
    console.log(options);
    setStakeholderSelectedOptions(options); //not sure why there is an error here as it still works?
  };

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

  if (activity === null || activity === undefined ) {
    return <p>Error finding Activity</p>
  }

  if (project === null || project === undefined ) {
    return <p>Error finding Activity</p>
  }

  return (
    <>
    {isMemberFound ? (
    <div className="p-8">
      <h2 className="mb-5 text-3xl font-bold">Project: {project.name}</h2>

      <h2 className="mt-7 text-xl font-bold">Edit Activity</h2>
      <form
        onSubmit={methods.handleSubmit(async (values) => {
          setFormSubmitted(true);
          await handleActivityMemberDeletions();
          await Promise.all ([
            mutation.mutateAsync({
              ...values,
              members: selectedOption.map((option) => option.value)
              .filter((value) => !defaultValues.some((option) => option.value === value)), //don't include option that were already added to activity
              stakeholders: stakeholderSelectedOptions.map((option) => option.value).join(','),
 
            }),
            mutationActivityTracker.mutateAsync({
              ...values,
              id: methods.getValues("id"), // update id feild with the created activity's id
              members: selectedOption.map((option) => option.value),
              stakeholders: stakeholderSelectedOptions.map((option) => option.value).join(','),

            })
          ])
          methods.reset();
          router.push('/' + project?.id);
        })}
        className="space-y-2"
      >
        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Name</Label>
          <div className="flex items-center">
            {activity.name? 
             <Input {...methods.register("name")} className="mr-4" defaultValue={activity.name}/>
              :
              <Input {...methods.register("name")} className="mr-4"/>
             }
             <InfoIcon content="Name test tooltip"/>
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
            {activity.description? 
              <Textarea {...methods.register("description")} className="mr-4" defaultValue={activity.description}/>
              :
              <Textarea {...methods.register("description")} className="mr-4"/>
            }
            <InfoIcon content="Description test tooltip"/>
          </div>
          {methods.formState.errors.description?.message && (
            <p className="text-red-700">
              {methods.formState.errors.description?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Engagement Pattern</Label>
          <div className="flex items-center">
            {activity.engagementPattern?
            <Textarea {...methods.register("engagementPattern")} className="mr-4"
            defaultValue={activity.engagementPattern}/>
            :
            <Textarea {...methods.register("engagementPattern")} className="mr-4"/>
            }
            <InfoIcon content="Brief summary on how engaging were your stakeholders - where they proactive, reactive, passive etc."/>
          </div>
          {methods.formState.errors.engagementPattern?.message && (
            <p className="text-red-700">
              {methods.formState.errors.engagementPattern?.message}
            </p>
          )}
        </div>
        
        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Value Created (Outcome)</Label>
          <div className="flex items-center">
            {activity.valueCreated?
            <Textarea {...methods.register("valueCreated")} className="mr-4"
            defaultValue={activity.valueCreated}/>
            :
            <Textarea {...methods.register("valueCreated")} className="mr-4"/>
            }
            <InfoIcon content="Brief summary on the consequence/outcome that was achieved by carrying out this initiaitve."/>
          </div>
          {methods.formState.errors.valueCreated?.message && (
            <p className="text-red-700">
              {methods.formState.errors.valueCreated?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Start Date</Label>
          <div className="flex items-center">
            {activity.startDate? 
              <Input {...methods.register("startDate")} type="date" className="mr-4"
              defaultValue={activity.startDate.toISOString().slice(0, 10)}/>
              :
              <Input {...methods.register("startDate")} type="date" className="mr-4"/>
            }
            <InfoIcon content="Date that the activity was started."/>
          </div>
          {methods.formState.errors.startDate?.message && (
            <p className="text-red-700">
              {methods.formState.errors.startDate?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5 pr-8">
          <Label htmlFor="name">End Date</Label>
          <div className="flex items-center">
            {activity.endDate? 
            <Input {...methods.register("endDate")} type="date"
            defaultValue={activity.endDate.toISOString().slice(0, 10)}/>
            :
            <Input {...methods.register("endDate")} type="date"/>
            } 
            <InfoIcon content="Date that the activity ended."/>
          </div>
          {methods.formState.errors.endDate?.message && (
            <p className="text-red-700">
              {methods.formState.errors.endDate?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Outcome Score (1-10) </Label>
          <div className="flex items-center">
            {activity.outcomeScore? 
              <Input {...methods.register("outcomeScore")} className="mr-4"  defaultValue={activity.outcomeScore}/>
              :
              <Input {...methods.register("outcomeScore")} className="mr-4"/>
            }
            <InfoIcon content="If you had to rate the outcome that was achieved by this initiative, in the range of 1-10"/>
          </div>
            {methods.formState.errors.outcomeScore?.message && (
            <p className="text-red-700">
              {methods.formState.errors.outcomeScore?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Effort Score (1-10) </Label>
          <div className="flex items-center">
            {activity.effortScore? 
            <Input {...methods.register("effortScore")} className="mr-4" defaultValue={activity.effortScore}/>
            :
            <Input {...methods.register("effortScore")} className="mr-4"/>
            }
            <InfoIcon content="If you had to rate the effort you had to put in to deliver this initiatve,in the range of 1-10"/>
          </div>
            {methods.formState.errors.effortScore?.message && (
            <p className="text-red-700">
              {methods.formState.errors.effortScore?.message}
            </p>
          )}
        </div>

          <div className="grid w-full max-w-md items-center gap-1.5">
            <Label htmlFor="name">External Stakeholders Involved</Label>
            <div className="flex items-center">
              <Select options={stakeholderOptions}
                className="mr-4 w-full"
                isMulti = {true}
                defaultValue={defaultValueStakeholder}
                value={stakeholderSelectedOptions}
                closeMenuOnSelect={false}
                onChange={(newValue) => handleChangeStakeholder(newValue as Option[])}
              />
              <InfoIcon content="Innovation Team Members that also contributed. Only shows members who have an account on Measuring Value." />
            </div>
          </div>

          <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="name">Hours taken to complete  </Label>
          <div className="flex items-center">
            {activity.hours?
              <Input {...methods.register("hours")} className="mr-4" defaultValue={activity.hours}/>
              :
              <Input {...methods.register("hours")} className="mr-4" />
            }
            <InfoIcon content="How many hours has it taken to complete this activity?"/>
          </div>
            {methods.formState.errors.effortScore?.message && (
            <p className="text-red-700">
              {methods.formState.errors.effortScore?.message}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-1.5">
            <Label htmlFor="name">Activity members</Label>
            <div className="flex items-center">
              <Select options={options}
                className="mr-4 w-full"
                isMulti = {true}
                defaultValue={defaultValues}
                value={selectedOption}
                closeMenuOnSelect={false}
                onChange={(newValue) => handleChange(newValue as Option[])}
              />
              <InfoIcon content="Innovation Team Members that also contributed. Only shows members who have an account on Measuring Value." />
            </div>
          </div>

        <Button type="submit" variant={"default"} disabled={mutation.isLoading}>
          {mutation.isLoading ? "Loading" : "Save Changes"}
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
