const productService = require('../services/productService');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const result = await productService.getAll(req.query);
    sendSuccess(res, result, 'Products fetched successfully');
  } catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const product = await productService.getById(parseInt(req.params.id));
    sendSuccess(res, product, 'Product fetched successfully');
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const product = await productService.create(req.body, req.file);
    sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const product = await productService.update(parseInt(req.params.id), req.body, req.file);
    sendSuccess(res, product, 'Product updated successfully');
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    await productService.delete(parseInt(req.params.id));
    sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) { next(error); }
};

const getForPOS = async (req, res, next) => {
  try {
    const products = await productService.getForPOS();
    sendSuccess(res, products, 'POS products fetched successfully');
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, create, update, remove, getForPOS };
