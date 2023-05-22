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
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";


export function EmailConfirmation(props: {emailSending: boolean | undefined, sendEmail: (e: {    preventDefault: () => void;}) => void  }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSendClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    await props.sendEmail(e);
    setIsOpen(false);
  };
  
  const currentUser = api.users.currentUser.useQuery(undefined,{
    suspense:true,
  }).data;

  const email = currentUser?.workEmail?.includes("@") ? currentUser.workEmail : currentUser?.email?? "";

//   const sessionData = useSession().data;

  return (
    <Dialog open={isOpen}>
      <DialogTrigger>
        <Button className="bg-green-600 mt-4" onClick={() => setIsOpen(true)} disabled={props.emailSending}>
        {props.emailSending ? "Sending Email..." : " Send Email"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Email?</DialogTitle>
          <DialogDescription>
            An email will be sent to $EMAIL using the exact infomation provided on this page, in the same format.
            <b> No preview will be available.</b>
            <br/> 
            <br/> 
            Your email (<b>{email}</b>) will be cc'd. If you would like to change this email address, please navigate to the Email Preferences page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit" className="bg-green-600" onClick={e => handleSendClick(e)}>
            Send Email
          </Button>
          <Button variant={"outline"} onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
