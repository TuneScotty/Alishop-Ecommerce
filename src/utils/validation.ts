// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (at least 8 characters, one uppercase, one lowercase, one number)
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Phone number validation
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

// Credit card validation (basic format check)
export const isValidCreditCard = (cardNumber: string): boolean => {
  const cardNumberRegex = /^[0-9]{13,19}$/;
  return cardNumberRegex.test(cardNumber.replace(/\s/g, ''));
};

// CVV validation
export const isValidCVV = (cvv: string): boolean => {
  const cvvRegex = /^[0-9]{3,4}$/;
  return cvvRegex.test(cvv);
};

// Expiry date validation (MM/YY format)
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