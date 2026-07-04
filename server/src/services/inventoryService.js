const prisma = require('../config/database');

class InventoryService {
  async getAll() {
    return prisma.inventory.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { history: true } } },
    });
  }

  async getById(id) {
    const item = await prisma.inventory.findUnique({
      where: { id },
      include: { _count: { select: { history: true } } },
    });
    if (!item) {
      throw Object.assign(new Error('Inventory item not found.'), { statusCode: 404 });
    }
    return item;
  }

  async create(data) {
    return prisma.inventory.create({
      data: {
        name: data.name,
        stock: parseInt(data.stock) || 0,
        minimumStock: parseInt(data.minimumStock) || 0,
        unit: data.unit,
        purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : null,
        supplierName: data.supplierName || null,
        remarks: data.remarks || null,
      },
    });
  }

  async update(id, data) {
    await this.getById(id);

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.minimumStock !== undefined) updateData.minimumStock = parseInt(data.minimumStock);
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.purchasePrice !== undefined) updateData.purchasePrice = data.purchasePrice ? parseFloat(data.purchasePrice) : null;
    if (data.supplierName !== undefined) updateData.supplierName = data.supplierName || null;
    if (data.remarks !== undefined) updateData.remarks = data.remarks || null;

    return prisma.inventory.update({ where: { id }, data: updateData });
  }

  async updateStock(id, data) {
    const item = await this.getById(id);
    const { action, quantity, remarks } = data;
    const qty = parseInt(quantity);

    if (!qty || qty <= 0) {
      throw Object.assign(new Error('Quantity must be a positive number.'), { statusCode: 400 });
    }

    let newStock;
    switch (action) {
      case 'ADD':
        newStock = item.stock + qty;
        break;
      case 'REMOVE':
        newStock = item.stock - qty;
        if (newStock < 0) {
          throw Object.assign(new Error('Insufficient stock. Cannot remove more than available.'), { statusCode: 400 });
        }
        break;
      case 'ADJUST':
        newStock = qty;
        break;
      default:
        throw Object.assign(new Error('Invalid action. Use ADD, REMOVE, or ADJUST.'), { statusCode: 400 });
    }

    // Update stock and create history in a transaction
    const [updatedItem, historyRecord] = await prisma.$transaction([
      prisma.inventory.update({
        where: { id },
        data: { stock: newStock },
      }),
      prisma.inventoryHistory.create({
        data: {
          inventoryId: id,
          action,
          quantity: qty,
          previousStock: item.stock,
          newStock,
          remarks: remarks || null,
        },
      }),
    ]);

    return { item: updatedItem, history: historyRecord };
  }

  async getHistory(id) {
    await this.getById(id);
    return prisma.inventoryHistory.findMany({
      where: { inventoryId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id) {
    await this.getById(id);

    // Delete history first, then item
    await prisma.$transaction([
      prisma.inventoryHistory.deleteMany({ where: { inventoryId: id } }),
      prisma.inventory.delete({ where: { id } }),
    ]);

    return true;
  }
}

module.exports = new InventoryService();
