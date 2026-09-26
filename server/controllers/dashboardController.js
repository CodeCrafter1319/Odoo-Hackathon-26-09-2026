import dashboardService from '../services/dashboardService.js';

const handleServiceError = (res, error, next) => {
  if (error.statusCode) { res.status(error.statusCode); }
  next(error);
};

export const getSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummary(req.query);
    res.json({ success: true, data });
  } catch (error) { handleServiceError(res, error, next); }
};
