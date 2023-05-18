import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "src/components/ui/dialog";
import { Button } from "./Button";


export function DeletionDialog(props: { object: string; id: string, handleDelete: () => void  }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDeleteClick = async () => {
    await props.handleDelete();
    setIsOpen(false);
  };

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
            This action cannot be undone. This will permanently delete your{" "}
            {props.object} from our database.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit" className="bg-red-600" onClick={handleDeleteClick}>
            Delete
          </Button>
          <Button variant={"outline"} onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
