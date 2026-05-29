import { AppError } from '../utils/errors.js';

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403));
    }
    next();
  };
}

export const adminOnly = requireRole('admin');
export const officerOnly = requireRole('sales_officer');
export const anyAuthenticated = requireRole('admin', 'sales_officer');
