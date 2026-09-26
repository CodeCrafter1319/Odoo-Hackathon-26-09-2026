import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

export const registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  // Basic validation
  if (!name || !email || !password || !role) {
    const error = new Error('Please add all fields');
    error.status = 400;
    throw error;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const error = new Error('Invalid email format');
    error.status = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('Password must be at least 6 characters');
    error.status = 400;
    throw error;
  }

  const allowedRoles = ['inventory_manager', 'warehouse_staff'];
  if (!allowedRoles.includes(role)) {
    const error = new Error('Invalid role');
    error.status = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase();

  // Check if user exists
  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    const error = new Error('User already exists');
    error.status = 409;
    throw error;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role,
  });

  if (user) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } else {
    const error = new Error('Invalid user data');
    error.status = 400;
    throw error;
  }
};

export const loginUser = async (userData) => {
  const { email, password } = userData;

  if (!email || !password) {
    const error = new Error('Please add all fields');
    error.status = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase();

  // Check for user email
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('User account is inactive');
    error.status = 401;
    throw error;
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id, user.role),
    };
  } else {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }
};
