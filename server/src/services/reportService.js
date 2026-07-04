const prisma = require('../config/database');
const ExcelJS = require('exceljs');

class ReportService {
  async getReport(query = {}) {
    const { type = 'today', startDate, endDate } = query;
    const now = new Date();
    let start, end;

    switch (type) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(start); end.setDate(end.getDate() + 1);
        break;
      case 'week':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'custom':
        if (!startDate || !endDate) throw Object.assign(new Error('Start date and end date are required for custom range.'), { statusCode: 400 });
        start = new Date(startDate);
        end = new Date(endDate); end.setHours(23, 59, 59, 999);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(start); end.setDate(end.getDate() + 1);
    }

    const activeFilter = { orderStatus: { not: 'CANCELLED' }, createdAt: { gte: start, lt: end } };

    const orders = await prisma.order.findMany({
      where: activeFilter,
      include: { items: { include: { product: { select: { name: true, categoryId: true } } } } },
      orderBy: { createdAt: 'desc' },
    });

    const totalSales = orders.reduce((s, o) => s + parseFloat(o.total), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Payment summary
    const paymentSummary = { CASH: 0, UPI: 0, CARD: 0 };
    orders.forEach(o => { paymentSummary[o.paymentMethod] = (paymentSummary[o.paymentMethod] || 0) + parseFloat(o.total); });

    // Top products
    const productMap = {};
    orders.forEach(o => o.items.forEach(i => {
      const name = i.product?.name || 'Unknown';
      if (!productMap[name]) productMap[name] = { name, quantity: 0, revenue: 0 };
      productMap[name].quantity += i.quantity;
      productMap[name].revenue += parseFloat(i.price) * i.quantity;
    }));
    const topProducts = Object.values(productMap).sort((a, b) => b.quantity - a.quantity).slice(0, 10);

    // Category sales
    const categories = await prisma.category.findMany();
    const catMap = {};
    categories.forEach(c => { catMap[c.id] = { name: c.name, total: 0 }; });
    orders.forEach(o => o.items.forEach(i => {
      const catId = i.product?.categoryId;
      if (catId && catMap[catId]) catMap[catId].total += parseFloat(i.price) * i.quantity;
    }));
    const categorySales = Object.values(catMap).sort((a, b) => b.total - a.total);

    // Sales chart data
    const salesByDay = {};
    orders.forEach(o => {
      const day = o.createdAt.toISOString().slice(0, 10);
      if (!salesByDay[day]) salesByDay[day] = { date: day, revenue: 0, orders: 0 };
      salesByDay[day].revenue += parseFloat(o.total);
      salesByDay[day].orders += 1;
    });
    const salesChart = Object.values(salesByDay).sort((a, b) => a.date.localeCompare(b.date));

    // Low stock inventory
    const lowStockItems = await prisma.$queryRaw`
      SELECT id, name, stock, "minimumStock", unit FROM inventory WHERE stock <= "minimumStock" ORDER BY stock ASC
    `.catch(() => []);

    return {
      summary: { totalSales, totalOrders, avgOrderValue: Math.round(avgOrderValue * 100) / 100 },
      paymentSummary,
      topProducts,
      categorySales,
      salesChart,
      lowStockItems,
      orders,
    };
  }

  async exportExcel(query = {}) {
    const report = await this.getReport(query);
    const workbook = new ExcelJS.Workbook();

    // Sales Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 20 },
    ];
    summarySheet.addRow({ metric: 'Total Sales', value: report.summary.totalSales });
    summarySheet.addRow({ metric: 'Total Orders', value: report.summary.totalOrders });
    summarySheet.addRow({ metric: 'Average Order Value', value: report.summary.avgOrderValue });
    summarySheet.addRow({ metric: 'Cash', value: report.paymentSummary.CASH });
    summarySheet.addRow({ metric: 'UPI', value: report.paymentSummary.UPI });
    summarySheet.addRow({ metric: 'Card', value: report.paymentSummary.CARD });
    summarySheet.getRow(1).font = { bold: true };

    // Orders sheet
    const ordersSheet = workbook.addWorksheet('Orders');
    ordersSheet.columns = [
      { header: 'Order #', key: 'orderNumber', width: 22 },
      { header: 'Token', key: 'token', width: 10 },
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Items', key: 'items', width: 10 },
      { header: 'Subtotal', key: 'subtotal', width: 12 },
      { header: 'Discount', key: 'discount', width: 12 },
      { header: 'GST', key: 'gst', width: 12 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Payment', key: 'payment', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
    ];
    report.orders.forEach(o => {
      ordersSheet.addRow({
        orderNumber: o.orderNumber, token: o.token,
        date: o.createdAt.toISOString(), items: o.items.length,
        subtotal: parseFloat(o.subtotal), discount: parseFloat(o.discount),
        gst: parseFloat(o.gst), total: parseFloat(o.total),
        payment: o.paymentMethod, status: o.orderStatus,
      });
    });
    ordersSheet.getRow(1).font = { bold: true };

    // Top Products sheet
    const productsSheet = workbook.addWorksheet('Top Products');
    productsSheet.columns = [
      { header: 'Product', key: 'name', width: 25 },
      { header: 'Quantity Sold', key: 'quantity', width: 15 },
      { header: 'Revenue', key: 'revenue', width: 15 },
    ];
    report.topProducts.forEach(p => productsSheet.addRow(p));
    productsSheet.getRow(1).font = { bold: true };

    return workbook;
  }
}

module.exports = new ReportService();
