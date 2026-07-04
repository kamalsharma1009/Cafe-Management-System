const prisma = require('../config/database');
const fs = require('fs');
const path = require('path');

class SettingsService {
  async get() {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({ data: {} });
    }
    return settings;
  }

  async update(data, file) {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({ data: {} });
    }

    const updateData = {};
    if (data.cafeName !== undefined) updateData.cafeName = data.cafeName;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.gstNumber !== undefined) updateData.gstNumber = data.gstNumber || null;
    if (data.printerWidth !== undefined) updateData.printerWidth = parseInt(data.printerWidth);
    if (data.taxPercentage !== undefined) updateData.taxPercentage = parseFloat(data.taxPercentage);
    if (data.receiptFooter !== undefined) updateData.receiptFooter = data.receiptFooter || null;
    if (data.openingTime !== undefined) updateData.openingTime = data.openingTime || null;
    if (data.closingTime !== undefined) updateData.closingTime = data.closingTime || null;
    if (data.currency !== undefined) updateData.currency = data.currency;

    if (file) {
      // Delete old logo
      if (settings.logo) {
        const oldPath = path.join(__dirname, '../../', settings.logo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.logo = `/uploads/${file.filename}`;
    }

    return prisma.settings.update({ where: { id: settings.id }, data: updateData });
  }
}

module.exports = new SettingsService();
