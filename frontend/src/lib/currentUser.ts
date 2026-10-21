import { useQuery } from "@tanstack/react-query"
import { getMeApi } from "../api/auth.api"

export interface UserAuthData {
  user: any
  accessToken: string
}

export const getStoredUser = (): UserAuthData | null => {
  if (typeof window === 'undefined') return null
  try {
    const item = localStorage.getItem('currentUser')
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error('Error reading currentUser from localStorage:', error)
    return null
  }
}

export const setStoredUser = (data: UserAuthData | null) => {
  if (typeof window === 'undefined') return
  try {
    if (data) {
      localStorage.setItem('currentUser', JSON.stringify(data))
    } else {
      localStorage.removeItem('currentUser')
    }
  } catch (error){
    console.error('Error saving currentUser to localStorage:', error)
  }
}

export const clearStoredUser = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem('currentUser')
  } catch (error) {
    console.error('Error clearing currentUser from localStorage:', error)
  }
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<UserAuthData | null> => {
      const stored = getStoredUser()
      if (!stored?.accessToken) {
        return null
      }
      try {
        const res = await getMeApi()
        if (res?.data) {
          const updated: UserAuthData = {
            ...stored,
            user: res.data,
          }
          setStoredUser(updated)
          return updated
        }
      } catch (err: any) {
        if (err?.response?.status === 401) {
          clearStoredUser()
          return null
        }
      }
      return stored
    },
    initialData: () => getStoredUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: Infinity,
  })
}