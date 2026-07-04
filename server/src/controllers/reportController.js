const reportService = require('../services/reportService');
const { sendSuccess } = require('../utils/response');

const getReport = async (req, res, next) => {
  try {
    const report = await reportService.getReport(req.query);
    sendSuccess(res, report, 'Report fetched successfully');
  } catch (error) { next(error); }
};

const exportExcel = async (req, res, next) => {
  try {
    const workbook = await reportService.exportExcel(req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=CafeFlow-Report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) { next(error); }
};

module.exports = { getReport, exportExcel };
