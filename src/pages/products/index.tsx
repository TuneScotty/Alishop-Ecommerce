import { GetServerSideProps } from 'next';
import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import Layout from '../../components/Layout';
import ProductCard from '../../components/ProductCard';
import { IProduct } from '../../models/Product';
import { useNotification } from '../../context/NotificationContext';

interface ProductsPageProps {
  products: IProduct[];
  pages: number;
  page: number;
}

export default function ProductsPage({ products, pages, page }: ProductsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { showNotification } = useNotification();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Searching for: ${searchTerm}`);
  };

  const addToCart = (product: IProduct) => {
    try {
      if (!product || !product._id) {
        showNotification('Invalid product', 'error');
        return;
      }
      
      const existingCart = JSON.parse(sessionStorage.getItem('cart') || '[]');
      
      const existingItemIndex = existingCart.findIndex(
        (item: any) => item.product && item.product._id === product._id
      );
      
      if (existingItemIndex >= 0) {
        existingCart[existingItemIndex].quantity = (existingCart[existingItemIndex].quantity || existingCart[existingItemIndex].qty || 0) + 1;
        showNotification(`Updated quantity in cart (${existingCart[existingItemIndex].quantity}x)`, 'success');
      } else {
        existingCart.push({
          product: product,
          quantity: 1
        });
        showNotification(`${product.name} added to cart`, 'success');
      }
      
      sessionStorage.setItem('cart', JSON.stringify(existingCart));
      
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Failed to add item to cart', 'error');
    }
  };

  return (
    <Layout title="AliShop - Products" description="Browse our wide range of products">
      <div className="bg-gradient-to-r from-primary-dark to-secondary-dark text-white py-16 mb-10">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Products</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Browse our extensive collection of high-quality products at competitive prices.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Search</h2>
            <form onSubmit={handleSearch}>
              <div className="flex">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="flex-grow px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-main dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="submit"
                  className="bg-primary-main text-white px-6 py-3 rounded-r-md hover:bg-primary-dark transition duration-300"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {products.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Products Found</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search to find what you're looking for.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} onAddToCart={addToCart} />
                ))}
              </div>

              {pages > 1 && (
                <div className="flex justify-center mt-16">
                  <div className="flex space-x-2">
                    {[...Array(pages)].map((_, i) => (
                      <a
                        key={i}
                        href={`/products?page=${i + 1}`}
                        className={`px-4 py-2 rounded-md ${
                          page === i + 1
                            ? 'bg-primary-main text-white'
                            : 'bg-white dark:bg-gray-700 text-primary-main dark:text-white hover:bg-primary-light/20 dark:hover:bg-gray-600'
                        }`}
                      >
                        {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  try {
    const page = query.page || 1;
    const keyword = query.keyword || '';
    
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/products?page=${page}&keyword=${keyword}`
    );
    
    return {
      props: {
        products: res.data.products,
        page: res.data.page,
        pages: res.data.pages,
      },
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      props: {
        products: [],
        page: 1,
        pages: 1,
      },
    };
  }
}; 