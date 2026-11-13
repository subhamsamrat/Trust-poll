import axiosClient from "./axios.config";

//get All polls
export const getAllPollsApi = async () => {
  const response = await axiosClient.get('/poll/all-polls');
  console.log('get all polls response=',response);
  return response.data.data;
};

//get a particular poll details
export const getPollDetailApi = async (pollId: string) => {
  const res = await axiosClient.get(`/poll/detail/${pollId}`);
  return res.data.data;
};

//update poll (questions, options, title, isPublished, etc.)
export const updatePollApi = async ({ pollId, data }: { pollId: string; data: any }) => {
  const res = await axiosClient.patch(`/poll/update/${pollId}`, data);
  return res.data.data;
};

//visitor Api
export const visitorApi=async (pollId:string)=>{
  const res=await axiosClient.get(`/visit/${pollId}`)
  return res.data
}