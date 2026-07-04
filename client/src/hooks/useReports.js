import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export const useReports = (params = {}) => {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: async () => {
      const res = await api.get('/reports', { params });
      return res.data.data;
    },
    staleTime: 60 * 1000,
  });
};

export const exportReportExcel = async (params = {}) => {
  const res = await api.get('/reports/export', { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'CafeFlow-Report.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
