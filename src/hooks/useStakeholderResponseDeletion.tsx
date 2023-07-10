import { useRouter } from "next/router";
import { useZodForm } from "~/hooks/useZodForm";
import { ReadStakeholderResponseSchema } from "~/schemas/stakeholderResponse";
import { api } from "~/utils/api";



export function useStakeholderResponseDeletion(id:string) {
    const router = useRouter();
    const utils = api.useContext().projects;

      const {data :projectId} =
      api.projects.findByStakeholderResponseId.useQuery({ id: id },{
          suspense: true,
        }
      );
  

    const { mutate: stakeholderResponseHandleDelete } = api.stakeholderResponse.softDelete.useMutation({
      onSuccess: async () => {
        await utils.invalidate();
        router.push("/projectCompletion/" + projectId);
      },
    });
  
    return { stakeholderResponseHandleDelete };
  }