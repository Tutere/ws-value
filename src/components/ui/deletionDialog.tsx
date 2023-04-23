import { useRouter } from "next/router";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "src/components/ui/dialog"
import { useZodForm } from "~/hooks/useZodForm";
import { DeleteProjectSchema } from "~/schemas/projects";
import { ReadActivitySchema, ReadSpecificActivitySchema } from "~/schemas/activities";
import { api } from "~/utils/api";
import { Button } from "./Button";
import { useState } from "react";
import { ProjectChangeSchema } from "~/schemas/projectTracker";
import { ActivityChangeSchema } from "~/schemas/activityTracker";



export function DeletionDialog(props: { object: string, id:string }) {
    const router = useRouter();
    const utils = api.useContext().projects;
    const [isOpen, setIsOpen] = useState(false);

    //project handling (find project given activity ID)
    const query = api.projects.findByActivityId.useQuery({id:props.id}, {
      suspense: true,
    });
   
    const project = query.data;
    const mutation = api.projects.delete.useMutation({
        onSuccess: async () => {
          await utils.read.invalidate();
        },
      });

      const methods = useZodForm({
        schema: DeleteProjectSchema,
        defaultValues: {
          id: props.id,
        },
      });
    
      //activity handling
    const utilsActivities = api.useContext().activities;
    const mutationActivities = api.activities.delete.useMutation({
        onSuccess: async () => {
          await utilsActivities.read.invalidate();
        },
      });

      const mutationSpecificActivy = api.activities.deleteByActivityId.useMutation({
        onSuccess: async () => {
          await utilsActivities.read.invalidate();
        },
      });

      const methodsActivities = useZodForm({
        schema: ReadActivitySchema,
        defaultValues: {
          projectId: props.id,
        },
      });

      const methodSpecificActivity = useZodForm({
        schema: ReadSpecificActivitySchema,
        defaultValues: {
          id: props.id,
        },
      });

      //data lineage handling for project
      const mutationProjecTracker = api.projectTracker.edit.useMutation({
        
      });

      const queryProjectById= api.projects.findByProjectId.useQuery({id:props.id}, {
        suspense: true,
      });
     
      const project2 = queryProjectById.data;

      const methodProjectTracker= useZodForm({
        schema: ProjectChangeSchema,
        defaultValues: {
          changeType: "Delete",
          projectId: project2?.id.toString(),
          icon: project2?.icon?.toString(),
          name: project2?.name?.toString(),
          description: project2?.description?.toString(),
          goal: project2?.goal?.toString(),
          estimatedStart: project2?.estimatedStart?.toISOString(),
          estimatedEnd: project2?.estimatedEnd?.toISOString() || '',
          trigger: project2?.trigger?.toString(),
          expectedMovement: project2?.expectedMovement?.toString(),
          alternativeOptions: project2?.alternativeOptions?.toString(),
          estimatedRisk: project2?.estimatedRisk?.toString(),
          outcomeScore: project2?.outcomeScore || 1,
          effortScore: project2?.effortScore || 1,
          actualStart: project2?.actualStart?.toISOString() || project2?.estimatedStart?.toISOString(),
          actualEnd: project?.actualEnd?.toISOString() || '',
          lessonsLearnt: project2?.lessonsLearnt! || "",
          retrospective: project2?.retrospective! || "",
          status: project2?.status!,
          colour: project2?.colour!,
          members: project2?.members?.map(member => member.userId),
          stakeholders:project2?.stakeholders!,
        },
      });

      //data lineage handling for activity
      const mutationActivityracker = api.activityTracker.edit.useMutation({
        
      });

      const queryActivityById= api.activities.readSpecific.useQuery({id:props.id}, {
        suspense: true,
      });

      const activity = queryActivityById.data;

      const methodActivityTracker= useZodForm({
        schema: ActivityChangeSchema,
        defaultValues: {
          changeType: "Delete",
          id: activity?.id,
          projectId: activity?.projectId.toString(),
          name: activity?.name?.toString(),
          description: activity?.description?.toString(),
          engagementPattern: activity?.engagementPattern.toString(),
          valueCreated: activity?.valueCreated?.toString(),
          startDate: activity?.startDate?.toISOString(),
          endDate: activity?.endDate?.toISOString(),
          outcomeScore: activity?.outcomeScore!,
          effortScore: activity?.effortScore!,
          status: activity?.status!,
          hours: activity?.hours!,
          members: activity?.members?.map(member => member.projectMemberId),
          stakeholders:project2?.stakeholders!,
        },
      });

      //lineage for all activities if whole project deleted

      const { data: activities } = api.activities.read.useQuery({projectId: props.id}, {
          suspense: true,
        });

      const deleteAllActivitesTracking = async () => {

         activities?.map(activity => {
          methodActivityTracker.setValue("id" , activity.id);
          methodActivityTracker.setValue("projectId" , activity.projectId);
          methodActivityTracker.setValue("name" , activity.name);
          methodActivityTracker.setValue("description" , activity.description);
          methodActivityTracker.setValue("engagementPattern" , activity.engagementPattern);
          methodActivityTracker.setValue("valueCreated" , activity.valueCreated?.toString());
          methodActivityTracker.setValue("startDate" , activity.startDate?.toISOString()!);
          methodActivityTracker.setValue("endDate" , activity?.endDate?.toISOString()!);
          methodActivityTracker.setValue("outcomeScore" , activity.outcomeScore);
          methodActivityTracker.setValue("effortScore" , activity.effortScore);
          methodActivityTracker.setValue("status" , activity.status);
          methodActivityTracker.setValue("hours" , activity.hours);
          methodActivityTracker.setValue("stakeholders" , activity.stakeholders!);
          methodActivityTracker.setValue("members" , activity.members?.map(member => member.projectMemberId));

          mutationActivityracker.mutateAsync(methodActivityTracker.getValues())

        });
        
      }


      const handleDelete = async () => {
        if (props.object === "Activity") {
          await Promise.all ([
            await mutationActivityracker.mutateAsync(methodActivityTracker.getValues()),
            await mutationSpecificActivy.mutateAsync(methodSpecificActivity.getValues()),
          ]);
          router.push('/' + project?.id); 
        } 
        /** If deleting an entire projet, must first delete all of its activites and track those changes*/
        else { 
          await deleteAllActivitesTracking();
          await Promise.all ([
              await console.log (methodProjectTracker.getValues()),
              await mutationActivities.mutateAsync(methodsActivities.getValues()),
              await mutationProjecTracker.mutateAsync(methodProjectTracker.getValues()),
              await mutation.mutateAsync(methods.getValues()),
          ]);
          router.push('/');
        }
      }

    return (
        <Dialog open={isOpen}>
        <DialogTrigger>
            <Button className="bg-red-600" onClick={() => setIsOpen(true)}>
                Delete {props.object}
            </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your {props.object} from our database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="submit" className="bg-red-600"
            onClick={handleDelete}
            > 
            Delete</Button>
            <Button variant={"outline"}
            onClick={() => setIsOpen(false)}
            >Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    );
  }
  