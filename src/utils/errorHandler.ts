// Error handling utilities for API routes with custom error classes and response formatting
import { NextApiResponse } from 'next';

/**
 * Custom API error class with HTTP status code support
 * Purpose: Provides structured error handling with proper HTTP status codes for API responses
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Sends standardized 404 not found response
 * @param res - Next.js API response object
 * Purpose: Provides consistent 404 error responses across API endpoints
 */
export const notFound = (res: NextApiResponse) => {
  res.status(404).json({ message: 'Resource not found' });
};

/**
 * Central error handler for API routes with development stack traces
 * @param err - Error object (ApiError or standard Error)
 * @param res - Next.js API response object
 * Purpose: Provides centralized error response formatting with environment-aware stack traces
 */
export const errorHandler = (err: ApiError | Error, res: NextApiResponse) => {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
}; 