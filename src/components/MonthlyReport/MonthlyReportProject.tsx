import React, { useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Activity, ActivityMember, Project, ProjectMember, User } from "@prisma/client";
import { MonthlyReportActivity } from "./MonthlyReportActivity";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";


interface MonthlyReportProjectProps<T extends FieldValues> {
  children:React.ReactNode;
  project: {
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
}
}

export function MonthlyReportProject<T extends FieldValues>( 
  props: MonthlyReportProjectProps<T>
  ){

  const [hiddenActivities, setHiddenActivities] = useState<boolean[]>( //all activities and whether they are hidden or not
    new Array(props.project.activitiesInRange.length).fill(false)
  );

  const toggleActivityHidden = (index: number) => {
    const newHiddenActivities = [...hiddenActivities];
    newHiddenActivities[index] = !newHiddenActivities[index];
    setHiddenActivities(newHiddenActivities);
  };

  const areAllActivitiesHidden = hiddenActivities.every((hidden) => hidden);
  console.log("Activities Hidden: " + areAllActivitiesHidden)

  return (
    <div className={areAllActivitiesHidden? "hidden" : ""}> 
      <Link className="text-xl mb-5 hover:underline" 
        href={"/" + props.project.project.id} 
        rel="noopener noreferrer" 
        target="_blank">
          <b>{props.project.project.name}</b>
          {props.project.project.stakeholders && <span> with <b>{props.project.project.stakeholders}</b></span>}
      </Link>
        
        
      {
        props.project.activitiesInRange.map((activity, index) => {
  
              //get activity member names for later use
              const contributorNames: (string | null)[] = [];

              //for lineage work below
              const projMemIds: string[] = []; 
          
              props.project.activitiesInRange.forEach((act: { activity: { id: any; }; projectMembers: any[]; }) => {
                if (act.activity.id === activity.activity.id) {
                  act.projectMembers?.forEach(pm => {
                    contributorNames.push(pm.user.name);
                    projMemIds.push(pm.id);
                  })
                }
              })

              return (
                <MonthlyReportActivity 
                key={index} 
                activity={activity} 
                projectIcon={props.project.project.icon} 
                contributorNames={contributorNames}
                hidden={hiddenActivities[index]} // pass the hidden state to MonthlyReportActivity
                toggleHidden={() => toggleActivityHidden(index)} // pass the toggle function to MonthlyReportActivity 
                ></MonthlyReportActivity>
              )

        })}

    </div>
  );
}
