const settingsService = require('../services/settingsService');
const { sendSuccess } = require('../utils/response');

const get = async (req, res, next) => {
  try {
    const settings = await settingsService.get();
    sendSuccess(res, settings, 'Settings fetched successfully');
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const settings = await settingsService.update(req.body, req.file);
    sendSuccess(res, settings, 'Settings updated successfully');
  } catch (error) { next(error); }
};

module.exports = { get, update };
