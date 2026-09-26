import Category from '../models/Category.js';
import Product from '../models/Product.js';

export const createCategory = async (data) => {
  const { name, description } = data;

  if (!name) {
    const err = new Error('Category name is required');
    err.status = 400;
    throw err;
  }

  const existing = await Category.findOne({ name });
  if (existing) {
    const err = new Error('Category name already exists');
    err.status = 409;
    throw err;
  }

  const category = await Category.create({ name, description });
  return category;
};

export const getCategories = async (query) => {
  const { page = 1, limit = 10, search, isActive, sortBy = 'name', sortOrder = 'asc' } = query;

  const filter = {};
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  } else {
    // Return active categories by default as per requirements, 
    // but if we want to support getting all, we might need a flag.
    // The requirement says: "return active categories by default"
    filter.isActive = true;
  }
  // If user explicitly asks for 'all', we could skip filter.isActive, but let's stick to true or false.
  if (query.isActive === 'all') {
    delete filter.isActive;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const total = await Category.countDocuments(filter);
  const data = await Category.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    throw err;
  }
  return category;
};

export const updateCategory = async (id, data) => {
  const { name, description, isActive } = data;

  const category = await Category.findById(id);
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    throw err;
  }

  if (name && name !== category.name) {
    const existing = await Category.findOne({ name });
    if (existing) {
      const err = new Error('Category name already exists');
      err.status = 409;
      throw err;
    }
  }

  category.name = name || category.name;
  if (description !== undefined) category.description = description;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();
  return category;
};

export const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    throw err;
  }

  const productsCount = await Product.countDocuments({ category: id });
  if (productsCount > 0) {
    const err = new Error('Cannot delete category referenced by products. Soft delete/deactivate it instead by updating isActive.');
    err.status = 400;
    throw err;
  }

  // Soft delete as requested
  category.isActive = false;
  await category.save();
  return category;
};
