import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useDebounce } from '../hooks/useDebounce';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { formatCurrency } from '../utils/formatters';
import { PLACEHOLDER_IMAGE, PRODUCT_STATUS } from '../utils/constants';
import toast from 'react-hot-toast';

export default function Products() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const debouncedSearch = useDebounce(search, 300);
  const params = { search: debouncedSearch, categoryId: categoryFilter, status: statusFilter, page, limit: 10 };
  const { data, isLoading } = useProducts(params);
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [form, setForm] = useState({ name: '', sku: '', categoryId: '', price: '', description: '', stock: '0', preparationTime: '', isAvailable: 'true', displayOrder: '0', status: 'ACTIVE', image: '' });

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: '', sku: '', categoryId: '', price: '', description: '', stock: '0', preparationTime: '', isAvailable: 'true', displayOrder: '0', status: 'ACTIVE', image: '' });
    setImageFile(null); setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, sku: p.sku || '', categoryId: String(p.categoryId), price: String(p.price), description: p.description || '', stock: String(p.stock), preparationTime: p.preparationTime ? String(p.preparationTime) : '', isAvailable: String(p.isAvailable), displayOrder: String(p.displayOrder), status: p.status, image: p.image && p.image.startsWith('http') ? p.image : '' });
    setImageFile(null);
    setImagePreview(p.image ? (p.image.startsWith('http') ? p.image : `${import.meta.env.VITE_API_URL || ''}${p.image}`) : null);
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setForm((prev) => ({ ...prev, image: '' })); // Clear URL when file uploaded
    }
  };

  const handleImageUrlChange = (url) => {
    setForm((prev) => ({ ...prev, image: url }));
    if (url) {
      setImagePreview(url);
    } else if (imageFile) {
      setImagePreview(URL.createObjectURL(imageFile));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) {
      fd.append('image', imageFile);
    }

    try {
      if (editProduct) {
        await updateProduct.mutateAsync({ id: editProduct.id, formData: fd });
      } else {
        await createProduct.mutateAsync(fd);
      }
      setModalOpen(false);
    } catch {}
  };

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {}
  };

  const getImageSrc = (image) => {
    if (!image) return PLACEHOLDER_IMAGE;
    if (image.startsWith('http')) return image;
    return `${import.meta.env.VITE_API_URL || ''}${image}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-cafe-text font-display">Products</h1>
        <Button icon={HiOutlinePlus} onClick={openCreate}>Add Product</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search products..." className="sm:w-64" />
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30">
          <option value="">All Categories</option>
          {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? <TableSkeleton rows={5} cols={7} /> : !data?.products?.length ? (
        <EmptyState title="No products yet" description="Add your first product to get started." action={<Button icon={HiOutlinePlus} onClick={openCreate}>Add Product</Button>} />
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cafe-bg border-b border-cafe-bg-secondary">
                    {['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-cafe-text-muted uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cafe-bg-secondary/50">
                  {data.products.map((p) => (
                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-cafe-bg/50 transition-colors">
                      <td className="px-5 py-3">
                        <img src={getImageSrc(p.image)} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      </td>
                      <td className="px-5 py-3 font-medium text-cafe-text">{p.name}</td>
                      <td className="px-5 py-3 text-cafe-text-light">{p.category?.name}</td>
                      <td className="px-5 py-3 font-medium tabular-nums">{formatCurrency(p.price)}</td>
                      <td className="px-5 py-3 tabular-nums">{p.stock}</td>
                      <td className="px-5 py-3"><Badge variant={p.status === 'ACTIVE' ? 'success' : 'default'}>{PRODUCT_STATUS[p.status]?.label}</Badge></td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-cafe-bg-secondary text-cafe-text-muted hover:text-cafe-accent transition-colors"><HiOutlinePencil className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-cafe-text-muted hover:text-danger transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} />
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">SKU</label>
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">Category *</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30">
                <option value="">Select category</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">Price *</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">Prep Time (min)</label>
              <input type="number" value={form.preparationTime} onChange={(e) => setForm({ ...form, preparationTime: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">Display Order</label>
              <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-cafe-text-light">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
          </div>
          <div className="space-y-4 border-t border-cafe-bg-secondary pt-3">
            <h4 className="text-sm font-semibold text-cafe-text">Product Media</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-cafe-text-light">Image URL (Link)</label>
                <input 
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={form.image} 
                  onChange={(e) => handleImageUrlChange(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-cafe-text-light">Or Upload Image File</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="w-full text-sm text-cafe-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-cafe-bg-secondary file:text-cafe-text hover:file:bg-cafe-card" 
                />
              </div>
            </div>
            {imagePreview && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-cafe-text-muted mb-1">Preview</label>
                <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-cafe-bg-secondary" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createProduct.isPending || updateProduct.isPending}>
              {editProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Product" message="Are you sure you want to delete this product? This action cannot be undone." confirmText="Delete" loading={deleteProduct.isPending} />
    </div>
  );
}
