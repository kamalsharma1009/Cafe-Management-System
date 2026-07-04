const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Manager
  const hashedPassword = await bcrypt.hash('manager123', 12);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@cafeflow.com' },
    update: {},
    create: {
      name: 'Cafe Manager',
      email: 'manager@cafeflow.com',
      password: hashedPassword,
      role: 'MANAGER',
    },
  });
  console.log('✅ Manager created:', manager.email);

  // 2. Create Categories
  const categoryNames = ['Coffee', 'Tea', 'Fast Food', 'Desserts', 'Beverages', 'Snacks'];
  const categories = [];
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories.push(cat);
  }
  console.log('✅ Categories created:', categories.length);

  // Helper to find category id by name
  const catId = (name) => categories.find((c) => c.name === name).id;

  // 3. Create Products
  const products = [
    { name: 'Espresso', categoryId: catId('Coffee'), price: 120, stock: 50, displayOrder: 1, description: 'Strong and bold single shot espresso' },
    { name: 'Cappuccino', categoryId: catId('Coffee'), price: 180, stock: 45, displayOrder: 2, description: 'Classic cappuccino with frothy milk' },
    { name: 'Latte', categoryId: catId('Coffee'), price: 200, stock: 40, displayOrder: 3, description: 'Smooth and creamy cafe latte' },
    { name: 'Americano', categoryId: catId('Coffee'), price: 150, stock: 50, displayOrder: 4, description: 'Espresso diluted with hot water' },
    { name: 'Mocha', categoryId: catId('Coffee'), price: 220, stock: 35, displayOrder: 5, description: 'Chocolate espresso with steamed milk' },
    { name: 'Green Tea', categoryId: catId('Tea'), price: 100, stock: 60, displayOrder: 6, description: 'Premium Japanese green tea' },
    { name: 'Chai Latte', categoryId: catId('Tea'), price: 160, stock: 40, displayOrder: 7, description: 'Spiced Indian chai with steamed milk' },
    { name: 'Iced Tea', categoryId: catId('Tea'), price: 130, stock: 55, displayOrder: 8, description: 'Refreshing cold brewed iced tea' },
    { name: 'Burger', categoryId: catId('Fast Food'), price: 250, stock: 30, displayOrder: 9, description: 'Grilled chicken burger with fresh veggies', preparationTime: 15 },
    { name: 'Sandwich', categoryId: catId('Fast Food'), price: 180, stock: 35, displayOrder: 10, description: 'Club sandwich with grilled chicken', preparationTime: 10 },
    { name: 'Pizza', categoryId: catId('Fast Food'), price: 350, stock: 20, displayOrder: 11, description: 'Wood-fired margherita pizza', preparationTime: 20 },
    { name: 'French Fries', categoryId: catId('Fast Food'), price: 120, stock: 50, displayOrder: 12, description: 'Crispy golden french fries', preparationTime: 8 },
    { name: 'Pasta', categoryId: catId('Fast Food'), price: 280, stock: 25, displayOrder: 13, description: 'Creamy Alfredo pasta', preparationTime: 15 },
    { name: 'Brownie', categoryId: catId('Desserts'), price: 150, stock: 30, displayOrder: 14, description: 'Rich chocolate fudge brownie' },
    { name: 'Cheesecake', categoryId: catId('Desserts'), price: 250, stock: 20, displayOrder: 15, description: 'New York style cheesecake' },
    { name: 'Tiramisu', categoryId: catId('Desserts'), price: 300, stock: 15, displayOrder: 16, description: 'Classic Italian tiramisu' },
    { name: 'Fresh Juice', categoryId: catId('Beverages'), price: 150, stock: 40, displayOrder: 17, description: 'Freshly squeezed seasonal juice' },
    { name: 'Smoothie', categoryId: catId('Beverages'), price: 200, stock: 35, displayOrder: 18, description: 'Mixed berry smoothie' },
    { name: 'Milkshake', categoryId: catId('Beverages'), price: 220, stock: 30, displayOrder: 19, description: 'Thick chocolate milkshake' },
    { name: 'Cold Coffee', categoryId: catId('Beverages'), price: 180, stock: 45, displayOrder: 20, description: 'Iced blended cold coffee' },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log('✅ Products created:', products.length);

  // 4. Create Inventory Items
  const inventoryItems = [
    { name: 'Coffee Beans', stock: 25, minimumStock: 5, unit: 'kg', purchasePrice: 800, supplierName: 'Premium Roasters' },
    { name: 'Milk', stock: 40, minimumStock: 10, unit: 'litre', purchasePrice: 60, supplierName: 'Fresh Dairy Co.' },
    { name: 'Sugar', stock: 30, minimumStock: 5, unit: 'kg', purchasePrice: 45, supplierName: 'Sweet Supplies' },
    { name: 'Tea Leaves', stock: 15, minimumStock: 3, unit: 'kg', purchasePrice: 500, supplierName: 'Garden Fresh Tea' },
    { name: 'Bread', stock: 20, minimumStock: 5, unit: 'pcs', purchasePrice: 40, supplierName: 'Bakery Fresh' },
    { name: 'Cheese', stock: 8, minimumStock: 3, unit: 'kg', purchasePrice: 450, supplierName: 'Dairy Delight' },
    { name: 'Chocolate', stock: 12, minimumStock: 3, unit: 'kg', purchasePrice: 350, supplierName: 'Choco World' },
    { name: 'Flour', stock: 18, minimumStock: 5, unit: 'kg', purchasePrice: 40, supplierName: 'Mill Master' },
    { name: 'Butter', stock: 10, minimumStock: 3, unit: 'kg', purchasePrice: 500, supplierName: 'Dairy Delight' },
    { name: 'Cream', stock: 6, minimumStock: 2, unit: 'litre', purchasePrice: 200, supplierName: 'Fresh Dairy Co.' },
  ];

  for (const item of inventoryItems) {
    await prisma.inventory.create({ data: item });
  }
  console.log('✅ Inventory items created:', inventoryItems.length);

  // 5. Create Default Settings
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      cafeName: 'CafeFlow',
      address: '123 Coffee Street, Brew City, IN 400001',
      phone: '+91 98765 43210',
      email: 'hello@cafeflow.com',
      gstNumber: '27AABCU9603R1ZM',
      printerWidth: 80,
      taxPercentage: 5.0,
      receiptFooter: 'Thank you for visiting CafeFlow! See you again soon.',
      openingTime: '09:00',
      closingTime: '22:00',
      currency: '₹',
    },
  });
  console.log('✅ Settings created');

  console.log('\n🎉 Seeding complete!');
  console.log('📧 Login: manager@cafeflow.com');
  console.log('🔑 Password: manager123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
