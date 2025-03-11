/**
 * Validates required environment variables
 * In production, this will exit the process if required variables are missing
 * In development, it will log warnings but allow the application to continue
 */
export function validateEnv() {
  // Required environment variables
  const required = [
    'MONGODB_URI',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'JWT_SECRET'
  ];
  
  // Optional environment variables with default values
  const optional = {
    'NODE_ENV': 'development',
    'DEBUG': 'false'
  };
  
  // Check for missing required variables
  const missing = required.filter(key => !process.env[key]);
  
  // Check for empty required variables
  const empty = required.filter(key => 
    process.env[key] !== undefined && process.env[key]?.trim() === ''
  );
  
  // Set default values for optional variables
  Object.entries(optional).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
      console.log(`Environment variable ${key} not set, using default: ${defaultValue}`);
    }
  });
  
  // Handle missing variables
  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(errorMessage);
    
    if (process.env.NODE_ENV === 'production') {
      console.error('Application cannot start in production without required environment variables');
      process.exit(1); // Exit in production to prevent running with missing vars
    }
  }
  
  // Handle empty variables
  if (empty.length > 0) {
    const warningMessage = `Empty required environment variables: ${empty.join(', ')}`;
    console.warn(warningMessage);
    
    if (process.env.NODE_ENV === 'production') {
      console.error('Application cannot start in production with empty environment variables');
      process.exit(1);
    }
  }
  
  // Validate NEXTAUTH_URL format
  if (process.env.NEXTAUTH_URL) {
    try {
      new URL(process.env.NEXTAUTH_URL);
    } catch (error) {
      console.error(`Invalid NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
      
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }
  
  // Log success in debug mode
  if (process.env.DEBUG === 'true') {
    console.log('Environment validation passed');
  }
  
  return true;
}