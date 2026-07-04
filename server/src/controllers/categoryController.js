const categoryService = require('../services/categoryService');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const categories = await categoryService.getAll();
    sendSuccess(res, categories, 'Categories fetched successfully');
  } catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const category = await categoryService.getById(parseInt(req.params.id));
    sendSuccess(res, category, 'Category fetched successfully');
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const category = await categoryService.create(req.body);
    sendSuccess(res, category, 'Category created successfully', 201);
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const category = await categoryService.update(parseInt(req.params.id), req.body);
    sendSuccess(res, category, 'Category updated successfully');
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    await categoryService.delete(parseInt(req.params.id));
    sendSuccess(res, null, 'Category deleted successfully');
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, create, update, remove };
