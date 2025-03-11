import axios from 'axios';
import { IOrder } from '../models/Order';
import { IProduct } from '../models/Product';
import * as cheerio from 'cheerio';

export interface AliExpressOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export interface AliExpressProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  currency: string;
  images: string[];
  variants: any[];
  shipping: any;
  seller: any;
  ratings: any;
}

export class AliExpressService {
  private baseUrl: string;
  private apiUrl: string = 'https://api.aliexpress.com';
  private appKey: string;
  private appSecret: string;
  private markupPercentage: number = 30;
  private defaultCurrency: string = 'USD';
  private httpClient: any;

  constructor() {
    this.baseUrl = process.env.ALIEXPRESS_URL || 'https://www.aliexpress.com';
    this.appKey = process.env.ALIEXPRESS_APP_KEY || '';
    this.appSecret = process.env.ALIEXPRESS_APP_SECRET || '';
    
    this.httpClient = axios.create({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Referer': 'https://www.aliexpress.com/',
        'Origin': 'https://www.aliexpress.com'
      },
      timeout: 30000, // 30 seconds timeout
      maxRedirects: 5,
      validateStatus: (status) => status < 500 // Accept all status codes less than 500
    });
    
    // Add response interceptor for debugging
    this.httpClient.interceptors.response.use(
      (response: any) => {
        console.log(`Response status: ${response.status} for URL: ${response.config.url}`);
        return response;
      },
      (error: any) => {
        console.error(`Request error: ${error.message} for URL: ${error.config?.url}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Extract product data from search page HTML
   */
  private extractSearchData(html: string): any {
    try {
      const $ = cheerio.load(html);
      
      // Find script with data
      const scriptContent = $('script').filter(function() {
        return $(this).text().includes('_init_data_');
      }).text();
      
      // Extract JSON data using regex
      const dataMatch = scriptContent.match(/_init_data_\s*=\s*{\s*data:\s*({.+})\s*}/);
      
      if (dataMatch && dataMatch[1]) {
        // Clean up the JSON string
        const jsonStr = dataMatch[1]
          .replace(/undefined/g, 'null')
          .replace(/'/g, '"')
          .replace(/(\w+):/g, '"$1":');
        
        try {
          const data = JSON.parse(jsonStr);
          return data.root?.fields;
        } catch (error) {
          console.error('Error parsing JSON data:', error);
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting search data:', error);
      return null;
    }
  }

  /**
   * Parse search results from extracted data
   */
  private parseSearchResults(data: any): AliExpressProductData[] {
    if (!data || !data.mods || !data.mods.itemList || !data.mods.itemList.content) {
      return [];
    }
    
    const results = [];
    
    for (const item of data.mods.itemList.content) {
      try {
        const originalPrice = parseFloat(item.prices?.salePrice?.minPrice || '0');
        const markedUpPrice = this.applyMarkup(originalPrice);
        
        results.push({
          id: item.productId,
          name: item.title?.displayTitle || '',
          description: item.title?.seoTitle || '',
          price: markedUpPrice,
          originalPrice: originalPrice,
          currency: item.prices?.salePrice?.currencyCode || this.defaultCurrency,
          images: [item.image?.imgUrl?.startsWith('/') ? item.image.imgUrl.substring(1) : item.image?.imgUrl || ''],
          variants: [],
          shipping: {
            price: item.shipping?.price || 0,
            deliveryDays: item.shipping?.deliveryDays || '15-45'
          },
          seller: {
            name: item.store?.storeName || '',
            storeUrl: item.store?.storeUrl || '',
            rating: item.store?.storeRating || 0
          },
          ratings: {
            averageRating: item.evaluation?.starRating || 0,
            totalRatings: item.evaluation?.starCount || 0
          }
        });
      } catch (error) {
        console.error('Error parsing search result item:', error);
      }
    }
    
    return results;
  }

  /**
   * Search for products on AliExpress
   */
  async searchProducts(keyword: string, options: any = {}): Promise<AliExpressProductData[]> {
    try {
      const encodedKeyword = encodeURIComponent(keyword);
      const page = options.page || 1;
      const sortType = options.sortType || 'default';
      
      const url = `${this.baseUrl}/wholesale?trafficChannel=main&d=y&CatId=0&SearchText=${encodedKeyword}&ltype=wholesale&SortType=${sortType}&page=${page}`;
      
      const response = await this.httpClient.get(url);
      
      const data = this.extractSearchData(response.data);
      if (!data) {
        throw new Error('Failed to extract search data');
      }
      
      return this.parseSearchResults(data);
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  /**
   * Extract product details from product page HTML
   */
  private extractProductData(html: string, productId: string): any {
    try {
      console.log(`Extracting data for product ID: ${productId}`);
      const $ = cheerio.load(html);
      
      // First try to extract data from JSON in script tags
      let productData = this.extractProductDataFromScripts($, productId);
      
      // If script extraction fails, try to extract from HTML elements
      if (!productData || !productData.name) {
        console.log('Script extraction failed, trying HTML extraction');
        productData = this.extractProductDataFromHTML($, productId);
      }
      
      if (!productData || !productData.name) {
        console.log('Both extraction methods failed');
        return null;
      }
      
      return productData;
    } catch (error) {
      console.error('Error extracting product data:', error);
      return null;
    }
  }

  /**
   * Extract product data from script tags
   */
  private extractProductDataFromScripts($: any, productId: string): any {
    try {
      // Try different script patterns
      const scriptSelectors = [
        'script:contains("window.runParams")',
        'script:contains("data:")',
        'script:contains("productInfo")',
        'script:contains("_init_data_")'
      ];
      
      for (const selector of scriptSelectors) {
        const scriptContent = $(selector).text();
        if (!scriptContent) continue;
        
        // Try different regex patterns to extract JSON data
        const patterns = [
          /data:\s*({[^]*?}),\s*csrfToken/,
          /window\.runParams\s*=\s*({[^]*?})(;|\s*<\/script>)/,
          /_init_data_\s*=\s*{\s*data:\s*({.+})\s*}/,
          /data\s*:\s*({[^]*?productInfo[^]*?})/
        ];
        
        for (const pattern of patterns) {
          const match = scriptContent.match(pattern);
          if (match && match[1]) {
            try {
              // Clean up the JSON string
              const jsonStr = match[1]
                .replace(/undefined/g, 'null')
                .replace(/'/g, '"')
                .replace(/(\w+):/g, '"$1":');
              
              // Try to parse the JSON
              const data = JSON.parse(jsonStr);
              
              // Extract product info from different possible locations
              const productInfo = data.data?.productInfo || 
                                 data.productInfo || 
                                 data.root?.fields?.productInfo ||
                                 data.data?.root?.fields?.productInfo;
              
              if (productInfo) {
                console.log('Successfully extracted product data from script');
                
                // Extract price
                const priceInfo = productInfo.priceInfo || productInfo.price || {};
                const priceText = priceInfo.formatedActivityPrice || 
                                 priceInfo.formatedPrice || 
                                 productInfo.formatedActivityPrice || 
                                 productInfo.formatedPrice || '0';
                
                const priceMatch = priceText.toString().match(/[\d,.]+/);
                const originalPrice = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;
                
                return {
                  id: productId,
                  name: productInfo.subject || productInfo.title || productInfo.name || '',
                  description: productInfo.description || '',
                  price: this.applyMarkup(originalPrice),
                  originalPrice: originalPrice,
                  currency: productInfo.currencyCode || this.defaultCurrency,
                  images: productInfo.imagePathList || productInfo.images || [],
                  variants: productInfo.skuList || productInfo.variants || [],
                  shipping: {
                    price: 0,
                    deliveryDays: '15-45'
                  },
                  seller: {
                    name: productInfo.storeName || '',
                    storeUrl: productInfo.storeUrl || '',
                    rating: 0
                  },
                  ratings: {
                    averageRating: productInfo.averageStarRate || 0,
                    totalRatings: productInfo.totalEvaluation || 0
                  }
                };
              }
            } catch (error) {
              console.error('Error parsing JSON from script:', error);
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting from scripts:', error);
      return null;
    }
  }

  /**
   * Extract product data from HTML elements
   */
  private extractProductDataFromHTML($: any, productId: string): any {
    try {
      console.log('Extracting product data from HTML elements');
      
      // Try different selectors for product title
      const titleSelectors = [
        'h1.product-title',
        'h1.title',
        'h1',
        'div.product-title',
        'title'
      ];
      
      let title = '';
      for (const selector of titleSelectors) {
        const titleElement = $(selector).first();
        if (titleElement.length) {
          title = titleElement.text().trim();
          if (title) break;
        }
      }
      
      if (!title) {
        title = $('title').text().replace(' | AliExpress', '').trim();
      }
      
      console.log(`Extracted title: ${title}`);
      
      // Extract price
      const priceSelectors = [
        'div.product-price span.price',
        'span.product-price-value',
        'span.uniform-banner-box-price',
        'span.price'
      ];
      
      let originalPrice = 0;
      for (const selector of priceSelectors) {
        const priceElement = $(selector).first();
        if (priceElement.length) {
          const priceText = priceElement.text().trim();
          const priceMatch = priceText.match(/[\d,.]+/);
          if (priceMatch) {
            originalPrice = parseFloat(priceMatch[0].replace(/,/g, ''));
            break;
          }
        }
      }
      
      console.log(`Extracted price: ${originalPrice}`);
      
      // Extract images
      const images: string[] = [];
      $('div.image-gallery img, div.product-image img, img.main-image').each((_: any, img: any) => {
        const src = $(img).attr('src') || $(img).attr('data-src');
        if (src && !src.includes('placeholder') && !images.includes(src)) {
          images.push(src);
        }
      });
      
      // If no images found, try to find them in other ways
      if (images.length === 0) {
        $('img').each((_: any, img: any) => {
          const src = $(img).attr('src') || $(img).attr('data-src');
          const alt = $(img).attr('alt') || '';
          // Only include images that might be product images (larger than icons)
          if (src && src.includes('alicdn.com') && !src.includes('icon') && 
              alt && !images.includes(src)) {
            images.push(src);
          }
        });
      }
      
      console.log(`Extracted ${images.length} images`);
      
      // Extract description
      const description = $('div.product-description, meta[name="description"]').attr('content') || 
                         $('div.detail-desc').text().trim() || 
                         title;
      
      // Create product data object
      return {
        id: productId,
        name: title,
        description: description,
        price: this.applyMarkup(originalPrice),
        originalPrice: originalPrice,
        currency: this.defaultCurrency,
        images: images,
        variants: [],
        shipping: {
          price: 0,
          deliveryDays: '15-45'
        },
        seller: {
          name: $('a.store-name, span.shop-name').text().trim() || 'AliExpress Seller',
          storeUrl: $('a.store-name').attr('href') || '',
          rating: 0
        },
        ratings: {
          averageRating: parseFloat($('span.rating-value').text()) || 0,
          totalRatings: parseInt($('span.review-count').text().match(/\d+/)?.[0] || '0', 10) || 0
        }
      };
    } catch (error) {
      console.error('Error extracting from HTML:', error);
      return null;
    }
  }

  /**
   * Get detailed product information from AliExpress
   */
  async getProductDetails(productId: string): Promise<AliExpressProductData> {
    try {
      console.log(`Getting details for product ID: ${productId}`);
      
      // Try multiple URLs to increase chances of success
      const urls = [
        `${this.baseUrl}/item/${productId}.html`,
        `https://m.aliexpress.com/item/${productId}.html`,
        `https://www.aliexpress.us/item/${productId}.html`
      ];
      
      let productData = null;
      let lastError = null;
      
      // Try each URL until we get data
      for (const url of urls) {
        try {
          console.log(`Trying URL: ${url}`);
          
          // Add additional headers to avoid detection
          const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Referer': 'https://www.aliexpress.com/',
            'Origin': 'https://www.aliexpress.com'
          };
          
          const response = await this.httpClient.get(url, { 
            headers,
            timeout: 30000
          });
          
          // Try to extract product data
          const extractedData = this.extractProductData(response.data, productId);
          
          if (extractedData && extractedData.name) {
            productData = extractedData;
            console.log(`Successfully extracted product data from ${url}`);
            break;
          }
        } catch (error) {
          console.error(`Error fetching from ${url}:`, error);
          lastError = error;
        }
      }
      
      // If we still don't have data, try the AliExpress API directly
      if (!productData) {
        try {
          console.log('Trying AliExpress API directly');
          const apiUrl = `https://www.aliexpress.com/fn/search-pc/index?productId=${productId}`;
          
          const response = await this.httpClient.get(apiUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json, text/plain, */*',
              'Accept-Language': 'en-US,en;q=0.9',
              'Referer': `https://www.aliexpress.com/item/${productId}.html`,
              'Origin': 'https://www.aliexpress.com'
            }
          });
          
          if (response.data && response.data.data && response.data.data.productInfo) {
            const apiData = response.data.data.productInfo;
            
            // Extract price and apply markup
            const priceText = apiData.formatedActivityPrice || apiData.formatedPrice || '0';
            const originalPrice = parseFloat(priceText.replace(/[^\d.]/g, ''));
            const markedUpPrice = this.applyMarkup(originalPrice);
            
            productData = {
              id: productId,
              name: apiData.subject || apiData.title || `AliExpress Product ${productId}`,
              description: apiData.description || '',
              price: markedUpPrice,
              originalPrice: originalPrice,
              currency: apiData.currencyCode || this.defaultCurrency,
              images: apiData.imagePathList || [],
              variants: apiData.skuList?.map((sku: any) => ({
                name: sku.skuAttr || '',
                options: [{ value: sku.skuVal?.skuName || '', price: sku.skuVal?.skuAmount?.value || 0 }]
              })) || [],
              shipping: {
                price: 0,
                deliveryDays: '15-45'
              },
              seller: {
                name: apiData.storeName || '',
                storeUrl: apiData.storeUrl || '',
                rating: 0
              },
              ratings: {
                averageRating: apiData.averageStarRate || 0,
                totalRatings: apiData.totalEvaluation || 0
              }
            };
            
            console.log('Successfully extracted product data from API');
          }
        } catch (apiError) {
          console.error('Error fetching from API:', apiError);
        }
      }
      
      // If all extraction methods fail, create a minimal product data object with a fallback price
      if (!productData || !productData.name || productData.price === 0) {
        console.log('Creating minimal product data with fallback price');
        
        // Try to get a fallback price from a search
        let fallbackPrice = 0;
        try {
          const searchResults = await this.searchProducts(productId, { limit: 1 });
          if (searchResults.length > 0 && searchResults[0].price > 0) {
            fallbackPrice = searchResults[0].price;
            console.log(`Found fallback price from search: ${fallbackPrice}`);
          }
        } catch (searchError) {
          console.error('Error getting fallback price:', searchError);
        }
        
        return {
          id: productId,
          name: productData?.name || `AliExpress Product ${productId}`,
          description: productData?.description || 'Product details could not be fully extracted. Please check the original AliExpress page.',
          price: productData?.price || fallbackPrice || 9.99, // Use a default price if all else fails
          originalPrice: productData?.originalPrice || fallbackPrice || 9.99,
          currency: productData?.currency || this.defaultCurrency,
          images: productData?.images || [],
          variants: productData?.variants || [],
          shipping: productData?.shipping || {
            price: 0,
            deliveryDays: '15-45'
          },
          seller: productData?.seller || {
            name: 'AliExpress Seller',
            storeUrl: '',
            rating: 0
          },
          ratings: productData?.ratings || {
            averageRating: 0,
            totalRatings: 0
          }
        };
      }
      
      return productData;
    } catch (error: any) {
      console.error('Error getting product details:', error);
      throw new Error(`Failed to get product details: ${error.message}`);
    }
  }

  /**
   * Get product reviews from AliExpress
   */
  async getProductReviews(productId: string, page: number = 1): Promise<any> {
    try {
      const url = `https://feedback.aliexpress.com/pc/searchEvaluation.do?productId=${productId}&lang=en_US&country=US&page=${page}&pageSize=10&filter=all&sort=complex_default`;
      
      const response = await this.httpClient.get(url);
      
      if (response.data && response.data.data) {
        return {
          reviews: response.data.data.evaViewList || [],
          totalPages: response.data.data.totalPage || 1,
          evaluationStats: response.data.data.productEvaluationStatistic || {}
        };
      }
      
      return {
        reviews: [],
        totalPages: 1,
        evaluationStats: {}
      };
    } catch (error) {
      console.error('Error getting product reviews:', error);
      return {
        reviews: [],
        totalPages: 1,
        evaluationStats: {}
      };
    }
  }

  /**
   * Extract product ID from AliExpress URL
   */
  extractProductIdFromUrl(url: string): string {
    try {
      console.log(`Extracting product ID from URL: ${url}`);
      
      if (!url) {
        throw new Error('URL is empty or undefined');
      }
      
      // Clean the URL first
      url = url.trim();
      
      // Handle different URL formats
      // 1. Standard format: https://www.aliexpress.com/item/1234567890.html
      // 2. Mobile format: https://m.aliexpress.com/item/1234567890.html
      // 3. Short format: https://aliexpress.com/i/1234567890.html
      // 4. App format: https://a.aliexpress.com/_m0zXYZ
      // 5. Other possible formats
      
      const patterns = [
        /\/item\/(\d+)\.html/,      // Standard format
        /\/i\/(\d+)\.html/,         // Short format
        /\/product\/(\d+)\.html/,   // Another possible format
        /aliexpress\.com.*?(\d{10,})/, // Generic pattern to find a 10+ digit number
        /aliexpress.*?item\/(\d+)/,  // Mobile format without .html
        /a\.aliexpress\.com\/_m\w+/  // App format (needs special handling)
      ];
      
      // First try the standard patterns
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          console.log(`Found product ID: ${match[1]} using pattern: ${pattern}`);
          return match[1];
        }
      }
      
      // Special handling for app links (a.aliexpress.com/_mXXXXX)
      if (url.includes('a.aliexpress.com/_m')) {
        console.log('Detected app link format, using the last part of the URL as ID');
        const parts = url.split('_m');
        if (parts.length > 1) {
          const appId = parts[1].replace(/[^a-zA-Z0-9]/g, '');
          console.log(`Using app ID: ${appId}`);
          return appId;
        }
      }
      
      // If we still don't have an ID, try to find any sequence of 10+ digits
      const digitMatch = url.match(/(\d{10,})/);
      if (digitMatch && digitMatch[1]) {
        console.log(`Found product ID using digit pattern: ${digitMatch[1]}`);
        return digitMatch[1];
      }
      
      // If we get here, we couldn't extract the ID
      console.error(`Could not extract product ID from URL: ${url}`);
      throw new Error('Could not extract product ID from URL. Please check the URL format.');
    } catch (error: any) {
      console.error('Error extracting product ID from URL:', error);
      throw new Error(`Failed to extract product ID: ${error.message}`);
    }
  }

  /**
   * Apply markup to the original price
   */
  applyMarkup(originalPrice: number): number {
    return originalPrice * (1 + this.markupPercentage / 100);
  }

  /**
   * Import product from AliExpress to our database
   */
  async importProduct(productUrl: string): Promise<Partial<IProduct>> {
    try {
      console.log(`Starting import for product URL: ${productUrl}`);
      
      if (!productUrl) {
        throw new Error('Product URL is empty or undefined');
      }
      
      // Extract product ID from URL
      const productId = this.extractProductIdFromUrl(productUrl);
      console.log(`Successfully extracted product ID: ${productId}`);
      
      if (!productId) {
        throw new Error('Failed to extract product ID from URL');
      }
      
      // Get product details
      console.log(`Fetching product details for ID: ${productId}`);
      const productData = await this.getProductDetails(productId);
      
      if (!productData) {
        throw new Error('Failed to fetch product details');
      }
      
      console.log(`Successfully fetched product details: ${productData.name}`);
      
      // Get product reviews
      console.log(`Fetching product reviews for ID: ${productId}`);
      let reviewsData;
      try {
        reviewsData = await this.getProductReviews(productId);
        console.log(`Successfully fetched ${reviewsData.reviews?.length || 0} reviews`);
      } catch (reviewError) {
        console.error('Error fetching reviews, continuing without reviews:', reviewError);
        reviewsData = { reviews: [], totalPages: 0, evaluationStats: {} };
      }
      
      // Convert to our product model
      const importedProduct = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        originalPrice: productData.originalPrice,
        aliExpressPrice: productData.originalPrice,
        currency: productData.currency,
        images: productData.images,
        brand: productData.seller.name || 'AliExpress',
        rating: productData.ratings.averageRating,
        numReviews: productData.ratings.totalRatings,
        countInStock: 999, // Dropshipping model
        category: 'Other', // Default category
        aliExpressProductId: productId,
        aliExpressData: {
          originalUrl: productUrl,
          variants: productData.variants,
          specifications: [],
          shippingOptions: [productData.shipping],
          returnPolicy: null,
          reviews: reviewsData.reviews?.slice(0, 10) || [] // Include first 10 reviews as any type
        } as any // Use type assertion to avoid TypeScript error
      };
      
      console.log(`Product import completed successfully for: ${importedProduct.name}`);
      return importedProduct;
    } catch (error: any) {
      console.error('Error importing product:', error);
      throw new Error(`Failed to import product: ${error.message}`);
    }
  }

  /**
   * Place an order on AliExpress (not implemented)
   * This would require a different approach as it involves user authentication and checkout
   */
  async placeOrder(order: IOrder, product: IProduct): Promise<AliExpressOrderResult> {
    return {
      success: false,
      error: 'Direct ordering from AliExpress is not implemented. Please use the AliExpress website to place orders.'
    };
  }
}

export default new AliExpressService(); 