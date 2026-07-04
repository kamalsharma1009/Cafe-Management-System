const prisma = require('../config/database');

class OrderService {
  async getAll(query = {}) {
    const { search, paymentMethod, orderStatus, startDate, endDate, page = 1, limit = 10 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { token: isNaN(parseInt(search)) ? undefined : parseInt(search) },
      ].filter(Boolean);
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (orderStatus) {
      where.orderStatus = orderStatus;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: { product: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async getById(id) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, image: true } } },
        },
      },
    });
    if (!order) {
      throw Object.assign(new Error('Order not found.'), { statusCode: 404 });
    }
    return order;
  }

  async create(data) {
    const { items, paymentMethod, subtotal, discount, gst, total, notes } = data;

    // Generate daily token
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lastOrder = await prisma.order.findFirst({
      where: {
        createdAt: { gte: today, lt: tomorrow },
      },
      orderBy: { token: 'desc' },
    });

    const token = lastOrder ? lastOrder.token + 1 : 1;

    // Generate order number: ORD-YYYYMMDD-XXX
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `ORD-${dateStr}-${String(token).padStart(3, '0')}`;

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          token,
          paymentMethod,
          paymentStatus: 'PAID',
          orderStatus: 'COMPLETED',
          subtotal: parseFloat(subtotal),
          discount: parseFloat(discount) || 0,
          gst: parseFloat(gst),
          total: parseFloat(total),
          notes: notes || null,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: parseFloat(item.price),
            })),
          },
        },
        include: {
          items: {
            include: { product: { select: { id: true, name: true, image: true } } },
          },
        },
      });

      // Decrement product stock (parallel for speed)
      await Promise.all(
        items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );

      return createdOrder;
    }, { timeout: 15000 });

    return order;
  }

  async cancel(id) {
    const order = await this.getById(id);

    if (order.orderStatus === 'CANCELLED') {
      throw Object.assign(new Error('Order is already cancelled.'), { statusCode: 400 });
    }

    // Cancel order and restore product stock in a transaction
    const cancelled = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          orderStatus: 'CANCELLED',
          paymentStatus: 'UNPAID',
        },
        include: {
          items: {
            include: { product: { select: { id: true, name: true } } },
          },
        },
      });

      // Restore product stock (parallel for speed)
      await Promise.all(
        order.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        )
      );

      return updatedOrder;
    }, { timeout: 15000 });

    return cancelled;
  }
}

module.exports = new OrderService();
