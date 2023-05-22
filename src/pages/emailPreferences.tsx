import { Label } from "@radix-ui/react-label";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Select from 'react-select';
import { Button } from "src/components/ui/Button";
import { Input } from "src/components/ui/Input";
import { InfoIcon } from "src/components/ui/infoIcon";
import { TextAreaSection } from "~/components/ui/TextAreaSection";
import { InputSection } from "~/components/ui/inputSection";
import { useZodForm } from "~/hooks/useZodForm";
import { CreateProjectSchema } from "~/schemas/projects";
import { WorkEmailSchema } from "~/schemas/users";
import { api } from "~/utils/api";


export default function EmailPreferences() {
    const utils = api.useContext().users;
    const router = useRouter();
    // const session = useSession();

    const currentUser = api.users.currentUser.useQuery(undefined,{
        suspense:true,
    }).data;
    

  const mutation = api.users.updateWorkEmail.useMutation({
    onSuccess: async (data) => {
      await utils.read.invalidate();
    },
  });

  const methods = useZodForm({
    schema: WorkEmailSchema,
    defaultValues: {

    },
  });



  return (
    <>
      <div className="p-8">
        <h2 className="py-2 text-2xl font-bold">Email Preferences</h2>
        <form
          onSubmit={methods.handleSubmit(async (values) => {
            await Promise.all([
              await mutation.mutateAsync(values),
            ])
            methods.reset();
            router.reload();
          })}
          className="space-y-2"
        >

          <InputSection
          label="Preferred Email (for monthly report)"
          methods={methods}
          infoContent="This email will be cc'd when monthly reports are sent via the monthly report page"
          methodsField="email"
          placeHolder=""
          type=""
          defaultValue={currentUser?.workEmail?.includes("@") ? currentUser.workEmail : currentUser?.email?? "" }
          />

          <Button
            type="submit"
            variant={"default"}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Loading" : "Edit Default Email"}
          </Button>
        </form>
      </div>
    </>
  );
}
