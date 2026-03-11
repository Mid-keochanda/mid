import axiosClient from '@/lib/axiosClient';

const PATH = '/equipment';

export const equipmentService = {
  getAll: () => 
    axiosClient.get(PATH).then(res => res.data),

  getById: (id: number) => 
    axiosClient.get(`${PATH}/${id}`).then(res => res.data),

  create: (data: any) => 
    axiosClient.post(PATH, data).then(res => res.data),

  update: (id: number, data: any) => 
    axiosClient.put(`${PATH}/${id}`, data).then(res => res.data),

  delete: (id: number) => 
    axiosClient.delete(`${PATH}/${id}`).then(res => res.data),
};