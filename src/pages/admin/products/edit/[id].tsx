import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../../../../components/Layout';
import { useNotification } from '../../../../context/NotificationContext';
import { isAdmin } from '../../../../utils/auth';
import { serializeSession } from '../../../../utils/session';
import { authOptions } from '../../../api/auth/[...nextauth]';

export default function EditProductPage({ productId }: { productId: string }) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    aliExpressUrl: '',
    aliExpressPrice: '',
    images: [''],
    countInStock: '0',
  });

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/products/${productId}`);
        const product = response.data;
        
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          aliExpressUrl: product.aliExpressUrl || '',
          aliExpressPrice: product.aliExpressPrice ? product.aliExpressPrice.toString() : '',
          images: product.images && product.images.length > 0 ? product.images : [''],
          countInStock: product.countInStock.toString(),
        });
      } catch (error) {
        console.error('Error fetching product:', error);
        showNotification('Failed to load product data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, showNotification]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({
      ...formData,
      images: newImages,
    });
  };

  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, ''],
    });
  };

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: newImages.length > 0 ? newImages : [''],
    });
  };

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

      const response = await axios.put(`/api/products/${productId}`, productData);
      
      if (response.status === 200) {
        showNotification('Product updated successfully', 'success');
        router.push('/admin/products');
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      showNotification(error.response?.data?.message || 'Failed to update product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Admin - Edit Product" description="Edit an existing product">
      <div className="bg-gradient-to-r from-primary-dark to-secondary-dark text-white py-12 mb-8">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Edit Product</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Update the details of your product.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-main"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="price" className="block text-gray-700 dark:text-gray-300 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="countInStock" className="block text-gray-700 dark:text-gray-300 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  id="countInStock"
                  name="countInStock"
                  value={formData.countInStock}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="aliExpressUrl" className="block text-gray-700 dark:text-gray-300 mb-2">
                  AliExpress URL (optional)
                </label>
                <input
                  type="text"
                  id="aliExpressUrl"
                  name="aliExpressUrl"
                  value={formData.aliExpressUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="aliExpressPrice" className="block text-gray-700 dark:text-gray-300 mb-2">
                  AliExpress Price (optional)
                </label>
                <input
                  type="number"
                  id="aliExpressPrice"
                  name="aliExpressPrice"
                  value={formData.aliExpressPrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Product Images
                </label>
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="Image URL"
                      className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="ml-2 p-2 text-red-500 hover:text-red-700"
                      aria-label="Remove image"
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
                  className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300"
                >
                  Add Image
                </button>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300 mr-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-md text-white font-medium ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-main hover:bg-primary-dark transition duration-300'
                }`}
              >
                {isSubmitting ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  // Check if user is authenticated and is an admin
  if (!session || !isAdmin(session)) {
    return {
      redirect: {
        destination: '/login?redirect=/admin/products',
        permanent: false,
      },
    };
  }
  
  const productId = context.params?.id as string;
  
  // Serialize the session data to avoid undefined values
  const serializedSession = serializeSession(session);
  
  return {
    props: {
      session: serializedSession,
      productId,
    },
  };
}; 