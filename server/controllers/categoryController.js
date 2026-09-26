import * as categoryService from '../services/categoryService.js';
import mongoose from 'mongoose';

export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const result = await categoryService.getCategories(req.query);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }
    const category = await categoryService.getCategoryById(req.params.id);
    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }
    const category = await categoryService.deleteCategory(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Category soft-deleted successfully',
      data: category,
    });
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};
