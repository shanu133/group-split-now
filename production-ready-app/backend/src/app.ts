import express from 'express';
import { setRoutes } from './routes/index';
import errorHandler from './middlewares/errorHandler';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Set up routes
setRoutes(app);

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});