// Input validation utilities for forms, payment data, and user registration

/**
 * Validates email address format using standard email regex pattern
 * @param email - Email string to validate
 * @returns Boolean indicating whether email format is valid
 * Purpose: Provides client and server-side email validation for user registration and forms
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength with security requirements
 * @param password - Password string to validate
 * @returns Boolean indicating whether password meets security criteria
 * Purpose: Enforces password security policy requiring minimum 8 characters with mixed case and numbers
 */
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validates phone number format for international and domestic numbers
 * @param phone - Phone number string to validate
 * @returns Boolean indicating whether phone number format is valid
 * Purpose: Validates phone numbers for user profiles and shipping addresses
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates credit card number format with basic length and digit checks
 * @param cardNumber - Credit card number string to validate
 * @returns Boolean indicating whether card number format is valid
 * Purpose: Provides basic credit card format validation for payment processing
 */
export const isValidCreditCard = (cardNumber: string): boolean => {
  const cardNumberRegex = /^[0-9]{13,19}$/;
  return cardNumberRegex.test(cardNumber.replace(/\s/g, ''));
};

/**
 * Validates credit card CVV security code format
 * @param cvv - CVV string to validate
 * @returns Boolean indicating whether CVV format is valid
 * Purpose: Validates CVV codes for secure payment processing
 */
export const isValidCVV = (cvv: string): boolean => {
  const cvvRegex = /^[0-9]{3,4}$/;
  return cvvRegex.test(cvv);
};

/**
 * Validates credit card expiry date format and ensures future date
 * @param expiryDate - Expiry date string in MM/YY format
 * @returns Boolean indicating whether expiry date is valid and not expired
 * Purpose: Validates credit card expiry dates for payment processing with date logic
 */
export const isValidExpiryDate = (expiryDate: string): boolean => {
  const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!expiryRegex.test(expiryDate)) return false;
  
  const [month, year] = expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expYear = parseInt(year, 10);
  const expMonth = parseInt(month, 10);
  
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  
  return true;
}; 