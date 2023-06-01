import { useRouter } from "next/router";
import { useZodForm } from "~/hooks/useZodForm";
import { ReadActivitySchema } from "~/schemas/activities";
import { ActivityChangeSchema } from "~/schemas/activityTracker";
import { ProjectChangeSchema } from "~/schemas/projectTracker";
import { DeleteProjectSchema } from "~/schemas/projects";
import { api } from "~/utils/api";

export function useProjectDeletion(id: string) {
  const utils = api.useContext().projects;

  //project
  const { mutate: projectDelete } = api.projects.softDelete.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  return { projectDelete };
}
