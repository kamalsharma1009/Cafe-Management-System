const prisma = require('../config/database');

class DashboardService {
  async getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const activeFilter = { orderStatus: { not: 'CANCELLED' } };

    const todayOrders = await prisma.order.findMany({
      where: { createdAt: { gte: todayStart, lt: todayEnd }, ...activeFilter },
    });
    const todayRevenue = todayOrders.reduce((s, o) => s + parseFloat(o.total), 0);

    const monthlyOrders = await prisma.order.findMany({
      where: { createdAt: { gte: monthStart, lt: monthEnd }, ...activeFilter },
    });
    const monthlyRevenue = monthlyOrders.reduce((s, o) => s + parseFloat(o.total), 0);
    const avgOrderValue = monthlyOrders.length > 0 ? monthlyRevenue / monthlyOrders.length : 0;

    const totalProducts = await prisma.product.count({ where: { status: 'ACTIVE' } });
    const totalCategories = await prisma.category.count();

    const lowStockCount = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count FROM inventory WHERE stock <= "minimumStock"
    `.then(r => r[0]?.count || 0).catch(() => 0);

    // Weekly revenue
    const weeklyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const ds = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const de = new Date(ds); de.setDate(de.getDate() + 1);
      const dayOrders = await prisma.order.findMany({
        where: { createdAt: { gte: ds, lt: de }, ...activeFilter },
      });
      weeklyRevenue.push({
        date: ds.toISOString().slice(0, 10),
        day: ds.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayOrders.reduce((s, o) => s + parseFloat(o.total), 0),
        orders: dayOrders.length,
      });
    }

    // Monthly revenue by day
    const monthlyRevenueByDay = [];
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= Math.min(now.getDate(), daysInMonth); d++) {
      const ds = new Date(now.getFullYear(), now.getMonth(), d);
      const de = new Date(ds); de.setDate(de.getDate() + 1);
      const dayOrders = await prisma.order.findMany({
        where: { createdAt: { gte: ds, lt: de }, ...activeFilter },
      });
      monthlyRevenueByDay.push({
        date: ds.toISOString().slice(0, 10), day: d,
        revenue: dayOrders.reduce((s, o) => s + parseFloat(o.total), 0),
      });
    }

    // Top selling products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { createdAt: { gte: monthStart, lt: monthEnd }, ...activeFilter } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });
    const topProductsWithNames = await Promise.all(
      topProducts.map(async (item) => {
        const p = await prisma.product.findUnique({ where: { id: item.productId }, select: { name: true } });
        return { name: p?.name || 'Unknown', quantity: item._sum.quantity };
      })
    );

    // Category sales
    const categorySales = await prisma.$queryRaw`
      SELECT c.name, COALESCE(SUM(oi.quantity * oi.price), 0)::float as total
      FROM categories c
      LEFT JOIN products p ON p."categoryId" = c.id
      LEFT JOIN order_items oi ON oi."productId" = p.id
      LEFT JOIN orders o ON oi."orderId" = o.id AND o."createdAt" >= ${monthStart} AND o."createdAt" < ${monthEnd} AND o."orderStatus" != 'CANCELLED'
      GROUP BY c.id, c.name ORDER BY total DESC
    `;

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10, orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: { select: { name: true } } } } },
    });

    return {
      cards: { todayRevenue, todayOrders: todayOrders.length, monthlyRevenue, avgOrderValue: Math.round(avgOrderValue * 100) / 100, totalProducts, totalCategories, lowStockCount },
      charts: { weeklyRevenue, monthlyRevenue: monthlyRevenueByDay, topProducts: topProductsWithNames, categorySales: categorySales.map(c => ({ name: c.name, total: parseFloat(c.total) })) },
      recentOrders,
    };
  }
}

module.exports = new DashboardService();
