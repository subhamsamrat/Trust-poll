import { getAllPollsApi, getPollDetailApi, updatePollApi } from "#/api/dashboard.api";
import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";

// Get All Polls Query Hook
export function useAllPollsApi() {
  return useQuery({
    queryKey: ['getAllPolls'],
    queryFn: getAllPollsApi,
    staleTime: 1000 * 60 * 5,   
  })
}

//get particular poll details
export function pollDetailsApi(pollId:string,options?: Partial<UseQueryOptions<any, any, any, any>>){
  return useQuery({
    queryKey: ['PollDetails',pollId],
    queryFn:()=> getPollDetailApi(pollId),  
    staleTime: 1000 * 60 * 5, 
    ...options  
  })
}

// Update poll 
export function useUpdatePoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePollApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['PollDetails', variables.pollId] });
      queryClient.invalidateQueries({ queryKey: ['getAllPolls'] });
      queryClient.invalidateQueries({ queryKey: ['pollDashboard'] });
    },
  });
}
