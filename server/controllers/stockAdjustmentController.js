import stockAdjustmentService from '../services/stockAdjustmentService.js';

const handleServiceError = (res, error, next) => {
  if (error.statusCode) { res.status(error.statusCode); }
  next(error);
};

export const createAdjustment = async (req, res, next) => {
  try {
    const data = await stockAdjustmentService.createAdjustment(req.body, req.user);
    res.status(201).json(data);
  } catch (error) { handleServiceError(res, error, next); }
};

export const getAdjustments = async (req, res, next) => {
  try {
    const data = await stockAdjustmentService.getAdjustments(req.query);
    res.json({ success: true, ...data });
  } catch (error) { handleServiceError(res, error, next); }
};

export const getAdjustmentById = async (req, res, next) => {
  try {
    const data = await stockAdjustmentService.getAdjustmentById(req.params.id);
    res.json({ success: true, data });
  } catch (error) { handleServiceError(res, error, next); }
};

export const updateAdjustment = async (req, res, next) => {
  try {
    const data = await stockAdjustmentService.updateAdjustment(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) { handleServiceError(res, error, next); }
};

export const deleteAdjustment = async (req, res, next) => {
  try {
    const data = await stockAdjustmentService.cancelAdjustment(req.params.id);
    res.json({ success: true, data });
  } catch (error) { handleServiceError(res, error, next); }
};

export const approveAdjustment = async (req, res, next) => {
  try {
    const data = await stockAdjustmentService.approveAdjustment(req.params.id, req.user);
    res.json({ success: true, data });
  } catch (error) { handleServiceError(res, error, next); }
};

export const completeAdjustment = async (req, res, next) => {
  try {
    const data = await stockAdjustmentService.completeAdjustment(req.params.id, req.user);
    res.json({ success: true, data });
  } catch (error) { handleServiceError(res, error, next); }
};
