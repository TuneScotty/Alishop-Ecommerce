// AliExpress Open Platform API service for official API integration and dropshipping operations
import axios from 'axios';
import crypto from 'crypto';
import { IOrder } from '../models/Order';
import { IProduct } from '../models/Product';

export interface AliExpressToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
}

export interface AliExpressProductDetails {
  product_id: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency_code: string;
  };
  images: string[];
  variants: any[];
  shipping_options: any[];
  specifications: any[];
  seller: {
    id: string;
    name: string;
    store_url: string;
    ratings: {
      positive_feedback_rate: number;
      seller_level: string;
    };
  };
  ratings: {
    average_rating: number;
    rating_count: number;
  };
  stock: number;
}

/**
 * AliExpress Open Platform API service for official API integration and dropshipping operations
 * Purpose: Provides official AliExpress API integration for authorized product access,
 * order management, and tracking through the AliExpress Open Platform
 */
export interface AliExpressOrderResult {
  success: boolean;
  order_id?: string;
  error?: string;
  tracking_info?: {
    tracking_number: string;
    carrier: string;
    status: string;
  }[];
}

export class AliExpressOpenPlatformService {
  private apiUrl: string = 'https://api.aliexpress.com';
  private appKey: string;
  private appSecret: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private markupPercentage: number = 30;

  constructor() {
    this.appKey = process.env.ALIEXPRESS_APP_KEY || '';
    this.appSecret = process.env.ALIEXPRESS_APP_SECRET || '';
    
    // Load tokens if available
    this.accessToken = process.env.ALIEXPRESS_ACCESS_TOKEN || null;
    this.refreshToken = process.env.ALIEXPRESS_REFRESH_TOKEN || null;
    
    if (process.env.ALIEXPRESS_TOKEN_EXPIRY) {
      this.tokenExpiry = new Date(process.env.ALIEXPRESS_TOKEN_EXPIRY);
    }
    
    // Set markup percentage from env if available
    if (process.env.ALIEXPRESS_MARKUP_PERCENTAGE) {
      this.markupPercentage = parseInt(process.env.ALIEXPRESS_MARKUP_PERCENTAGE, 10);
    }
  }

  private async ensureValidToken(): Promise<string> {
    // Check if token is expired or about to expire (within 5 minutes)
    const now = new Date();
    const tokenIsExpired = !this.tokenExpiry || 
      (this.tokenExpiry.getTime() - now.getTime() < 5 * 60 * 1000);
    
    if (!this.accessToken || tokenIsExpired) {
      if (this.refreshToken) {
        // Try to refresh the token
        await this.refreshAccessToken();
      } else {
        throw new Error('No valid access token available. Please authenticate with AliExpress.');
      }
    }
    
    return this.accessToken!;
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/auth/token/refresh`,
        {
          app_key: this.appKey,
          refresh_token: this.refreshToken,
        }
      );
      
      if (response.data.error) {
        throw new Error(`Failed to refresh token: ${response.data.error_description}`);
      }
      
      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      
      // Calculate expiry time
      const expiresIn = response.data.expires_in;
      this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);
      
      // In a real app, you would save these tokens to a secure storage
    } catch (error: any) {
      console.error('Error refreshing AliExpress token:', error);
      throw new Error('Failed to refresh AliExpress token');
    }
  }

  private generateSignature(params: Record<string, any>): string {
    // Sort parameters alphabetically
    const sortedParams = Object.keys(params).sort().reduce(
      (result: Record<string, any>, key) => {
        result[key] = params[key];
        return result;
      },
      {}
    );
    
    // Create string to sign
    let stringToSign = '';
    for (const key in sortedParams) {
      stringToSign += `${key}${sortedParams[key]}`;
    }
    
    // Add app secret
    stringToSign = this.appSecret + stringToSign + this.appSecret;
    
    // Generate MD5 hash
    return crypto.createHash('md5').update(stringToSign).digest('hex').toUpperCase();
  }

  private async makeApiRequest(
    endpoint: string, 
    method: string, 
    params: Record<string, any> = {}
  ): Promise<any> {
    try {
      const token = await this.ensureValidToken();
      
      // Add common parameters
      const commonParams: Record<string, any> = {
        app_key: this.appKey,
        timestamp: new Date().toISOString(),
        format: 'json',
        v: '2.0',
        sign_method: 'md5',
      };
      
      const allParams = { ...commonParams, ...params };
      
      // Generate signature
      const signature = this.generateSignature(allParams);
      allParams.sign = signature;
      
      // Make request
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      
      let response;
      if (method.toUpperCase() === 'GET') {
        response = await axios.get(`${this.apiUrl}${endpoint}`, { 
          params: allParams,
          ...config 
        });
      } else {
        response = await axios.post(`${this.apiUrl}${endpoint}`, allParams, config);
      }
      
      if (response.data.error_response) {
        throw new Error(`API error: ${response.data.error_response.msg}`);
      }
      
      return response.data;
    } catch (error: any) {
      console.error(`Error making AliExpress API request to ${endpoint}:`, error);
      throw error;
    }
  }

  async searchProducts(keyword: string, options: any = {}): Promise<any[]> {
    try {
      const params = {
        keywords: keyword,
        page_size: options.pageSize || 20,
        page_no: options.page || 1,
        sort: options.sort || 'default',
        category_id: options.categoryId || 0,
        target_currency: options.currency || 'USD',
        target_language: options.language || 'en',
        ship_to_country: options.country || 'US',
      };
      
      const response = await this.makeApiRequest('/openapi/product/search', 'GET', params);
      return response.products || [];
    } catch (error) {
      console.error('Error searching AliExpress products:', error);
      return [];
    }
  }

  async getProductDetails(productId: string): Promise<AliExpressProductDetails | null> {
    try {
      const params = {
        product_id: productId,
      };
      
      const response = await this.makeApiRequest('/openapi/product/details', 'GET', params);
      return response.product || null;
    } catch (error) {
      console.error(`Error getting AliExpress product details for ${productId}:`, error);
      return null;
    }
  }

  async getProductReviews(productId: string, page: number = 1): Promise<any> {
    try {
      const params = {
        product_id: productId,
        page_size: 20,
        page_no: page,
      };
      
      const response = await this.makeApiRequest('/openapi/product/reviews', 'GET', params);
      return response.reviews || { items: [], total: 0 };
    } catch (error) {
      console.error(`Error getting AliExpress product reviews for ${productId}:`, error);
      return { items: [], total: 0 };
    }
  }

  async importProduct(productId: string): Promise<Partial<IProduct>> {
    try {
      const productDetails = await this.getProductDetails(productId);
      
      if (!productDetails) {
        throw new Error('Failed to fetch product details');
      }
      
      // Calculate price with markup
      const originalPrice = productDetails.price.amount;
      const price = this.applyMarkup(originalPrice);
      
      // Get reviews
      const reviews = await this.getProductReviews(productId);
      
      // Create product object
      const product: Partial<IProduct> = {
        name: productDetails.title,
        description: productDetails.description,
        price: price,
        currency: productDetails.price.currency_code,
        image: productDetails.images[0] || '',
        images: productDetails.images,
        countInStock: productDetails.stock,
        rating: productDetails.ratings.average_rating,
        numReviews: productDetails.ratings.rating_count,
        aliExpressProductId: productId,
        aliExpressPrice: originalPrice,
        aliExpressData: {
          originalUrl: `https://www.aliexpress.com/item/${productId}.html`,
          shippingOptions: productDetails.shipping_options,
          variants: productDetails.variants,
          specifications: productDetails.specifications,
          reviews: reviews.items,
        },
      };
      
      return product;
    } catch (error: any) {
      console.error(`Error importing AliExpress product ${productId}:`, error);
      throw new Error(`Failed to import product: ${error.message}`);
    }
  }

  applyMarkup(originalPrice: number): number {
    const markup = 1 + (this.markupPercentage / 100);
    // Round to 2 decimal places and apply psychological pricing (.99)
    return Math.floor(originalPrice * markup * 100 + 99) / 100;
  }

  async placeOrder(order: IOrder): Promise<AliExpressOrderResult> {
    try {
      // Ensure we have a valid token
      await this.ensureValidToken();
      
      // Prepare order items
      const items = order.orderItems.map(item => ({
        product_id: item.aliExpressProductId,
        quantity: item.quantity,
        variant_id: item.variant || undefined,
        shipping_method: item.shippingMethod || undefined,
      }));
      
      // Prepare shipping address
      const shippingAddress = {
        contact_person: order.shippingAddress.name,
        address_line1: order.shippingAddress.addressLine1,
        address_line2: order.shippingAddress.addressLine2 || '',
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postal_code: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
        phone: order.shippingAddress.phone || '',
      };
      
      // Place order
      const params = {
        items: JSON.stringify(items),
        shipping_address: JSON.stringify(shippingAddress),
        logistics_service_name: 'standard',
      };
      
      const response = await this.makeApiRequest('/openapi/order/place', 'POST', params);
      
      if (!response.order_id) {
        throw new Error('Failed to place order: No order ID returned');
      }
      
      return {
        success: true,
        order_id: response.order_id,
      };
    } catch (error: any) {
      console.error('Error placing AliExpress order:', error);
      return {
        success: false,
        error: error.message || 'Unknown error placing order',
      };
    }
  }

  async getOrderStatus(aliExpressOrderId: string): Promise<any> {
    try {
      const params = {
        order_id: aliExpressOrderId,
      };
      
      const response = await this.makeApiRequest('/openapi/order/status', 'GET', params);
      return response.order || null;
    } catch (error) {
      console.error(`Error getting AliExpress order status for ${aliExpressOrderId}:`, error);
      return null;
    }
  }

  async getTrackingInfo(aliExpressOrderId: string): Promise<any> {
    try {
      const params = {
        order_id: aliExpressOrderId,
      };
      
      const response = await this.makeApiRequest('/openapi/logistics/tracking', 'GET', params);
      return response.tracking_info || null;
    } catch (error) {
      console.error(`Error getting tracking info for order ${aliExpressOrderId}:`, error);
      return null;
    }
  }

  getAuthUrl(redirectUri: string): string {
    const params = new URLSearchParams({
      app_key: this.appKey,
      redirect_uri: redirectUri,
      state: 'aliexpress',
      view: 'web',
    });
    
    return `https://auth.aliexpress.com/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<AliExpressToken> {
    try {
      const params = {
        app_key: this.appKey,
        app_secret: this.appSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      };
      
      const response = await axios.post(
        'https://api.aliexpress.com/auth/token',
        params
      );
      
      if (response.data.error) {
        throw new Error(`Failed to exchange code for token: ${response.data.error_description}`);
      }
      
      // Save tokens
      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      
      // Calculate expiry time
      const expiresIn = response.data.expires_in;
      this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);
      
      return response.data;
    } catch (error: any) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to exchange code for token');
    }
  }
}

// Create singleton instance
const aliExpressOpenPlatformService = new AliExpressOpenPlatformService();
export default aliExpressOpenPlatformService; 