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
import emailjs from '@emailjs/browser';
import { Project, Activity, ActivityMember, ProjectMember } from "@prisma/client";
import { User } from "next-auth";
import { FieldValues } from "react-hook-form";
import { activityStatesAtom } from "~/pages/monthlyReport";
import { useAtom } from "jotai";


interface EmailProps<T extends FieldValues> {
  // children:React.ReactNode;
  projectsWithActivitiesInRange: {
    project: Project & {
        Activity: (Activity & {
            members: ActivityMember[];
        })[];
        members: (ProjectMember & {
            user: User;
        })[];
    };
    activitiesInRange: {
        activity: Activity & {
            members: ActivityMember[];
        };
        projectMembers: (ProjectMember & {
            user: User;
            ActivityMember: ActivityMember[];
        })[];
    }[];
}[];
projectsInDateRange: (Project & {
  Activity: Activity[];
  members: (ProjectMember & {
      user: User;
  })[];
})[];
}

export function EmailConfirmation <T extends FieldValues>(
  props: EmailProps<T>
  ) {
  
  const [activitiyStates, setArrayAtom1] = useAtom(activityStatesAtom);
  const [isOpen, setIsOpen] = useState(false);

  const handleSendClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    await sendEmail(e);
    setIsOpen(false);
  };
  
  const currentUser = api.users.currentUser.useQuery(undefined,{
    // suspense:true,
  }).data;

  const email = currentUser?.workEmail?.includes("@") ? currentUser.workEmail : currentUser?.email?? "";

  const sessionData = useSession().data;

  const activitiesForEmail = props.projectsWithActivitiesInRange.map((project, projectIndex) => {
    if (activitiyStates.length > 0) {
    let allActivitiesHidden = true;
    project.activitiesInRange.forEach((element, activityIndex) => {
      if (activitiyStates[projectIndex]![activityIndex] === false) {
        allActivitiesHidden = false;
      }
    })
    const activities = project.activitiesInRange.filter((activity, activityIndex) => !activitiyStates[projectIndex]![activityIndex])
    .map(activity => `
      <div style="display: flex; align-items: center; margin-bottom: 0px; padding-bottom: 0px; margin-left: 20px;">
        <p style="margin-right: 5px;">${project.project.icon}</p>
        <p style="margin-right: 5px;"><b>${activity.activity.name}</b></p>
        <p className="ml-1">
        ${activity.activity.endDate ? (
          "- Completed: " +
        activity.activity.endDate?.toDateString()
        ): (
          " - Ongoing (not yet completed)"
        )}
        </p>
      </div>
      <ul style="margin-top: 0px; padding-top: 0px;">
        <li>Contributors: ${activity.projectMembers?.map(pm => pm.user.name).join(", ")}</li>
        <li>Stakeholders: ${activity.activity.stakeholders === "" ? "N/A" : activity.activity.stakeholders }</li>
        <li>Description: ${activity.activity.description}</li>
        <li>Value Statement: ${activity.activity.valueCreated}</li>
        <li style="white-space: pre-wrap;">Additional Comments: ${activity.activity.reportComments ? activity.activity.reportComments.replace(/\n/g, '<br>') : ""}</li>
      </ul>
    `).join('');
  
    return `
      <div style="margin-bottom: 30px;">
        <p style="font-size: 15px; margin-bottom: 0px; ${allActivitiesHidden? "display: none;" : ""}"><b>${project.project.name}</b></p>
        ${activities}
      </div>
    `;
  }}).join('\n');

  const projectsForEmail = props.projectsInDateRange.map(project => {
    return `
      <div style="margin-bottom: 30px;">
        <div style="font-size: 15px; display: flex; align-items: center; margin-bottom: 0px; padding-bottom: 0px;">
          <p style="margin-right: 5px;">${project.icon}</p>
          <p style="margin-right: 5px;"><b>${project.name}</b></p>
          <p className="ml-1">
          ${" "}
          - Completed:${" "}
          ${project.actualEnd?.toDateString()}
          </p>
        </div>

        <ul style="margin-top: 0px; padding-top: 0px;">
          <li>Contributors: ${project.members.map(pm => pm.user.name).join(", ")}</li>
          <li>Stakeholders: ${project.stakeholders}</li>
          <li>Retrospective: ${project.retrospective}</li>
          <li>Lessons Learnt: ${project.lessonsLearnt}</li>
        </ul>

      </div>
    `;
  }).join('\n');

 //used for loading state of button 
 const [emailSending,setEmailSending] = useState(false);

const sendEmail = (e: { preventDefault: () => void; }) => {
  e.preventDefault();
  setEmailSending(true);

  emailjs.send('service_0yn0tdg', 'template_i1cq8tc', 
  {
    user_name: sessionData?.user.name,
    user_email: currentUser?.workEmail?.includes("@") ? currentUser.workEmail : currentUser?.email?? "" ,
    activitiesCompleted: activitiesForEmail,
    projectsCompleted: projectsForEmail,
  },
   'ZyIRYHSvCLfZ4nSsl')
    .then((result) => {
        alert("Email was sent!")
        setEmailSending(false);
    }, (error) => {
        console.log(error.text);
        alert("Error:" + error.text);
        setEmailSending(false);
    });
};

  return (
    <Dialog open={isOpen}>
      <DialogTrigger>
        <Button variant={"default"} className="bg-green-600 mt-4" onClick={() => setIsOpen(true)} disabled={emailSending}>
        <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"></path>
          <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"></path>
        </svg>
        {emailSending ? "Sending Email..." : " Send Email"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Email?</DialogTitle>
          <DialogDescription>
            An email will be sent to richmond.johnston@worksafe.govt.nz using the exact infomation provided on this page, in the same format.
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
