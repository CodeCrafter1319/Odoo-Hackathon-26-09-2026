import receiptService from '../services/receiptService.js';

const handleServiceError = (res, error, next) => {
  if (error.statusCode) {
    res.status(error.statusCode);
  }
  next(error);
};

export const createReceipt = async (req, res, next) => {
  try {
    const receipt = await receiptService.createReceipt(req.body, req.user);
    res.status(201).json(receipt);
  } catch (error) {
    handleServiceError(res, error, next);
  }
};

export const getReceipts = async (req, res, next) => {
  try {
    const result = await receiptService.getReceipts(req.query);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(res, error, next);
  }
};

export const getReceiptById = async (req, res, next) => {
  try {
    const receipt = await receiptService.getReceiptById(req.params.id);
    res.status(200).json(receipt);
  } catch (error) {
    handleServiceError(res, error, next);
  }
};

export const updateReceipt = async (req, res, next) => {
  try {
    const receipt = await receiptService.updateReceipt(req.params.id, req.body);
    res.status(200).json(receipt);
  } catch (error) {
    handleServiceError(res, error, next);
  }
};

export const deleteReceipt = async (req, res, next) => {
  try {
    const receipt = await receiptService.deleteReceipt(req.params.id);
    res.status(200).json({ message: 'Receipt canceled successfully', receipt });
  } catch (error) {
    handleServiceError(res, error, next);
  }
};

export const validateReceipt = async (req, res, next) => {
  try {
    const receipt = await receiptService.validateReceipt(req.params.id, req.user);
    res.status(200).json({ message: 'Receipt validated successfully', receipt });
  } catch (error) {
    handleServiceError(res, error, next);
  }
};
