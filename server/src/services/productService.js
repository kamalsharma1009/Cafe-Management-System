const prisma = require('../config/database');
const fs = require('fs');
const path = require('path');

class ProductService {
  async getAll(query = {}) {
    const { search, categoryId, status, page = 1, limit = 10 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (status) {
      where.status = status;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy: { displayOrder: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async getById(id) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!product) {
      throw Object.assign(new Error('Product not found.'), { statusCode: 404 });
    }
    return product;
  }

  async create(data, file) {
    const productData = {
      name: data.name,
      sku: data.sku || null,
      categoryId: parseInt(data.categoryId),
      price: parseFloat(data.price),
      description: data.description || null,
      stock: parseInt(data.stock) || 0,
      preparationTime: data.preparationTime ? parseInt(data.preparationTime) : null,
      isAvailable: data.isAvailable !== 'false',
      displayOrder: parseInt(data.displayOrder) || 0,
      status: data.status || 'ACTIVE',
    };

    if (file) {
      productData.image = `/uploads/${file.filename}`;
    } else if (data.image) {
      productData.image = data.image;
    }

    return prisma.product.create({
      data: productData,
      include: { category: { select: { id: true, name: true } } },
    });
  }

  async update(id, data, file) {
    const existing = await this.getById(id);

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.sku !== undefined) updateData.sku = data.sku || null;
    if (data.categoryId !== undefined) updateData.categoryId = parseInt(data.categoryId);
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.stock !== undefined) updateData.stock = parseInt(data.stock);
    if (data.preparationTime !== undefined) updateData.preparationTime = data.preparationTime ? parseInt(data.preparationTime) : null;
    if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable !== 'false';
    if (data.displayOrder !== undefined) updateData.displayOrder = parseInt(data.displayOrder);
    if (data.status !== undefined) updateData.status = data.status;

    if (file) {
      // Delete old image if exists and not a remote URL
      if (existing.image && !existing.image.startsWith('http')) {
        const oldPath = path.join(__dirname, '../../', existing.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.image = `/uploads/${file.filename}`;
    } else if (data.image !== undefined) {
      if (data.image !== existing.image && existing.image && !existing.image.startsWith('http')) {
        const oldPath = path.join(__dirname, '../../', existing.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.image = data.image || null;
    }

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: { select: { id: true, name: true } } },
    });
  }

  async delete(id) {
    const product = await this.getById(id);

    // Delete image file if exists and not a remote URL
    if (product.image && !product.image.startsWith('http')) {
      const imgPath = path.join(__dirname, '../../', product.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    return prisma.product.delete({ where: { id } });
  }

  async getForPOS() {
    return prisma.product.findMany({
      where: { status: 'ACTIVE', isAvailable: true },
      include: { category: { select: { id: true, name: true } } },
      orderBy: { displayOrder: 'asc' },
    });
  }
}

module.exports = new ProductService();
