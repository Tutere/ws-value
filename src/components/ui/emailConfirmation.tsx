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
        <Button variant={"default"} className="bg-green-600 mt-4" onClick={() => setIsOpen(true)} disabled={props.emailSending}>
        <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"></path>
          <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"></path>
        </svg>
        {props.emailSending ? "Sending Email..." : " Send Email"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Email?</DialogTitle>
          <DialogDescription>
            An email will be sent to tuteredurie@hotmail.com using the exact infomation provided on this page, in the same format.
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
