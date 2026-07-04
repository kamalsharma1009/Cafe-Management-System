import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiOutlineCurrencyRupee, HiOutlineShoppingBag, HiOutlineCalendar, HiOutlineTrendingUp, HiOutlineCube, HiOutlineTag, HiOutlineExclamation, HiOutlineShoppingCart, HiOutlinePlus, HiOutlineChartBar } from 'react-icons/hi';
import { useDashboard } from '../hooks/useDashboard';
import { StatCard } from '../components/ui/Card';
import { CardSkeleton } from '../components/ui/Skeleton';
import RevenueChart from '../components/charts/RevenueChart';
import TopProductsChart from '../components/charts/TopProductsChart';
import CategorySalesChart from '../components/charts/CategorySalesChart';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatCurrency, formatToken, formatTime } from '../utils/formatters';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { data, isLoading } = useDashboard();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-cafe-text font-display">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const { cards, charts, recentOrders } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-cafe-text font-display">Dashboard</h1>
        <div className="flex gap-2">
          <Button size="sm" icon={HiOutlineShoppingCart} onClick={() => navigate('/pos')}>New Order</Button>
          <Button size="sm" variant="secondary" icon={HiOutlinePlus} onClick={() => navigate('/products')}>Add Product</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <motion.div variants={fadeUp}><StatCard title="Today's Revenue" value={formatCurrency(cards?.todayRevenue)} icon={HiOutlineCurrencyRupee} color="bg-cafe-accent" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Today's Orders" value={cards?.todayOrders || 0} icon={HiOutlineShoppingBag} color="bg-[#DCC5B2]" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Monthly Revenue" value={formatCurrency(cards?.monthlyRevenue)} icon={HiOutlineCalendar} color="bg-[#c88e85]" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Avg Order Value" value={formatCurrency(cards?.avgOrderValue)} icon={HiOutlineTrendingUp} color="bg-[#b07a72]" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Total Products" value={cards?.totalProducts || 0} icon={HiOutlineCube} color="bg-cafe-card" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Total Categories" value={cards?.totalCategories || 0} icon={HiOutlineTag} color="bg-cafe-bg-secondary" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Low Stock Items" value={cards?.lowStockCount || 0} icon={HiOutlineExclamation} color="bg-warning" /></motion.div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={charts?.weeklyRevenue} title="Sales Overview (Last 7 Days)" xKey="day" />
        <TopProductsChart data={charts?.topProducts} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={charts?.monthlyRevenue} title="Monthly Revenue" xKey="day" />
        <CategorySalesChart data={charts?.categorySales} />
      </div>

      {/* Recent Orders */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-cafe-bg-secondary">
          <h3 className="text-sm font-semibold text-cafe-text font-display">Recent Orders</h3>
          <button onClick={() => navigate('/orders')} className="text-xs text-cafe-accent hover:underline font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cafe-bg">
                <th className="text-left px-5 py-3 text-xs font-semibold text-cafe-text-muted uppercase tracking-wider">Token</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-cafe-text-muted uppercase tracking-wider">Items</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-cafe-text-muted uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-cafe-text-muted uppercase tracking-wider">Time</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-cafe-text-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cafe-bg-secondary/50">
              {recentOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-cafe-bg/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-cafe-text">#{formatToken(order.token)}</td>
                  <td className="px-5 py-3 text-cafe-text-light">{order.items?.length || 0}</td>
                  <td className="px-5 py-3 font-medium tabular-nums">{formatCurrency(order.total)}</td>
                  <td className="px-5 py-3 text-cafe-text-muted text-xs">{formatTime(order.createdAt)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={order.orderStatus === 'COMPLETED' ? 'success' : order.orderStatus === 'CANCELLED' ? 'danger' : 'warning'}>
                      {order.orderStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-cafe-text-muted">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
