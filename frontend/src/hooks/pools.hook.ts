import { visitorApi } from "#/api/dashboard.api";
import { toast } from "@heroui/react";
import { useMutation }  from "@tanstack/react-query";

export function useVisitorApi(){
    return useMutation({
        mutationFn:visitorApi,
          onError: (err: any) => {
              const errorMessage =
                err.response?.data?.message || err.message || 'Something went wrong'
              toast.danger(errorMessage)
            },
    })
}