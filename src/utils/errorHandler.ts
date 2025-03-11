import { NextApiResponse } from 'next';

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFound = (res: NextApiResponse) => {
  res.status(404).json({ message: 'Resource not found' });
};

export const errorHandler = (err: ApiError | Error, res: NextApiResponse) => {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
}; 