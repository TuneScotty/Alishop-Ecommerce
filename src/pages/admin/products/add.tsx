/**
 * Admin add product page providing a comprehensive form for creating new products.
 * Features product information input, image URL management, AliExpress integration fields,
 * pricing and inventory controls with validation and error handling for product creation.
 */

import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { useNotification } from '../../../context/NotificationContext';
import { isAdmin } from '../../../utils/auth';
import { authOptions } from '../../api/auth/[...nextauth]';

/**
 * AddProductPage component renders a comprehensive product creation form for administrators.
 * Includes fields for product details, pricing, inventory, images, and AliExpress integration
 * with dynamic image URL management and form validation for successful product creation.
 */
export default function AddProductPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    aliExpressUrl: '',
    aliExpressPrice: '',
    images: [''],
    countInStock: '100',
  });

  /**
   * Handles form input changes for basic product information fields.
   * @param e - React change event from input or textarea elements
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  /**
   * Updates a specific image URL in the images array at the given index.
   * @param index - Array index of the image URL to update
   * @param value - New image URL value
   */
  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({
      ...formData,
      images: newImages,
    });
  };

  /**
   * Adds a new empty image URL field to the images array for additional product images.
   */
  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, ''],
    });
  };

  /**
   * Removes an image URL field from the images array at the specified index.
   * @param index - Array index of the image URL field to remove
   */
  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: newImages.length > 0 ? newImages : [''],
    });
  };

  /**
   * Handles form submission for creating a new product with validation and API call.
   * @param e - React form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out empty image URLs
      const filteredImages = formData.images.filter(img => img.trim() !== '');
      
      // Validate required fields
      if (!formData.name || !formData.description || !formData.price) {
        showNotification('Name, description, and price are required', 'error');
        setIsSubmitting(false);
        return;
      }
      
      // If no images provided, use a placeholder
      if (filteredImages.length === 0) {
        filteredImages.push('https://via.placeholder.com/500x500?text=No+Image');
      }
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        aliExpressUrl: formData.aliExpressUrl,
        aliExpressPrice: formData.aliExpressPrice ? parseFloat(formData.aliExpressPrice) : 0,
        images: filteredImages,
        countInStock: parseInt(formData.countInStock),
      };

      const response = await axios.post('/api/products', productData);
      
      if (response.status === 201) {
        showNotification('Product created successfully', 'success');
        router.push('/admin/products');
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      showNotification(error.response?.data?.message || 'Failed to create product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Admin - Add Product" description="Add a new product to your store">
      <div className="bg-gradient-to-r from-primary-dark to-secondary-dark text-white py-12 mb-8">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Add Product</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Create a new product for your store.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Product Information</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                />
              </div>
              
              <div>
                <label htmlFor="countInStock" className="block text-sm font-medium text-gray-700 mb-1">
                  Count In Stock *
                </label>
                <input
                  type="number"
                  id="countInStock"
                  name="countInStock"
                  value={formData.countInStock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="aliExpressUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  AliExpress URL
                </label>
                <input
                  type="url"
                  id="aliExpressUrl"
                  name="aliExpressUrl"
                  value={formData.aliExpressUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                />
              </div>
              
              <div>
                <label htmlFor="aliExpressPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  AliExpress Price ($)
                </label>
                <input
                  type="number"
                  id="aliExpressPrice"
                  name="aliExpressPrice"
                  value={formData.aliExpressPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Images
              </label>
              {formData.images.map((image, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="Image URL"
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="ml-2 p-2 text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addImageField}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300"
              >
                Add Image URL
              </button>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition duration-300 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

/**
 * Server-side props function that validates admin authentication for add product page access.
 * Ensures only authenticated admin users can access the product creation form.
 * @param context - Next.js server-side context containing request and response objects
 * @returns Empty props object for authenticated admins or redirect for unauthorized users
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  // Check if user is authenticated and is an admin
  if (!session || !isAdmin(session)) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  
  return {
    props: {},
  };
}; 