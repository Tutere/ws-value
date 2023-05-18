import { useRouter } from "next/router";
import { useZodForm } from "~/hooks/useZodForm";
import { ReadActivitySchema, ReadSpecificActivitySchema } from "~/schemas/activities";
import { ActivityChangeSchema } from "~/schemas/activityTracker";
import { api } from "~/utils/api";



export function useActivityDeletion(id:string) {
    const router = useRouter();

    const query = api.projects.findByActivityId.useQuery(
        { id: id },
        {
          suspense: true,
        }
      );
    
      const project = query.data;

   //activity handling
  const utilsActivities = api.useContext().activities;
  const mutationActivities = api.activities.delete.useMutation({
    onSuccess: async () => {
      await utilsActivities.read.invalidate();
    },
  });

  const mutationSpecificActivy = api.activities.softDeleteByActivityId.useMutation({
    onSuccess: async () => {
      await utilsActivities.read.invalidate();
    },
  });

  const methodsActivities = useZodForm({
    schema: ReadActivitySchema,
    defaultValues: {
      projectId: id,
    },
  });

  const methodSpecificActivity = useZodForm({
    schema: ReadSpecificActivitySchema,
    defaultValues: {
      id: id,
    },
  });

  //data lineage handling for activity
  const queryProjectById = api.projects.findByProjectId.useQuery(
    { id: id },
    {
      suspense: true,
    }
  );

  const project2 = queryProjectById.data;

  const mutationActivityracker = api.activityTracker.edit.useMutation();

  const queryActivityById = api.activities.readSpecific.useQuery(
    { id: id },
    {
      suspense: true,
    }
  );

  const activity = queryActivityById.data;

  const methodActivityTracker = useZodForm({
    schema: ActivityChangeSchema,
    defaultValues: {
      changeType: "Delete",
      id: activity?.id,
      projectId: activity?.projectId.toString(),
      name: activity?.name?.toString(),
      description: activity?.description?.toString(),
      engagementPattern: activity?.engagementPattern?.toString(),
      valueCreated: activity?.valueCreated?.toString(),
      startDate: activity?.startDate?.toISOString(),
      endDate: activity?.endDate?.toISOString() || "",
      outcomeScore: activity?.outcomeScore!,
      effortScore: activity?.effortScore!,
      status: activity?.status!,
      hours: activity?.hours!,
      members: activity?.members?.map((member) => member.projectMemberId),
      stakeholders: project2?.stakeholders!,
      reportComments:activity?.reportComments?? "",
    },
  });

  
    const ActivityhandleDelete = async () => {
        await Promise.all([
            await mutationActivityracker.mutateAsync(
              methodActivityTracker.getValues()
            ),
            await mutationSpecificActivy.mutateAsync(
              methodSpecificActivity.getValues()
            ),
          ]);
          router.push("/" + project?.id);
    };
  
    return { ActivityhandleDelete };
  }