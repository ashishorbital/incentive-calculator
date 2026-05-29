import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import carRoutes from './routes/cars.js';
import carsPublicRoutes from './routes/carsPublic.js';
import slabRoutes from './routes/slabs.js';
import salesRoutes from './routes/sales.js';
import incentiveRoutes from './routes/incentives.js';
import dashboardRoutes from './routes/dashboard.js';
import reportRoutes from './routes/reports.js';
import notificationRoutes from './routes/notifications.js';
import profileRoutes from './routes/profile.js';
import { AppError } from './utils/errors.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.redirect(process.env.CLIENT_URL);
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/cars', carsPublicRoutes);
app.use('/api/slabs', slabRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/incentives', incentiveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);

app.use((err, _req, res, _next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  if (status >= 500) console.error(err);
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Incentive API running on http://localhost:${PORT}`);
});
