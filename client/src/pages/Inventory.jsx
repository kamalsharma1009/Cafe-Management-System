import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineRefresh, HiOutlineClock } from 'react-icons/hi';
import { useInventory, useCreateInventory, useUpdateInventory, useUpdateStock, useDeleteInventory, useInventoryHistory } from '../hooks/useInventory';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { INVENTORY_ACTIONS } from '../utils/constants';

export default function Inventory() {
  const [modalOpen, setModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [stockItem, setStockItem] = useState(null);
  const [historyItemId, setHistoryItemId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({ name: '', stock: '0', minimumStock: '0', unit: '', purchasePrice: '', supplierName: '', remarks: '' });
  const [stockForm, setStockForm] = useState({ action: 'ADD', quantity: '', remarks: '' });

  const { data: inventory, isLoading } = useInventory();
  const { data: history } = useInventoryHistory(historyItemId);
  const createInventory = useCreateInventory();
  const updateInventory = useUpdateInventory();
  const updateStock = useUpdateStock();
  const deleteInventory = useDeleteInventory();

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', stock: '0', minimumStock: '0', unit: '', purchasePrice: '', supplierName: '', remarks: '' });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, stock: String(item.stock), minimumStock: String(item.minimumStock), unit: item.unit, purchasePrice: item.purchasePrice ? String(item.purchasePrice) : '', supplierName: item.supplierName || '', remarks: item.remarks || '' });
    setModalOpen(true);
  };

  const openStock = (item) => {
    setStockItem(item);
    setStockForm({ action: 'ADD', quantity: '', remarks: '' });
    setStockModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updateInventory.mutateAsync({ id: editItem.id, data: form });
      } else {
        await createInventory.mutateAsync(form);
      }
      setModalOpen(false);
    } catch {}
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateStock.mutateAsync({ id: stockItem.id, data: stockForm });
      setStockModalOpen(false);
    } catch {}
  };

  const handleDelete = async () => {
    try { await deleteInventory.mutateAsync(deleteId); setDeleteId(null); } catch {}
  };

  const getStockStatus = (item) => {
    if (item.stock <= 0) return { label: 'Out of Stock', variant: 'danger' };
    if (item.stock <= item.minimumStock) return { label: 'Low Stock', variant: 'warning' };
    return { label: 'In Stock', variant: 'success' };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cafe-text font-display">Inventory</h1>
        <Button icon={HiOutlinePlus} onClick={openCreate}>Add Item</Button>
      </div>

      {isLoading ? <TableSkeleton rows={5} cols={8} /> : !inventory?.length ? (
        <EmptyState title="No inventory items" description="Add your first inventory item to track stock." action={<Button icon={HiOutlinePlus} onClick={openCreate}>Add Item</Button>} />
      ) : (
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cafe-bg border-b border-cafe-bg-secondary">
                  {['Name', 'Current Stock', 'Min Stock', 'Unit', 'Price', 'Supplier', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-cafe-text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cafe-bg-secondary/50">
                {inventory.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-cafe-bg/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-cafe-text">{item.name}</td>
                      <td className="px-5 py-3 tabular-nums font-semibold">{item.stock}</td>
                      <td className="px-5 py-3 tabular-nums text-cafe-text-muted">{item.minimumStock}</td>
                      <td className="px-5 py-3 text-cafe-text-light">{item.unit}</td>
                      <td className="px-5 py-3 tabular-nums">{item.purchasePrice ? formatCurrency(item.purchasePrice) : '-'}</td>
                      <td className="px-5 py-3 text-cafe-text-light">{item.supplierName || '-'}</td>
                      <td className="px-5 py-3"><Badge variant={status.variant}>{status.label}</Badge></td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openStock(item)} className="p-2 rounded-lg hover:bg-cafe-bg-secondary text-cafe-text-muted hover:text-cafe-accent transition-colors" title="Update Stock"><HiOutlineRefresh className="w-4 h-4" /></button>
                          <button onClick={() => { setHistoryItemId(item.id); setHistoryModalOpen(true); }} className="p-2 rounded-lg hover:bg-cafe-bg-secondary text-cafe-text-muted hover:text-cafe-accent transition-colors" title="View History"><HiOutlineClock className="w-4 h-4" /></button>
                          <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-cafe-bg-secondary text-cafe-text-muted hover:text-cafe-accent transition-colors"><HiOutlinePencil className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(item.id)} className="p-2 rounded-lg hover:bg-red-50 text-cafe-text-muted hover:text-danger transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Item' : 'Add Item'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2"><label className="block text-sm font-medium text-cafe-text-light">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" /></div>
            <div className="space-y-1.5"><label className="block text-sm font-medium text-cafe-text-light">Initial Stock</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" /></div>
            <div className="space-y-1.5"><label className="block text-sm font-medium text-cafe-text-light">Min Stock</label><input type="number" value={form.minimumStock} onChange={(e) => setForm({ ...form, minimumStock: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" /></div>
            <div className="space-y-1.5"><label className="block text-sm font-medium text-cafe-text-light">Unit *</label><input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required placeholder="kg, litre, pcs" className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" /></div>
            <div className="space-y-1.5"><label className="block text-sm font-medium text-cafe-text-light">Purchase Price</label><input type="number" step="0.01" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" /></div>
            <div className="space-y-1.5 col-span-2"><label className="block text-sm font-medium text-cafe-text-light">Supplier</label><input value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" /></div>
            <div className="space-y-1.5 col-span-2"><label className="block text-sm font-medium text-cafe-text-light">Remarks</label><textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={2} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" /></div>
          </div>
          <div className="flex justify-end gap-3"><Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" loading={createInventory.isPending || updateInventory.isPending}>{editItem ? 'Update' : 'Create'}</Button></div>
        </form>
      </Modal>

      {/* Stock Update Modal */}
      <Modal isOpen={stockModalOpen} onClose={() => setStockModalOpen(false)} title={`Update Stock: ${stockItem?.name}`} size="sm">
        <form onSubmit={handleStockUpdate} className="space-y-4">
          <p className="text-sm text-cafe-text-muted">Current stock: <span className="font-semibold text-cafe-text">{stockItem?.stock} {stockItem?.unit}</span></p>
          <div className="space-y-1.5"><label className="block text-sm font-medium text-cafe-text-light">Action</label><select value={stockForm.action} onChange={(e) => setStockForm({ ...stockForm, action: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30">{INVENTORY_ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}</select></div>
          <div className="space-y-1.5"><label className="block text-sm font-medium text-cafe-text-light">Quantity</label><input type="number" min="1" value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} required className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" /></div>
          <div className="space-y-1.5"><label className="block text-sm font-medium text-cafe-text-light">Remarks</label><textarea value={stockForm.remarks} onChange={(e) => setStockForm({ ...stockForm, remarks: e.target.value })} rows={2} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" /></div>
          <div className="flex justify-end gap-3"><Button variant="ghost" type="button" onClick={() => setStockModalOpen(false)}>Cancel</Button><Button type="submit" loading={updateStock.isPending}>Update Stock</Button></div>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal isOpen={historyModalOpen} onClose={() => { setHistoryModalOpen(false); setHistoryItemId(null); }} title="Inventory History" size="md">
        {history?.length ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {history.map((h) => (
              <div key={h.id} className="flex items-start gap-3 p-3 bg-cafe-bg rounded-xl">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${h.action === 'ADD' ? 'bg-success' : h.action === 'REMOVE' ? 'bg-danger' : 'bg-warning'}`}>
                  {h.action === 'ADD' ? '+' : h.action === 'REMOVE' ? '-' : '~'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-cafe-text">{h.action}</span>
                    <span className="text-xs text-cafe-text-muted">{h.quantity} units</span>
                  </div>
                  <p className="text-xs text-cafe-text-muted">{h.previousStock} → {h.newStock}</p>
                  {h.remarks && <p className="text-xs text-cafe-text-light mt-1">{h.remarks}</p>}
                  <p className="text-xs text-cafe-text-muted mt-1">{formatDateTime(h.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-cafe-text-muted text-center py-8">No history records</p>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Item" message="Delete this inventory item and all its history?" confirmText="Delete" loading={deleteInventory.isPending} />
    </div>
  );
}
