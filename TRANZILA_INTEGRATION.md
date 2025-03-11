# Tranzila Payment Integration

This document explains how the Tranzila payment gateway has been integrated into the e-commerce website.

## Overview

Tranzila is an Israeli payment processor that offers various payment solutions including online credit card processing, mobile payments, virtual stores, and more. It's widely used in Israel for e-commerce transactions.

## Implementation Details

The integration consists of the following components:

1. **TranzilaService**: A service that handles communication with the Tranzila API
2. **TranzilaPaymentForm**: A React component that collects payment information from the user
3. **OrderController**: Updated to process payments using Tranzila instead of Stripe

## Configuration

To use Tranzila, you need to set the following environment variables in your `.env` file:

```
TRANZILA_TERMINAL_NAME=your_tranzila_terminal_name
TRANZILA_TERMINAL_PASSWORD=your_tranzila_terminal_password
NEXT_PUBLIC_TRANZILA_TERMINAL_NAME=your_tranzila_terminal_name
```

You can obtain these credentials by signing up for a Tranzila account at [https://www.tranzila.com/](https://www.tranzila.com/).

## How It Works

1. The user enters their shipping information and proceeds to the payment step
2. The user enters their payment details in the TranzilaPaymentForm
3. When the user submits the form, the payment details are sent to the server
4. The server uses the TranzilaService to process the payment
5. If the payment is successful, the order is created and the user is redirected to the order confirmation page

## Error Handling

The integration includes comprehensive error handling:

- Client-side validation of payment form fields
- Server-side validation of payment details
- Detailed error messages from the Tranzila API
- Fallback error handling for network issues

## Security Considerations

- Credit card details are sent directly to Tranzila and are not stored on the server
- The Tranzila terminal password is only used on the server side and is never exposed to the client
- All communication with the Tranzila API is done over HTTPS

## Testing

To test the integration, you can use the following test card details:

- Card Number: 4580000000000000
- Expiration Date: Any future date
- CVV: Any 3 digits
- ID Number: Any valid Israeli ID number

## Troubleshooting

If you encounter issues with the Tranzila integration, check the following:

1. Verify that the environment variables are set correctly
2. Check the server logs for error messages
3. Ensure that your Tranzila account is active and properly configured
4. Verify that you're using the correct API endpoint for your environment (test or production)

## References

- [Tranzila API Documentation](https://docs.tranzila.com/docs/payments-billing/c7do32dbrot42-tranzila-api-v2)
- [Tranzila Website](https://www.tranzila.com/) 