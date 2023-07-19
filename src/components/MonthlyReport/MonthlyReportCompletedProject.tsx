import { Activity, Project, ProjectMember, User } from "@prisma/client";
import Link from "next/link";
import { FieldValues } from "react-hook-form";

interface MonthlyReportCompleteProjectProps<T extends FieldValues> {
    project: Project & {
        Activity: Activity[];
        members: (ProjectMember & {
            user: User;
        })[];
    }
}

export function MonthlyReportCompleteProject<T extends FieldValues>( 
  props: MonthlyReportCompleteProjectProps<T>
  ){

  
  return (
    <>
        <div className="flex mb-5">
            {props.project.icon}
            <Link className="text-xl ml-2 font-bold hover:underline"
            href={"/" + props.project.id} 
            rel="noopener noreferrer" 
            target="_blank"
            >{props.project.name}</Link>
            <p className="ml-1"> - Completed: {props.project.actualEnd?.toDateString()} </p>
        </div>
        <div className="mb-5 ml-5 w-3/4">     
            <p className="">Contributors: {props.project.members.map(pm => pm.user.name).join(", ")} </p>
            <p className="">Stakeholders: {props.project.stakeholders} </p>
            <p className="">Retrospective: {props.project.retrospective} </p>
            <p className="mb-10">Lessons Learnt: {props.project.lessonsLearnt} </p>
        </div>
    </>
  );
}
