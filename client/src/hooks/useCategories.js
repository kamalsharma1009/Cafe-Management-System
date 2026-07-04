import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => { const res = await api.post('/categories', data); return res.data.data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Category created successfully'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create category'),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => { const res = await api.put(`/categories/${id}`, data); return res.data.data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Category updated successfully'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update category'),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await api.delete(`/categories/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Category deleted successfully'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete category'),
  });
};
