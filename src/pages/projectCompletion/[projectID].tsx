import { Label } from "@radix-ui/react-label";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "src/components/ui/Button";
import { TextAreaSection } from "~/components/ui/TextAreaSection";
import { InfoIcon } from "~/components/ui/infoIcon";
import { InputSection } from "~/components/ui/inputSection";
import DiscreteSlider from "~/components/ui/slider";
import { useCurrentDate } from "~/hooks/useCurrentDate";
import { useZodForm } from "~/hooks/useZodForm";
import { EditProjectSchema } from "~/schemas/projects";
import { api } from "~/utils/api";

export default function ProjectCompletion() {
  const router = useRouter();
  const id = router.query.projectID as string;
  const utils = api.useContext().projects;
  const {data: project, isLoading} = api.projects.FindByProjectId.useQuery(
    { id: id },
    {
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          router.push("/");
        }
      },
    }
  );

  const mutation = api.projects.complete.useMutation({
    onSuccess: async () => {
      await utils.read.invalidate();
    },
  });

  const methods = useZodForm({
    schema: EditProjectSchema, //using this schema because it has all fields for project tracking
    defaultValues: {
      status: "Complete",
      changeType: "Complete",
      id: project?.id.toString(),
      projectId: project?.id.toString(),
      colour: project?.colour!,
      icon: project?.icon?.toString(),
      name: project?.name?.toString(),
      description: project?.description?.toString(),
      goal: project?.goal?.toString(),
      estimatedStart: project?.estimatedStart?.toISOString(),
      estimatedEnd: project?.estimatedEnd?.toISOString() ?? "",
      trigger: project?.trigger?.toString(),
      expectedMovement: project?.expectedMovement?.toString(),
      alternativeOptions: project?.alternativeOptions?.toString(),
      estimatedRisk: project?.estimatedRisk?.toString(),
      stakeholders: project?.stakeholders! || "",
      members: project?.members.map(member => member.userId),
    },
  });

  const { data: sessionData } = useSession();
  const isMemberFound = project?.members.some(member => {
    if (member.userId === sessionData?.user.id) {
      return true;
    } else if (sessionData?.user.id === 'clh8vfdfq0000mj085tgdm0or') {
      return true;
    } else{
      return false;
    }
  });

  //read in stakeholder survey responses
  const querySurveyResponses = api.stakeholderResponse.read.useQuery({ id: id }, {
    suspense: true,
  });

  const stakeholderResponses = querySurveyResponses.data;

  useEffect(() => {
    if (!isMemberFound) {
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  }, [isMemberFound, router]);


  //handling the exiting of a page (pop up confirmation)
  const [formSubmitted, setFormSubmitted] = useState(false);
  useEffect(() => {
    const warningText = 'You may have unsaved changes - are you sure you wish to leave this page?';

    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (formSubmitted) return;
      e.preventDefault();
      return (e.returnValue = warningText);
    };

    const handleBrowseAway = () => {
      if (formSubmitted) return;
      if (window.confirm(warningText)) return;
      router.events.emit('routeChangeError');
      throw 'routeChange aborted.';
    };

    window.addEventListener('beforeunload', handleWindowClose);
    router.events.on('routeChangeStart', handleBrowseAway);

    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      router.events.off('routeChangeStart', handleBrowseAway);
    };

  }, [formSubmitted]);

  if (project === null || project === undefined) {
    return <p>Error finding project</p>
  }
  return (
    <>
      {isMemberFound ? (
        <div className="p-8 ">

          <Link href={"/" + project?.id}>
            <Button className="mb-5" variant={"withIcon"}>
              <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path clipRule="evenodd" fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"></path>
              </svg>
              {"Back to project"}
            </Button>
          </Link>

          <h2 className="mt-5 mb-5 text-2xl font-bold">Project Completion Page</h2>
          <div className="flex flex-row mb-5">
            <Label className="font-medium">Project Name:</Label>
            <p className="ml-1">{project.name}</p>
          </div>
          <form
            onSubmit={methods.handleSubmit(async (values) => {
              setFormSubmitted(true);
              await Promise.all([
                mutation.mutateAsync(values),
              ])
              methods.reset();
              router.push('/');
            })}
            className="space-y-2"
          >

            <TextAreaSection
              label="Retrospective/Overall Summary"
              methods={methods}
              infoContent="If you had to do this or a similar initiative, what would you have done it differently. Brief summary"
              methodsField="retrospective"
              placeHolder=""
              defaultValue={project.retrospective ?? ""}
              required={true}
            />

            <TextAreaSection
              label="Lessons Learnt"
              methods={methods}
              infoContent="The knowledge gained from the process of conducting this activity that could be useful in the future iterations or similar work"
              methodsField="lessonsLearnt"
              placeHolder=""
              defaultValue={project.lessonsLearnt ?? ""}
              required={true}
            />

            <InputSection
              label="Actual Start Date"
              methods={methods}
              infoContent="The date that the project started being worked on. Will default to the estimated start date provided during project setup"
              methodsField="actualStart"
              placeHolder=""
              type="date"
              defaultValue={project.actualStart?.toISOString().slice(0, 10) ?? useCurrentDate()}
              required={true}
            />

            <InputSection
              label="Actual End Date"
              methods={methods}
              infoContent="The date that the project was completed. Will default to the estimated end date provided during project setup"
              methodsField="actualEnd"
              placeHolder=""
              type="date"
              defaultValue={project.actualEnd?.toISOString().slice(0, 10) ?? project.estimatedEnd?.toISOString().slice(0, 10) ?? ""}
              required={true}
            />


            <DiscreteSlider
              defaultValue={project.effortScore??1}
              methods={methods}
              methodsField="effortScore"
              label="Effort Score"
              infoContent="If you had to rate the effort you had to put in to deliver this initiatve,in the range of 1-10"
              renderType={"effort"}
              required={true}
            />
            <DiscreteSlider
              defaultValue={project.outcomeScore??1}
              methods={methods}
              methodsField="outcomeScore"
              label="Outcome Score"
              infoContent="If you had to rate the outcome that was achieved by this initiative, in the range of 1-10"
              renderType={"outcome"}
              required={true}
            />



            {project.status === "Complete" ? (
              <Button type="submit" variant={"default"} disabled={mutation.isLoading}>
                <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z"></path>
                  <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z"></path>
                </svg>
                {mutation.isLoading ? "Loading" : "Edit Completion Details"}
              </Button>
            ) : (
              <>
                <Button type="submit" variant={"withIcon"} disabled={mutation.isLoading} className="text-green-600">
                  <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"></path>
                  </svg>
                  {mutation.isLoading ? "Loading" : "Complete Project"}
                </Button>
              </>
            )
            }

          </form>

          <div className="mt-10 grid w-full max-w-md items-center gap-1.5">
            <Label htmlFor="name">Stakeholder Survey Form: </Label>
            <div className="flex items-center">
              <Link className="mr-4 font-medium text-blue-600 hover:underline"
                href={"/stakeholderSurvey/" + project.id}
                rel="noopener noreferrer"
                target="_blank"
              >
                <p>Link Here</p>
              </Link>
              <InfoIcon content="This is a survey form that can be sent to external stakeholders for feedback. This link does not require a login or authentication to access." />
            </div>
          </div>

          <h2 className="mt-5 text-2xl font-bold">Stakeholder Survey Responses:</h2>
          <div className="flex flex-row flex-wrap gap-5 py-2">
            {stakeholderResponses?.length! > 0 ? (
              stakeholderResponses?.map((stakeholderResponse) => (
                <a
                  style={{
                    borderTopColor: `${project.colour}`,
                    borderTopStyle: "solid",
                    borderTopWidth: "thick",
                  }}
                  className={`top-4 basis-60 overflow-hidden rounded-lg p-4 shadow`}
                  onClick={() => setFormSubmitted(true)}> {/* wrapper to get around pop up */}
                  <Link
                    href={"/stakeholderResponse/" + stakeholderResponse.id}
                    key={stakeholderResponse.id}
                  >
                    <h3 className="text-xl font-bold">{stakeholderResponse.organisation}</h3>
                    <p>{"Benefits rating: " + stakeholderResponse.benefitsRating}</p>
                    <p>{"Experience rating: " + stakeholderResponse.experienceRating}</p>
                  </Link>
                </a>
              ))) : (
              <div> No survey responses yet </div>
            )}
          </div>

        </div>
      ) : (
        <div className="p-8">
          <p>You are not a member of this project. Redirecting to homepage...</p>
        </div>
      )
      }
    </>
  );
}