const prisma = require('../config/database');

class CategoryService {
  async getAll() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async getById(id) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) {
      throw Object.assign(new Error('Category not found.'), { statusCode: 404 });
    }
    return category;
  }

  async create(data) {
    return prisma.category.create({ data: { name: data.name } });
  }

  async update(id, data) {
    await this.getById(id);
    return prisma.category.update({
      where: { id },
      data: { name: data.name },
    });
  }

  async delete(id) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      throw Object.assign(new Error('Category not found.'), { statusCode: 404 });
    }

    if (category._count.products > 0) {
      throw Object.assign(
        new Error(`Cannot delete category. ${category._count.products} product(s) are linked to it.`),
        { statusCode: 400 }
      );
    }

    return prisma.category.delete({ where: { id } });
  }
}

module.exports = new CategoryService();
