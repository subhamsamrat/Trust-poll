import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loginApi, signupApi } from '../api/auth.api.ts'
import { toast } from '@heroui/react'
import { useNavigate } from '@tanstack/react-router'
import { setStoredUser } from '../lib/currentUser.ts'
import { useSocket } from '#/socket/socketProvider.tsx'

//sign-up hook
export function useSignupUser() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: signupApi,
    onSuccess: (res) => {
      toast.success(res.message ? res.message : 'Registered Success')
      navigate({
        to: '/login',
      })
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || err.message || 'Something went wrong'
      toast.danger(errorMessage)
    },
  })
}

//login hook
export function useLoginUser() {
  const socketClient = useSocket()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: loginApi,
    onSuccess: (res) => {
      toast.success(res.message ? res.message : 'Login Success')
      const user = { user: res.data.user, accessToken: res.data.accessToken }
      setStoredUser(user)
      queryClient.setQueryData(['currentUser'], user)
      socketClient.connect()
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
