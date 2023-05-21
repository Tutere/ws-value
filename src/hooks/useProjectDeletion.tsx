import { useRouter } from "next/router";
import { useZodForm } from "~/hooks/useZodForm";
import { ReadActivitySchema } from "~/schemas/activities";
import { ActivityChangeSchema } from "~/schemas/activityTracker";
import { ProjectChangeSchema } from "~/schemas/projectTracker";
import { DeleteProjectSchema } from "~/schemas/projects";
import { api } from "~/utils/api";



export function useProjectDeletion(id:string) {
    const router = useRouter();
    const utils = api.useContext().projects;

    const query = api.projects.findByActivityId.useQuery(
        { id: id },
        {
          suspense: true,
        }
      );
    
      const project = query.data;
    
    //project
    const mutation = api.projects.softDelete.useMutation({
      onSuccess: async () => {
        await utils.read.invalidate();
      },
    });
  
    const methods = useZodForm({
      schema: DeleteProjectSchema,
      defaultValues: {
        id: id,
      },
    });

    //activities for project
    const utilsActivities = api.useContext().activities;
    const mutationActivities = api.activities.softDelete.useMutation({
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


      //data lineage handling for project
  const mutationProjecTracker = api.projectTracker.edit.useMutation({});

  const queryProjectById = api.projects.findByProjectId.useQuery(
    { id: id },
    {
      suspense: true,
    }
  );

  const project2 = queryProjectById.data;

  const methodProjectTracker = useZodForm({
    schema: ProjectChangeSchema,
    defaultValues: {
      changeType: "Delete",
      projectId: project2?.id.toString(),
      icon: project2?.icon?.toString(),
      name: project2?.name?.toString(),
      description: project2?.description?.toString(),
      goal: project2?.goal?.toString(),
      estimatedStart: project2?.estimatedStart?.toISOString(),
      estimatedEnd: project2?.estimatedEnd?.toISOString() || "",
      trigger: project2?.trigger?.toString(),
      expectedMovement: project2?.expectedMovement?.toString(),
      alternativeOptions: project2?.alternativeOptions?.toString(),
      estimatedRisk: project2?.estimatedRisk?.toString(),
      outcomeScore: project2?.outcomeScore || 1,
      effortScore: project2?.effortScore || 1,
      actualStart:
        project2?.actualStart?.toISOString() ||
        project2?.estimatedStart?.toISOString(),
      actualEnd: project?.actualEnd?.toISOString() || "",
      lessonsLearnt: project2?.lessonsLearnt! || "",
      retrospective: project2?.retrospective! || "",
      status: project2?.status!,
      colour: project2?.colour!,
      members: project2?.members?.map((member) => member.userId),
      stakeholders: project2?.stakeholders!,
      pid: project2?.pid ?? "",
    },
  });

  //lineage for all activities if whole project deleted

  const { data: activities } = api.activities.read.useQuery(
    { projectId: id },
    {
      suspense: true,
    }
  );

    
  const queryActivityById = api.activities.readSpecific.useQuery(
    { id: id },
    {
      suspense: true,
    }
  );

  const mutationActivityracker = api.activityTracker.edit.useMutation();

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

  const deleteAllActivitesTracking = async () => {
    activities?.map((activity) => {
      methodActivityTracker.setValue("id", activity.id);
      methodActivityTracker.setValue("projectId", activity.projectId);
      methodActivityTracker.setValue("name", activity.name);
      methodActivityTracker.setValue("description", activity.description);
      methodActivityTracker.setValue(
        "engagementPattern",
        activity.engagementPattern ?? ""
      );
      methodActivityTracker.setValue(
        "valueCreated",
        activity.valueCreated?.toString()
      );
      methodActivityTracker.setValue(
        "startDate",
        activity.startDate?.toISOString()!
      );
      methodActivityTracker.setValue(
        "endDate",
        activity?.endDate?.toISOString() || ""
      );
      methodActivityTracker.setValue("outcomeScore", activity.outcomeScore);
      methodActivityTracker.setValue("effortScore", activity.effortScore);
      methodActivityTracker.setValue("status", activity.status);
      methodActivityTracker.setValue("hours", activity.hours);
      methodActivityTracker.setValue("stakeholders", activity.stakeholders!);
      methodActivityTracker.setValue("members",activity.members?.map((member) => member.projectMemberId));
      methodActivityTracker.setValue("reportComments", activity.reportComments?? "");

      mutationActivityracker.mutateAsync(methodActivityTracker.getValues());
    });
  };
  
    const projectHandleDelete = async () => {
      await deleteAllActivitesTracking();
      await Promise.all([
        await mutationActivities.mutateAsync(methodsActivities.getValues()),
        await mutationProjecTracker.mutateAsync(methodProjectTracker.getValues()),
        await mutation.mutateAsync(methods.getValues()),

      ]);
      router.push("/");
    };
  
    return { projectHandleDelete };
  }