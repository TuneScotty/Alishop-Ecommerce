import { NextApiRequest, NextApiResponse } from 'next';
import tranzilaService, { PaymentMethod } from '../../../services/tranzilaService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      amount,
      currency,
      description,
      paymentMethod,
      returnUrl,
      customer,
    } = req.body;

    // Validate required fields
    if (!amount || !currency || !description || !paymentMethod || !returnUrl || !customer) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate customer information
    if (!customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({ message: 'Missing customer information' });
    }

    // Process the payment request
    const paymentResult = await tranzilaService.processPayment({
      amount,
      currency,
      description,
      paymentMethod: paymentMethod as PaymentMethod,
      returnUrl,
      customer,
    });

    if (paymentResult.success && paymentResult.redirectUrl) {
      return res.status(200).json({ redirectUrl: paymentResult.redirectUrl });
    } else {
      return res.status(400).json({ message: paymentResult.error || 'Failed to create payment redirect' });
    }
  } catch (error: any) {
    console.error('Error creating payment redirect:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
} 