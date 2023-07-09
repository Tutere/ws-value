import { useRouter } from "next/router";
import { useZodForm } from "~/hooks/useZodForm";
import { ReadActivitySchema, ReadSpecificActivitySchema } from "~/schemas/activities";
import { ActivityChangeSchema } from "~/schemas/activityTracker";
import { api } from "~/utils/api";



export function useActivityDeletion(id:string) {
  const utils = api.useContext().activities;

  const router = useRouter();

  //to avoid pulling all project data through to client side
  const {data: projectId} = api.projects.GetProjectIdByActivityId.useQuery({ id: id },{
      suspense: true,
    }
  );
    
  const { mutate: ActivityhandleDelete } = api.activities.softDeleteByActivityId.useMutation({
    onSuccess: async () => {
      await utils.read.invalidate();
      router.push("/" + projectId);
    },
  });

  return { ActivityhandleDelete };
  
    // const ActivityhandleDelete = async () => {
    //     await Promise.all([
    //         await mutationSpecificActivy.mutateAsync(
    //           methodSpecificActivity.getValues()
    //         ),
    //       ]);
    //       router.push("/" + project?.id);
    // };
  
    // return { ActivityhandleDelete };
  }