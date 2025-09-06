// Address management component with CRUD operations for user shipping addresses
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

interface Address {
  _id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

interface AddressFormData {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const initialAddressState: AddressFormData = {
  name: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
  isDefault: false
};

/**
 * Address management component with CRUD operations for user shipping addresses
 * @returns JSX.Element - Complete address management interface with form and list views
 * Purpose: Provides full address lifecycle management including add, edit, delete, and
 * default address selection with form validation and API integration
 */
export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(initialAddressState);
  const { showNotification } = useNotification();

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  /**
   * Fetches user addresses from API and updates component state
   * Purpose: Retrieves all saved addresses for the current user with error handling
   */
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/users/addresses');
      console.log('Fetched addresses:', data);
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      showNotification('Failed to load addresses', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles form input changes for address form fields
   * @param e - React change event from form inputs
   * Purpose: Updates form state with proper handling for checkboxes and text inputs
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Initializes form for adding new address
   * Purpose: Resets form state and shows address form in add mode
   */
  const handleAddAddress = () => {
    setEditingAddress(null);
    setFormData(initialAddressState);
    setShowForm(true);
  };

  /**
   * Initializes form for editing existing address
   * @param address - Address object to edit
   * Purpose: Populates form with existing address data for editing
   */
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address._id);
    setFormData({
      name: address.name,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.isDefault
    });
    setShowForm(true);
  };

  /**
   * Deletes address after user confirmation
   * @param id - Address ID to delete
   * Purpose: Removes address from user's saved addresses with confirmation dialog
   */
  const handleDeleteAddress = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await axios.delete(`/api/users/addresses?id=${id}`);
        showNotification('Address deleted successfully', 'success');
        fetchAddresses();
      } catch (error) {
        console.error('Error deleting address:', error);
        showNotification('Failed to delete address', 'error');
      }
    }
  };

  /**
   * Sets address as user's default shipping address
   * @param id - Address ID to set as default
   * Purpose: Updates address default status and refreshes address list
   */
  const handleSetDefault = async (id: string) => {
    try {
      await axios.put('/api/users/addresses', {
        addressId: id,
        updatedAddress: { isDefault: true }
      });
      showNotification('Default address updated', 'success');
      fetchAddresses();
    } catch (error) {
      console.error('Error updating default address:', error);
      showNotification('Failed to update default address', 'error');
    }
  };

  /**
   * Handles form submission for add/edit address operations
   * @param e - React form submission event
   * Purpose: Validates form data and submits to API for create or update operations
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const { name, addressLine1, city, state, postalCode, country } = formData;
    if (!name || !addressLine1 || !city || !state || !postalCode || !country) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      if (editingAddress) {
        // Update existing address
        console.log('Updating address:', editingAddress, formData);
        await axios.put('/api/users/addresses', {
          addressId: editingAddress,
          updatedAddress: formData
        });
        showNotification('Address updated successfully', 'success');
      } else {
        // Add new address
        console.log('Adding new address:', formData);
        await axios.post('/api/users/addresses', {
          address: formData
        });
        showNotification('Address added successfully', 'success');
      }
      
      // Reset form and fetch updated addresses
      setShowForm(false);
      setFormData(initialAddressState);
      setEditingAddress(null);
      fetchAddresses();
    } catch (error: any) {
      console.error('Error saving address:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save address';
      showNotification(errorMessage, 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">My Addresses</h2>
        <button
          onClick={handleAddAddress}
          className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Add New Address
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {/* Address Form */}
          {showForm && (
            <div className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address Line 1*
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City*
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      State/Province*
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Postal Code*
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Country*
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-main border-gray-300 rounded focus:ring-primary-main"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Set as default address
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingAddress(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark"
                  >
                    {editingAddress ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Address List */}
          {addresses.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">You don't have any saved addresses yet.</p>
              {!showForm && (
                <button
                  onClick={handleAddAddress}
                  className="mt-4 px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Add Your First Address
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div 
                  key={address._id}
                  className={`border p-4 rounded-md ${
                    address.isDefault 
                      ? 'border-primary-main bg-primary-light/10 dark:bg-primary-dark/10' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white">{address.name}</h3>
                        {address.isDefault && (
                          <span className="ml-2 text-xs bg-primary-main/20 text-primary-main dark:text-primary-light px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">{address.country}</p>
                      {address.phone && <p className="text-gray-600 dark:text-gray-300 mt-1">{address.phone}</p>}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-main dark:hover:text-primary-light"
                        aria-label="Edit address"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address._id)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
                        aria-label="Delete address"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {!address.isDefault && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => handleSetDefault(address._id)}
                        className="text-sm text-primary-main dark:text-primary-light hover:underline"
                      >
                        Set as Default
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 