const inventoryService = require('../services/inventoryService');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const items = await inventoryService.getAll();
    sendSuccess(res, items, 'Inventory fetched successfully');
  } catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const item = await inventoryService.getById(parseInt(req.params.id));
    sendSuccess(res, item, 'Inventory item fetched successfully');
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const item = await inventoryService.create(req.body);
    sendSuccess(res, item, 'Inventory item created successfully', 201);
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const item = await inventoryService.update(parseInt(req.params.id), req.body);
    sendSuccess(res, item, 'Inventory item updated successfully');
  } catch (error) { next(error); }
};

const updateStock = async (req, res, next) => {
  try {
    const result = await inventoryService.updateStock(parseInt(req.params.id), req.body);
    sendSuccess(res, result, 'Stock updated successfully');
  } catch (error) { next(error); }
};

const getHistory = async (req, res, next) => {
  try {
    const history = await inventoryService.getHistory(parseInt(req.params.id));
    sendSuccess(res, history, 'Inventory history fetched successfully');
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    await inventoryService.delete(parseInt(req.params.id));
    sendSuccess(res, null, 'Inventory item deleted successfully');
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, create, update, updateStock, getHistory, remove };
