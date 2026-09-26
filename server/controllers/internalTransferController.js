import internalTransferService from '../services/internalTransferService.js';

const handleServiceError = (res, error, next) => {
  if (error.statusCode) {
    res.status(error.statusCode);
  }
  next(error);
};

export const createTransfer = async (req, res, next) => {
  try {
    const data = await internalTransferService.createTransfer(req.body, req.user);
    res.status(201).json(data);
  } catch (error) { handleServiceError(res, error, next); }
};

export const getTransfers = async (req, res, next) => {
  try {
    const data = await internalTransferService.getTransfers(req.query);
    res.json({ success: true, ...data });
  } catch (error) { handleServiceError(res, error, next); }
};

export const getTransferById = async (req, res, next) => {
  try {
    const data = await internalTransferService.getTransferById(req.params.id);
    res.json({ success: true, data });
  } catch (error) { handleServiceError(res, error, next); }
};

export const updateTransfer = async (req, res, next) => {
  try {
    const data = await internalTransferService.updateTransfer(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) { handleServiceError(res, error, next); }
};

export const deleteTransfer = async (req, res, next) => {
  try {
    const data = await internalTransferService.cancelTransfer(req.params.id);
    res.json({ success: true, data });
  } catch (error) { handleServiceError(res, error, next); }
};

export const scheduleTransfer = async (req, res, next) => {
  try {
    const data = await internalTransferService.scheduleTransfer(req.params.id);
    res.json({ success: true, data });
  } catch (error) { handleServiceError(res, error, next); }
};

export const startTransfer = async (req, res, next) => {
  try {
    const data = await internalTransferService.startTransfer(req.params.id);
    res.json({ success: true, data });
  } catch (error) { handleServiceError(res, error, next); }
};

export const completeTransfer = async (req, res, next) => {
  try {
    const data = await internalTransferService.completeTransfer(req.params.id, req.user);
    res.json({ success: true, data });
  } catch (error) { handleServiceError(res, error, next); }
};
