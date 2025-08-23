import dotenv from "dotenv";
dotenv.config();
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routes from "./src/routes/index";
import logger from "./src/config/logger";
import { ErrorMiddleware } from "./src/middleware/error.middleware";

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

app.use('/api', routes);

// Health check route
app.get('/health', (req, res) => {
  logger.info('Health check requested', { ip: req.ip });
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use(ErrorMiddleware.handleNotFound);

const PORT = process.env?.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening at port: ${PORT}`);
});

export default app;
