import { useRouter } from "next/router";
import { useZodForm } from "~/hooks/useZodForm";
import { ReadStakeholderResponseSchema } from "~/schemas/stakeholderResponse";
import { api } from "~/utils/api";



export function useStakeholderResponseDeletion(id:string) {
    const router = useRouter();
    
    const mutationStakeholderResponse = api.stakeholderResponse.delete.useMutation();
  
    const methodsStakeholderResponse = useZodForm({
        schema: ReadStakeholderResponseSchema,
        defaultValues: {
          id: id,
        },
      });

      const queryProjectByStakeholderRsponse =
      api.projects.findByStakeholderResponseId.useQuery(
        { id: id },
        {
          suspense: true,
        }
      );
  
    const projectByStakeholderResponse = queryProjectByStakeholderRsponse.data;
    
  
    const stakeholderResponseHandleDelete = async () => {
      await Promise.all([
        await mutationStakeholderResponse.mutateAsync( methodsStakeholderResponse.getValues()),
      ]);
      router.push("/projectCompletion/" + projectByStakeholderResponse?.id);
    };
  
    return { stakeholderResponseHandleDelete };
  }