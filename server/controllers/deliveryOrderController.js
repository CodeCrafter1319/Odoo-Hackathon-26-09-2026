import deliveryOrderService from '../services/deliveryOrderService.js';

export const createDeliveryOrder = async (req, res, next) => {
  try {
    const deliveryOrder = await deliveryOrderService.createDeliveryOrder(req.body, req.user);
    res.status(201).json(deliveryOrder);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const getDeliveryOrders = async (req, res, next) => {
  try {
    const result = await deliveryOrderService.getDeliveryOrders(req.query);
    res.json(result);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const getDeliveryOrderById = async (req, res, next) => {
  try {
    const deliveryOrder = await deliveryOrderService.getDeliveryOrderById(req.params.id);
    res.json(deliveryOrder);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const updateDeliveryOrder = async (req, res, next) => {
  try {
    const deliveryOrder = await deliveryOrderService.updateDeliveryOrder(req.params.id, req.body);
    res.json(deliveryOrder);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const cancelDeliveryOrder = async (req, res, next) => {
  try {
    const deliveryOrder = await deliveryOrderService.cancelDeliveryOrder(req.params.id);
    res.json({ message: 'Delivery Order canceled successfully', deliveryOrder });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const pickDeliveryOrder = async (req, res, next) => {
  try {
    const deliveryOrder = await deliveryOrderService.pickDeliveryOrder(req.params.id);
    res.json({ message: 'Delivery Order picked successfully', deliveryOrder });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const packDeliveryOrder = async (req, res, next) => {
  try {
    const deliveryOrder = await deliveryOrderService.packDeliveryOrder(req.params.id);
    res.json({ message: 'Delivery Order packed successfully', deliveryOrder });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const validateDeliveryOrder = async (req, res, next) => {
  try {
    const deliveryOrder = await deliveryOrderService.validateDeliveryOrder(req.params.id, req.user);
    res.json({ message: 'Delivery Order validated successfully', deliveryOrder });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};
