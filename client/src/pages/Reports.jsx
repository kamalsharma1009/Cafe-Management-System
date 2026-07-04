import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineDownload, 
  HiOutlinePrinter, 
  HiOutlineCurrencyRupee, 
  HiOutlineShoppingBag, 
  HiOutlineTrendingUp, 
  HiOutlineExclamation, 
  HiOutlineChartBar 
} from 'react-icons/hi';
import { useReports, exportReportExcel } from '../hooks/useReports';
import { useSettings } from '../hooks/useSettings';
import { StatCard } from '../components/ui/Card';
import { CardSkeleton } from '../components/ui/Skeleton';
import RevenueChart from '../components/charts/RevenueChart';
import TopProductsChart from '../components/charts/TopProductsChart';
import CategorySalesChart from '../components/charts/CategorySalesChart';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { formatCurrency, formatToken, formatDateTime } from '../utils/formatters';
import toast from 'react-hot-toast';

const TABS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom' },
];

export default function Reports() {
  const [type, setType] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  const params = { type, ...(type === 'custom' ? { startDate, endDate } : {}) };
  const { data, isLoading } = useReports(params);
  const { data: settings } = useSettings();

  const currency = settings?.currency || '₹';

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportReportExcel(params);
      toast.success('Report exported successfully');
    } catch {
      toast.error('Failed to export report');
    }
    setExporting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-cafe-text font-display">Reports & Analytics</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" icon={HiOutlineDownload} onClick={handleExport} loading={exporting}>Export Excel</Button>
          <Button size="sm" variant="secondary" icon={HiOutlinePrinter} onClick={() => window.print()}>Print</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setType(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              type === tab.value ? 'bg-cafe-accent text-white shadow-soft' : 'bg-white text-cafe-text-light hover:bg-cafe-bg-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {type === 'custom' && (
        <div className="flex gap-3">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-2.5 bg-white border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-2.5 bg-white border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30" />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Sales" value={formatCurrency(data?.summary?.totalSales, currency)} icon={HiOutlineCurrencyRupee} color="bg-cafe-accent" />
            <StatCard title="Total Orders" value={data?.summary?.totalOrders || 0} icon={HiOutlineShoppingBag} color="bg-[#DCC5B2]" />
            <StatCard title="Avg Order Value" value={formatCurrency(data?.summary?.avgOrderValue, currency)} icon={HiOutlineTrendingUp} color="bg-[#c88e85]" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={data?.salesChart} title="Sales Overview" xKey="date" />
            <CategorySalesChart data={data?.categorySales} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopProductsChart data={data?.topProducts} />

            {/* Payment Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-soft p-5">
              <h3 className="text-sm font-semibold text-cafe-text mb-4 font-display">Payment Summary</h3>
              <div className="space-y-3">
                {['CASH', 'UPI', 'CARD'].map((method) => {
                  const amount = data?.paymentSummary?.[method] || 0;
                  const total = data?.summary?.totalSales || 1;
                  const pct = total > 0 ? (amount / total) * 100 : 0;
                  return (
                    <div key={method}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-cafe-text-light">{method}</span>
                        <span className="font-medium tabular-nums">{formatCurrency(amount, currency)}</span>
                      </div>
                      <div className="w-full h-2 bg-cafe-bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-cafe-accent rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Low Stock Items */}
          {data?.lowStockItems?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-soft p-5">
              <h3 className="text-sm font-semibold text-cafe-text mb-4 font-display flex items-center gap-2">
                <HiOutlineExclamation className="w-5 h-5 text-red-500" />
                Low Stock Items
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-red-50 rounded-xl p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-cafe-text">{item.name}</p>
                      <p className="text-xs text-cafe-text-muted">{item.stock} / {item.minimumStock} {item.unit}</p>
                    </div>
                    <Badge variant="danger">Low</Badge>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Orders Report Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-cafe-bg-secondary">
              <h3 className="text-sm font-semibold text-cafe-text font-display flex items-center gap-2">
                <HiOutlineChartBar className="w-5 h-5 text-cafe-accent" />
                Orders Report
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cafe-bg border-b border-cafe-bg-secondary">
                    {['Order #', 'Token', 'Date', 'Items', 'Total', 'Payment', 'Status'].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-cafe-text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cafe-bg-secondary/50">
                  {data?.orders?.map((order) => (
                    <tr key={order.id} className="hover:bg-cafe-bg/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-cafe-text text-xs">{order.orderNumber}</td>
                      <td className="px-5 py-3 font-semibold text-cafe-accent">#{formatToken(order.token)}</td>
                      <td className="px-5 py-3 text-cafe-text-light text-xs whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                      <td className="px-5 py-3 tabular-nums">{order.items?.length || 0}</td>
                      <td className="px-5 py-3 font-semibold tabular-nums">{formatCurrency(order.total, currency)}</td>
                      <td className="px-5 py-3"><Badge>{order.paymentMethod}</Badge></td>
                      <td className="px-5 py-3">
                        <Badge variant={order.orderStatus === 'COMPLETED' ? 'success' : order.orderStatus === 'CANCELLED' ? 'danger' : 'warning'}>
                          {order.orderStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {(!data?.orders || data.orders.length === 0) && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-sm text-cafe-text-muted">
                        No orders during this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
