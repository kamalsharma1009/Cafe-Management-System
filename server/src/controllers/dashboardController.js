const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/response');

const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats();
    sendSuccess(res, stats, 'Dashboard stats fetched successfully');
  } catch (error) { next(error); }
};

module.exports = { getStats };
