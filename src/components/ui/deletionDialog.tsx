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
import { ReadActivitySchema } from "~/schemas/activities";
import { api } from "~/utils/api";
import { Button } from "./Button";
import { useState } from "react";



export function DeletionDialog(props: { object: string, id:string }) {
    const router = useRouter();
    const utils = api.useContext().projects;
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

    const utilsActivities = api.useContext().activities;
    const mutationActivities = api.activities.delete.useMutation({
        onSuccess: async () => {
          await utils.read.invalidate();
        },
      });

      const methodsActivities = useZodForm({
        schema: ReadActivitySchema,
        defaultValues: {
          projectId: props.id,
        },
      });

      const [isOpen, setIsOpen] = useState(false);

    
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
              This action cannot be undone. This will permanently delete your project from our database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="submit" className="bg-red-600"
            onClick=
            {methods.handleSubmit(async (values) => {
                await Promise.all ([
                    mutationActivities.mutateAsync(methodsActivities.getValues()),
                    mutation.mutateAsync(values),
                ]);
                methods.reset();
                router.push('/');
              })}
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
  