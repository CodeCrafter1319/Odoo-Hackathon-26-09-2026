import stockLedgerService from '../services/stockLedgerService.js';

const handleServiceError = (res, error, next) => {
  if (error.statusCode) {
    res.status(error.statusCode);
  }
  next(error);
};

export const getLedgerEntries = async (req, res, next) => {
  try {
    const data = await stockLedgerService.getLedgerEntries(req.query);
    res.json({ success: true, ...data });
  } catch (error) {
    handleServiceError(res, error, next);
  }
};

export const getLedgerEntryById = async (req, res, next) => {
  try {
    const data = await stockLedgerService.getLedgerEntryById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    handleServiceError(res, error, next);
  }
};
