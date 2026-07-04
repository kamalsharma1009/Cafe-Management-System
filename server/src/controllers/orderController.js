const orderService = require('../services/orderService');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const result = await orderService.getAll(req.query);
    sendSuccess(res, result, 'Orders fetched successfully');
  } catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const order = await orderService.getById(parseInt(req.params.id));
    sendSuccess(res, order, 'Order fetched successfully');
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const order = await orderService.create(req.body);
    sendSuccess(res, order, 'Order created successfully', 201);
  } catch (error) { next(error); }
};

const cancel = async (req, res, next) => {
  try {
    const order = await orderService.cancel(parseInt(req.params.id));
    sendSuccess(res, order, 'Order cancelled successfully');
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, create, cancel };
