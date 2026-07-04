import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineEye, HiOutlinePrinter, HiOutlineX } from 'react-icons/hi';
import { useOrders, useCancelOrder } from '../hooks/useOrders';
import { useSettings } from '../hooks/useSettings';
import { useDebounce } from '../hooks/useDebounce';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import Receipt from '../components/receipt/Receipt';
import { TableSkeleton } from '../components/ui/Skeleton';
import { formatCurrency, formatDateTime, formatToken } from '../utils/formatters';
import { ORDER_STATUSES } from '../utils/constants';

export default function Orders() {
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [viewOrder, setViewOrder] = useState(null);
  const [cancelId, setCancelId] = useState(null);

  const debouncedSearch = useDebounce(search, 300);
  const params = { search: debouncedSearch, paymentMethod: paymentFilter, orderStatus: statusFilter, startDate, endDate, page, limit: 10 };
  const { data, isLoading } = useOrders(params);
  const { data: settings } = useSettings();
  const cancelOrder = useCancelOrder();

  const handleCancel = async () => {
    try { await cancelOrder.mutateAsync(cancelId); setCancelId(null); } catch {}
  };

  const handlePrint = () => {
    document.body.classList.add('printing-receipt');
    window.print();
    document.body.classList.remove('printing-receipt');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-cafe-text font-display">Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search order# or token..." className="w-full sm:w-56" />
        <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30">
          <option value="">All Payments</option>
          <option value="CASH">Cash</option>
          <option value="UPI">UPI</option>
          <option value="CARD">Card</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30">
          <option value="">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="PENDING">Pending</option>
        </select>
        <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
        <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
      </div>

      {isLoading ? <TableSkeleton rows={5} cols={8} /> : !data?.orders?.length ? (
        <EmptyState title="No orders found" description="Orders will appear here after billing." />
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cafe-bg border-b border-cafe-bg-secondary">
                    {['Order #', 'Token', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-cafe-text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cafe-bg-secondary/50">
                  {data.orders.map((order) => (
                    <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-cafe-bg/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-cafe-text text-xs">{order.orderNumber}</td>
                      <td className="px-5 py-3 font-semibold text-cafe-accent">#{formatToken(order.token)}</td>
                      <td className="px-5 py-3 text-cafe-text-light text-xs whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                      <td className="px-5 py-3 tabular-nums">{order.items?.length || 0}</td>
                      <td className="px-5 py-3 font-semibold tabular-nums">{formatCurrency(order.total)}</td>
                      <td className="px-5 py-3"><Badge>{order.paymentMethod}</Badge></td>
                      <td className="px-5 py-3">
                        <Badge variant={order.orderStatus === 'COMPLETED' ? 'success' : order.orderStatus === 'CANCELLED' ? 'danger' : 'warning'}>
                          {ORDER_STATUSES[order.orderStatus]?.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setViewOrder(order)} className="p-2 rounded-lg hover:bg-cafe-bg-secondary text-cafe-text-muted hover:text-cafe-accent transition-colors" title="View"><HiOutlineEye className="w-4 h-4" /></button>
                          <button onClick={() => { setViewOrder(order); setTimeout(handlePrint, 300); }} className="p-2 rounded-lg hover:bg-cafe-bg-secondary text-cafe-text-muted hover:text-cafe-accent transition-colors" title="Print"><HiOutlinePrinter className="w-4 h-4" /></button>
                          {order.orderStatus !== 'CANCELLED' && (
                            <button onClick={() => setCancelId(order.id)} className="p-2 rounded-lg hover:bg-red-50 text-cafe-text-muted hover:text-danger transition-colors" title="Cancel"><HiOutlineX className="w-4 h-4" /></button>
                          )}
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

      {/* Order Detail Modal */}
      <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title={`Order ${viewOrder?.orderNumber || ''}`} size="md">
        {viewOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-cafe-text-muted">Token:</span> <span className="font-semibold">#{formatToken(viewOrder.token)}</span></div>
              <div><span className="text-cafe-text-muted">Date:</span> <span>{formatDateTime(viewOrder.createdAt)}</span></div>
              <div><span className="text-cafe-text-muted">Payment:</span> <span>{viewOrder.paymentMethod}</span></div>
              <div><span className="text-cafe-text-muted">Status:</span> <Badge variant={viewOrder.orderStatus === 'COMPLETED' ? 'success' : 'danger'}>{viewOrder.orderStatus}</Badge></div>
            </div>
            {viewOrder.notes && <p className="text-sm text-cafe-text-light bg-cafe-bg rounded-xl p-3">📝 {viewOrder.notes}</p>}
            <div className="border-t border-cafe-bg-secondary pt-3">
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-cafe-text-muted"><th className="text-left py-1">Item</th><th className="text-center py-1">Qty</th><th className="text-right py-1">Price</th></tr></thead>
                <tbody>
                  {viewOrder.items?.map((item, i) => (
                    <tr key={i} className="border-t border-cafe-bg-secondary/50">
                      <td className="py-2">{item.product?.name}</td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right tabular-nums">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-1 text-sm border-t border-cafe-bg-secondary pt-3">
              <div className="flex justify-between"><span className="text-cafe-text-muted">Subtotal</span><span className="tabular-nums">{formatCurrency(viewOrder.subtotal)}</span></div>
              {parseFloat(viewOrder.discount) > 0 && <div className="flex justify-between"><span className="text-cafe-text-muted">Discount</span><span className="tabular-nums">-{formatCurrency(viewOrder.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-cafe-text-muted">GST</span><span className="tabular-nums">{formatCurrency(viewOrder.gst)}</span></div>
              <div className="flex justify-between font-bold text-lg pt-1 border-t border-cafe-bg-secondary"><span>Total</span><span className="tabular-nums">{formatCurrency(viewOrder.total)}</span></div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" icon={HiOutlinePrinter} onClick={handlePrint}>Print Receipt</Button>
              <Button variant="ghost" className="flex-1" onClick={() => setViewOrder(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Hidden receipt for printing */}
      <div className="receipt-container"><Receipt order={viewOrder} settings={settings} /></div>

      <ConfirmDialog isOpen={!!cancelId} onClose={() => setCancelId(null)} onConfirm={handleCancel} title="Cancel Order" message="Are you sure you want to cancel this order? Stock will be restored." confirmText="Cancel Order" loading={cancelOrder.isPending} />
    </div>
  );
}
