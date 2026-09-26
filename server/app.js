import express from 'express';
import cors from 'cors';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import apiRoutes from './routes/index.js';

const app = express();

// Middleware
app.use(cors()); // Allow CORS for React frontend
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
