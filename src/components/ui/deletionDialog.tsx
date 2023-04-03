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



export function DeletionDialog(props: { object: string, id:string }) {
    const router = useRouter();
    const utils = api.useContext().projects;
    const [isOpen, setIsOpen] = useState(false);

    //project handling
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

      

      const handleDelete = async () => {
        if (props.object === "Activity") {
          await mutationSpecificActivy.mutateAsync(methodSpecificActivity.getValues()),
          router.push('/' + project?.id); 
        } 
        /** If deleting an entire projet, must first delete all of its activites */
        else { 
          await Promise.all ([
              mutationActivities.mutateAsync(methodsActivities.getValues()),
              mutation.mutateAsync(methods.getValues()),
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
  