// Tranzila payment processing service with multiple payment methods and secure transaction handling
import axios from 'axios';

export interface TranzilaPaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
  redirectUrl?: string;
}

export type PaymentMethod = 'credit_card' | 'bit' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer';

export interface TranzilaPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  cardDetails?: {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvv: string;
    holderId?: string;
  };
  token?: string;
  paymentMethod?: PaymentMethod;
  returnUrl?: string; // For redirect-based payment methods
}

/**
 * Tranzila payment processing service with multiple payment methods and secure transaction handling
 * Purpose: Provides comprehensive payment processing capabilities through Tranzila gateway with
 * support for credit cards, digital wallets, and alternative payment methods
 */
export class TranzilaService {
  private apiUrl: string;
  private terminalName: string;
  private terminalPassword: string;

  constructor() {
    this.apiUrl = 'https://secure5.tranzila.com/cgi-bin/tranzila31.cgi';
    this.terminalName = process.env.TRANZILA_TERMINAL_NAME || '';
    this.terminalPassword = process.env.TRANZILA_TERMINAL_PASSWORD || '';
  }

  /**
   * Processes payment through Tranzila gateway with comprehensive error handling
   * @param paymentRequest - Payment details including amount, customer info, and payment method
   * @returns Payment result with success status, payment ID, or error details
   * Purpose: Handles secure payment processing with support for multiple payment methods
   */
  async processPayment(paymentRequest: TranzilaPaymentRequest): Promise<TranzilaPaymentResult> {
    try {
      if (!paymentRequest) {
        return {
          success: false,
          error: 'Invalid payment request',
        };
      }

      // Validate required fields
      if (!paymentRequest.amount || !paymentRequest.currency || !paymentRequest.description) {
        return {
          success: false,
          error: 'Missing required payment information',
        };
      }

      if (!paymentRequest.customer || !paymentRequest.customer.name || 
          !paymentRequest.customer.email || !paymentRequest.customer.phone) {
        return {
          success: false,
          error: 'Missing customer information',
        };
      }

      // Default to credit card if no payment method specified
      const paymentMethod = paymentRequest.paymentMethod || 'credit_card';

      // For redirect-based payment methods, we need a return URL
      if (['bit', 'paypal', 'apple_pay', 'google_pay'].includes(paymentMethod) && !paymentRequest.returnUrl) {
        return {
          success: false,
          error: `Return URL is required for ${paymentMethod} payment method`,
        };
      }

      // Prepare the payment data
      const paymentData = new URLSearchParams();
      paymentData.append('supplier', this.terminalName);
      paymentData.append('sum', String(paymentRequest.amount));
      paymentData.append('currency', paymentRequest.currency === 'ILS' ? '1' : '2'); // 1 for ILS, 2 for USD
      paymentData.append('pdesc', paymentRequest.description);
      
      // Add customer information
      paymentData.append('contact', paymentRequest.customer.name);
      paymentData.append('email', paymentRequest.customer.email);
      paymentData.append('phone', paymentRequest.customer.phone);

      // Handle different payment methods
      switch (paymentMethod) {
        case 'credit_card':
          return this.processCreditCardPayment(paymentRequest, paymentData);
        
        case 'bit':
          return this.processBitPayment(paymentRequest, paymentData);
        
        case 'paypal':
          return this.processPayPalPayment(paymentRequest, paymentData);
        
        case 'apple_pay':
          return this.processApplePayPayment(paymentRequest, paymentData);
        
        case 'google_pay':
          return this.processGooglePayPayment(paymentRequest, paymentData);
        
        case 'bank_transfer':
          return this.processBankTransferPayment(paymentRequest, paymentData);
        
        default:
          return {
            success: false,
            error: `Unsupported payment method: ${paymentMethod}`,
          };
      }
    } catch (error: any) {
      console.error('Error processing payment with Tranzila:', error);
      return {
        success: false,
        error: error?.message || 'Unknown payment error',
      };
    }
  }

  private async processCreditCardPayment(
    paymentRequest: TranzilaPaymentRequest, 
    paymentData: URLSearchParams
  ): Promise<TranzilaPaymentResult> {
    // Check if we have card details or token
    if (!paymentRequest.cardDetails && !paymentRequest.token) {
      return {
        success: false,
        error: 'Missing payment method (card details or token)',
      };
    }

    // Set transaction type to regular credit card transaction
    paymentData.append('cred_type', '1');
    
    // Add card details or token
    if (paymentRequest.token) {
      paymentData.append('TranzilaTK', paymentRequest.token);
    } else if (paymentRequest.cardDetails) {
      paymentData.append('ccno', paymentRequest.cardDetails.cardNumber);
      paymentData.append('expdate', paymentRequest.cardDetails.expMonth + paymentRequest.cardDetails.expYear.substring(2));
      paymentData.append('mycvv', paymentRequest.cardDetails.cvv);
      
      if (paymentRequest.cardDetails.holderId) {
        paymentData.append('id', paymentRequest.cardDetails.holderId);
      }
    }
    
    // Process the payment
    const response = await axios.post(this.apiUrl, paymentData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // Parse the response
    const responseData = response.data;
    
    // Check if the payment was successful
    if (responseData && responseData.Response === '000') {
      return {
        success: true,
        paymentId: `${responseData.index}-${responseData.AuthNr}`,
      };
    } else {
      const errorCode = responseData?.Response || 'unknown';
      return {
        success: false,
        error: `Payment failed: ${errorCode} - ${this.getErrorMessage(errorCode)}`,
      };
    }
  }

  private async processBitPayment(
    paymentRequest: TranzilaPaymentRequest, 
    paymentData: URLSearchParams
  ): Promise<TranzilaPaymentResult> {
    // Set transaction type to Bit payment
    paymentData.append('cred_type', 'bit');
    
    // Add return URL for redirect after payment
    paymentData.append('notify_url', paymentRequest.returnUrl || '');
    
    // Generate redirect URL for Bit payment
    const redirectUrl = `${this.apiUrl}?${paymentData.toString()}`;
    
    return {
      success: true,
      redirectUrl,
    };
  }

  private async processPayPalPayment(
    paymentRequest: TranzilaPaymentRequest, 
    paymentData: URLSearchParams
  ): Promise<TranzilaPaymentResult> {
    // Set transaction type to PayPal
    paymentData.append('cred_type', 'paypal');
    
    // Add return URL for redirect after payment
    paymentData.append('notify_url', paymentRequest.returnUrl || '');
    
    // Generate redirect URL for PayPal payment
    const redirectUrl = `${this.apiUrl}?${paymentData.toString()}`;
    
    return {
      success: true,
      redirectUrl,
    };
  }

  private async processApplePayPayment(
    paymentRequest: TranzilaPaymentRequest, 
    paymentData: URLSearchParams
  ): Promise<TranzilaPaymentResult> {
    // Set transaction type to Apple Pay
    paymentData.append('cred_type', 'apple_pay');
    
    // Add return URL for redirect after payment
    paymentData.append('notify_url', paymentRequest.returnUrl || '');
    
    // Generate redirect URL for Apple Pay payment
    const redirectUrl = `${this.apiUrl}?${paymentData.toString()}`;
    
    return {
      success: true,
      redirectUrl,
    };
  }

  private async processGooglePayPayment(
    paymentRequest: TranzilaPaymentRequest, 
    paymentData: URLSearchParams
  ): Promise<TranzilaPaymentResult> {
    // Set transaction type to Google Pay
    paymentData.append('cred_type', 'google_pay');
    
    // Add return URL for redirect after payment
    paymentData.append('notify_url', paymentRequest.returnUrl || '');
    
    // Generate redirect URL for Google Pay payment
    const redirectUrl = `${this.apiUrl}?${paymentData.toString()}`;
    
    return {
      success: true,
      redirectUrl,
    };
  }

  private async processBankTransferPayment(
    paymentRequest: TranzilaPaymentRequest, 
    paymentData: URLSearchParams
  ): Promise<TranzilaPaymentResult> {
    // Set transaction type to bank transfer
    paymentData.append('cred_type', 'bank_transfer');
    
    // Add return URL for redirect after payment
    paymentData.append('notify_url', paymentRequest.returnUrl || '');
    
    // Generate redirect URL for bank transfer payment
    const redirectUrl = `${this.apiUrl}?${paymentData.toString()}`;
    
    return {
      success: true,
      redirectUrl,
    };
  }

  async createPaymentToken(cardDetails: {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvv: string;
    holderId?: string;
  }): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      // Validate card details
      if (!cardDetails.cardNumber || !cardDetails.expMonth || !cardDetails.expYear || !cardDetails.cvv) {
        return {
          success: false,
          error: 'Missing required card details',
        };
      }
      
      // Prepare the token request data
      const tokenData = new URLSearchParams();
      tokenData.append('supplier', this.terminalName);
      tokenData.append('ccno', cardDetails.cardNumber);
      tokenData.append('expdate', cardDetails.expMonth + cardDetails.expYear.substring(2));
      tokenData.append('mycvv', cardDetails.cvv);
      
      if (cardDetails.holderId) {
        tokenData.append('id', cardDetails.holderId);
      }
      
      // Request a token
      const response = await axios.post(`${this.apiUrl}?tkn=1`, tokenData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Parse the response
      const responseData = response.data;
      
      // Check if the token was created successfully
      if (responseData && responseData.Response === '000' && responseData.TranzilaTK) {
        return {
          success: true,
          token: responseData.TranzilaTK,
        };
      } else {
        const errorCode = responseData?.Response || 'unknown';
        return {
          success: false,
          error: `Token creation failed: ${errorCode} - ${this.getErrorMessage(errorCode)}`,
        };
      }
    } catch (error: any) {
      console.error('Error creating payment token with Tranzila:', error);
      return {
        success: false,
        error: error?.message || 'Unknown token creation error',
      };
    }
  }

  getClientConfig() {
    return {
      terminalName: this.terminalName,
      apiUrl: this.apiUrl,
    };
  }

  getAvailablePaymentMethods(): PaymentMethod[] {
    return [
      'credit_card',
      'bit',
      'paypal',
      'apple_pay',
      'google_pay',
      'bank_transfer'
    ];
  }

  private getErrorMessage(responseCode: string): string {
    const errorCodes: Record<string, string> = {
      '001': 'Card company hasn\'t authorized the transaction',
      '002': 'Blocked card',
      '003': 'Invalid card number',
      '004': 'Card company temporarily unavailable',
      '005': 'Technical error',
      '006': 'Invalid transaction type',
      '007': 'Card company doesn\'t honor this card',
      '008': 'Terminal number doesn\'t match the supplier',
      '009': 'No such credit type',
      '010': 'Transaction timeout',
      '011': 'Card expired',
      '012': 'Wrong expiration date',
      '013': 'Installment count not allowed',
      '014': 'CVV check failed',
      '015': 'Card not valid for this transaction',
      '016': 'Sum exceeds card limit',
      '017': 'Terminal inactive',
      '018': 'Refused by Tranzila',
      '019': 'Suspected fraud',
      '020': 'Contact credit company',
      '021': 'Foreign cards are not allowed',
      '022': 'Authentication failed',
      '023': 'Authentication required',
      '024': 'Card holder ID check failed',
      '025': 'Duplicate transaction',
      '026': 'Terminal blocked',
      '027': 'Invalid response',
      '028': 'Card holder already has active deal',
      '029': 'Supplier not authorized for credit',
      '030': 'Supplier not authorized for installments',
      '031': 'Supplier not authorized for this credit type',
      '032': 'Supplier not authorized for foreign cards',
      '033': 'Supplier not authorized for club cards',
      '034': 'Card not valid for club installments',
      '035': 'Card not valid for credit type',
      '036': 'Card not valid for club credit',
      '037': 'Card not valid for foreign card credit',
      '038': 'Card not valid for JCB credit',
      '039': 'Card not valid for Amex credit',
      '040': 'Card not valid for Diners credit',
      '041': 'Invalid currency',
      '042': 'Invalid club code',
      '043': 'Invalid number of payments',
      '044': 'Invalid first payment',
      '045': 'Invalid fixed payment',
      '046': 'Invalid credit type',
      '047': 'Transaction sum too low',
      '048': 'Invalid expiration date',
      '049': 'Invalid CVV',
      '050': 'Invalid ID number',
      '051': 'Invalid email',
      '052': 'Invalid phone number',
      '053': 'Invalid address',
      '054': 'Invalid customer name',
      '055': 'Invalid product description',
      '056': 'Invalid transaction currency',
      '057': 'Invalid transaction sum',
      '058': 'Invalid terminal',
      '059': 'Invalid token',
      '060': 'Invalid request',
      '061': 'Duplicate request',
      '062': 'Transaction already processed',
      '063': 'Transaction not found',
      '064': 'Transaction cancelled',
      '065': 'Transaction expired',
      '066': 'Transaction failed',
      '067': 'Transaction pending',
      '068': 'Transaction rejected',
      '069': 'Transaction reversed',
      '070': 'Transaction approved',
      '071': 'Transaction not approved',
      '072': 'Transaction not completed',
      '073': 'Transaction not authorized',
      '074': 'Transaction not settled',
      '075': 'Transaction not voided',
      '076': 'Transaction not refunded',
      '077': 'Transaction not captured',
      '078': 'Transaction not cancelled',
      '079': 'Transaction not reversed',
      '080': 'Transaction not approved by 3D Secure',
      '081': 'Transaction not approved by AVS',
      '082': 'Transaction not approved by CVV',
      '083': 'Transaction not approved by fraud detection',
      '084': 'Transaction not approved by risk management',
      '085': 'Transaction not approved by velocity check',
      '086': 'Transaction not approved by address verification',
      '087': 'Transaction not approved by zip code verification',
      '088': 'Transaction not approved by phone verification',
      '089': 'Transaction not approved by email verification',
      '090': 'Transaction not approved by IP verification',
      '091': 'Transaction not approved by device verification',
      '092': 'Transaction not approved by browser verification',
      '093': 'Transaction not approved by geolocation verification',
      '094': 'Transaction not approved by time verification',
      '095': 'Transaction not approved by amount verification',
      '096': 'Transaction not approved by frequency verification',
      '097': 'Transaction not approved by recurrence verification',
      '098': 'Transaction not approved by merchant verification',
      '099': 'Transaction not approved by customer verification',
    };
    
    return errorCodes[responseCode] || 'Unknown error';
  }
}

export default new TranzilaService(); 