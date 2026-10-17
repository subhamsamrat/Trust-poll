import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loginApi } from '../api/auth.api.ts'
import { toast } from '@heroui/react'
import { useNavigate } from '@tanstack/react-router'


export function useLoginUser() {
  
 const queryClient = useQueryClient();
const navigate = useNavigate()  
  return useMutation({
    mutationFn: loginApi,
    onSuccess: (res) => {
      console.log('login response=', res)

      toast.success(res.message ? res.message : 'Login Success')
     const user = { user: res.data.user, accessToken: res.data.accessToken }
        queryClient.setQueryData(
        ['currentUser'],
        user
      )
     
      navigate({
        to: '/dashboard',
      })
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || err.message || 'Something went wrong'
      toast.danger(errorMessage)
    },
  })
}
