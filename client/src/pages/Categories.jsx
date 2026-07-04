import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineTag } from 'react-icons/hi';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';

export default function Categories() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [name, setName] = useState('');

  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const openCreate = () => { setEditCategory(null); setName(''); setModalOpen(true); };
  const openEdit = (cat) => { setEditCategory(cat); setName(cat.name); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (editCategory) {
        await updateCategory.mutateAsync({ id: editCategory.id, data: { name } });
      } else {
        await createCategory.mutateAsync({ name });
      }
      setModalOpen(false);
    } catch {}
  };

  const handleDelete = async () => {
    try {
      await deleteCategory.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cafe-text font-display">Categories</h1>
        <Button icon={HiOutlinePlus} onClick={openCreate}>Add Category</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : !categories?.length ? (
        <EmptyState title="No categories yet" description="Create your first category to organize products." icon={HiOutlineTag} action={<Button icon={HiOutlinePlus} onClick={openCreate}>Add Category</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cafe-accent/10 rounded-xl flex items-center justify-center">
                    <HiOutlineTag className="w-5 h-5 text-cafe-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-cafe-text">{cat.name}</p>
                    <p className="text-xs text-cafe-text-muted">{cat._count?.products || 0} products</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-cafe-bg-secondary text-cafe-text-muted hover:text-cafe-accent transition-colors"><HiOutlinePencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteId(cat.id)} className="p-2 rounded-lg hover:bg-red-50 text-cafe-text-muted hover:text-danger transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCategory ? 'Edit Category' : 'Add Category'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-cafe-text-light">Category Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Coffee" className="w-full px-4 py-2.5 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createCategory.isPending || updateCategory.isPending}>
              {editCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Category" message="Are you sure? Products linked to this category will need to be reassigned." confirmText="Delete" loading={deleteCategory.isPending} />
    </div>
  );
}
