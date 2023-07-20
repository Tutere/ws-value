import { Activity, ActivityMember, Project, ProjectMember, User } from "@prisma/client";
import { useAtom } from "jotai";
import Link from "next/link";
import React, { useState } from "react";
import { FieldValues } from "react-hook-form";


interface ProjectCardProps<T extends FieldValues> {
    project: Project & {
        Activity: (Activity & {
            members: (ActivityMember & {
                members: ProjectMember & {
                    user: User;
                };
            })[];
        })[];
        members: (ProjectMember & {
            
        })[];
    }
}

export function ProjectCard<T extends FieldValues>( 
  props: ProjectCardProps<T>
  ){

  return (
    <Link
    href={"/" + props.project.id}
    key={props.project.id}
    style={{
        borderTopColor: `${props.project.colour}`,
        borderTopStyle: "solid",
        borderTopWidth: "thick",
    }}
    className={`top-4 basis-60 overflow-hidden rounded-lg p-4 shadow-lg`}
    >
        <div className="flex justify-start">
            <div className="mr-2 text-lg">{props.project.icon}</div>
            <h3 className="text-xl font-bold">{props.project.name}</h3>
        </div>

        <p className="m-1 text-sm italic line-clamp-3">
            {props.project.description}
        </p>
    </Link>
  );
}
