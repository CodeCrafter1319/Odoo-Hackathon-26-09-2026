import * as locationService from '../services/locationService.js';

export const createLocation = async (req, res, next) => {
  try {
    const location = await locationService.createLocation(req.body);
    res.status(201).json(location);
  } catch (error) {
    next(error);
  }
};

export const getLocations = async (req, res, next) => {
  try {
    const result = await locationService.getLocations(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getLocationById = async (req, res, next) => {
  try {
    const location = await locationService.getLocationById(req.params.id);
    res.status(200).json(location);
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const location = await locationService.updateLocation(req.params.id, req.body);
    res.status(200).json(location);
  } catch (error) {
    next(error);
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    const location = await locationService.deleteLocation(req.params.id);
    res.status(200).json({ message: 'Location deleted (soft)', location });
  } catch (error) {
    next(error);
  }
};
