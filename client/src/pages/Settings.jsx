import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [form, setForm] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (settings) {
      setForm({
        cafeName: settings.cafeName || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        gstNumber: settings.gstNumber || '',
        printerWidth: String(settings.printerWidth || 80),
        taxPercentage: String(settings.taxPercentage || 5),
        receiptFooter: settings.receiptFooter || '',
        openingTime: settings.openingTime || '',
        closingTime: settings.closingTime || '',
        currency: settings.currency || '₹',
      });
      if (settings.logo) {
        setLogoPreview(`${import.meta.env.VITE_API_URL || ''}${settings.logo}`);
      }
    }
  }, [settings]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (logoFile) fd.append('logo', logoFile);
    try {
      await updateSettings.mutateAsync(fd);
    } catch {}
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-cafe-text font-display">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cafe Info */}
        <Card hover={false}>
          <h2 className="text-lg font-semibold text-cafe-text font-display mb-4">Cafe Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-sm font-medium text-cafe-text-light">Cafe Name</label>
              <input value={form.cafeName || ''} onChange={(e) => setForm({ ...form, cafeName: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-sm font-medium text-cafe-text-light">Address</label>
              <textarea value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">Phone Number</label>
              <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">Email</label>
              <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">GST Number</label>
              <input value={form.gstNumber || ''} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">Currency Symbol</label>
              <input value={form.currency || ''} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
            </div>
          </div>
        </Card>

        {/* Logo */}
        <Card hover={false}>
          <h2 className="text-lg font-semibold text-cafe-text font-display mb-4">Logo</h2>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-20 h-20 rounded-xl object-cover border border-cafe-bg-secondary" />
            ) : (
              <div className="w-20 h-20 bg-cafe-bg-secondary rounded-xl flex items-center justify-center text-cafe-text-muted text-xs">No logo</div>
            )}
            <input type="file" accept="image/*" onChange={handleLogoChange} className="text-sm text-cafe-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-cafe-bg-secondary file:text-cafe-text hover:file:bg-cafe-card" />
          </div>
        </Card>

        {/* Billing */}
        <Card hover={false}>
          <h2 className="text-lg font-semibold text-cafe-text font-display mb-4">Billing & Receipt</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">Printer Width</label>
              <select value={form.printerWidth || '80'} onChange={(e) => setForm({ ...form, printerWidth: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30">
                <option value="58">58mm</option>
                <option value="80">80mm</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">Tax Percentage (%)</label>
              <input type="number" step="0.01" value={form.taxPercentage || ''} onChange={(e) => setForm({ ...form, taxPercentage: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-sm font-medium text-cafe-text-light">Receipt Footer</label>
              <textarea value={form.receiptFooter || ''} onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })} rows={2} placeholder="Thank you for visiting!" className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
            </div>
          </div>
        </Card>

        {/* Operating Hours */}
        <Card hover={false}>
          <h2 className="text-lg font-semibold text-cafe-text font-display mb-4">Operating Hours</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">Opening Time</label>
              <input type="time" value={form.openingTime || ''} onChange={(e) => setForm({ ...form, openingTime: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">Closing Time</label>
              <input type="time" value={form.closingTime || ''} onChange={(e) => setForm({ ...form, closingTime: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={updateSettings.isPending} size="lg">Save Settings</Button>
        </div>
      </form>
    </div>
  );
}
