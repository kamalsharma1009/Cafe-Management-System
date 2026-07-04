import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const useInventory = () => {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await api.get('/inventory');
      return res.data.data;
    },
  });
};

export const useInventoryHistory = (id) => {
  return useQuery({
    queryKey: ['inventoryHistory', id],
    queryFn: async () => {
      const res = await api.get(`/inventory/${id}/history`);
      return res.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => { const res = await api.post('/inventory', data); return res.data.data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Inventory item created'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create item'),
  });
};

export const useUpdateInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => { const res = await api.put(`/inventory/${id}`, data); return res.data.data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Inventory item updated'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update item'),
  });
};

export const useUpdateStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => { const res = await api.patch(`/inventory/${id}/stock`, data); return res.data.data; },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      qc.invalidateQueries({ queryKey: ['inventoryHistory'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Stock updated successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update stock'),
  });
};

export const useDeleteInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await api.delete(`/inventory/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Inventory item deleted'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete item'),
  });
};
