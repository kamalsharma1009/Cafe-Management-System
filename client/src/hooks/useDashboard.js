import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data.data;
    },
    staleTime: 30 * 1000,
  });
};
