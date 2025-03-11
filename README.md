# AliShop - AliExpress Dropshipping E-commerce Platform

AliShop is a modern e-commerce platform built with Next.js, MongoDB, and TypeScript that enables dropshipping from AliExpress. It provides a complete solution for running an online store with product imports, order management, and secure payment processing.

## Features

- **User Authentication**: Secure login and registration with NextAuth
- **Product Management**: Import products directly from AliExpress
- **Shopping Cart**: Persistent cart with localStorage
- **Checkout Process**: Secure payment processing with Tranzila
- **Order Management**: Track orders and sync with AliExpress
- **Admin Dashboard**: Manage products, orders, and users
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## Prerequisites

- Node.js 14.x or higher
- MongoDB database (local or Atlas)
- AliExpress Developer Account (for dropshipping features)
- Tranzila Account (for payment processing)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/alishop.git
cd alishop
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory with the following variables:

```
# MongoDB Connection String
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
JWT_SECRET=your_jwt_secret_key

# AliExpress API Credentials
ALIEXPRESS_APP_KEY=your_aliexpress_app_key
ALIEXPRESS_APP_SECRET=your_aliexpress_app_secret
ALIEXPRESS_SESSION=your_aliexpress_session_token

# Tranzila Payment Gateway
NEXT_PUBLIC_TRANZILA_TERMINAL=your_tranzila_terminal
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   ├── config/          # Configuration files
│   ├── context/         # React context providers
│   ├── models/          # MongoDB models
│   ├── pages/           # Next.js pages
│   │   ├── api/         # API routes
│   │   ├── admin/       # Admin pages
│   ├── styles/          # CSS styles
│   └── utils/           # Utility functions
├── .env.local           # Environment variables
├── next.config.js       # Next.js configuration
└── tsconfig.json        # TypeScript configuration
```

## AliExpress Integration

To use the AliExpress dropshipping features:

1. Register as a developer on the [AliExpress Open Platform](https://openservice.aliexpress.com/)
2. Create a new application and select "Drop Shipping" as the category
3. Set your callback URL to `http://your-domain.com/api/aliexpress/auth/callback`
4. Once approved, add your App Key and App Secret to the `.env.local` file
5. Navigate to `/admin/aliexpress-setup` in your application to complete the setup

## Payment Processing

The application uses Tranzila for secure payment processing. To set up:

1. Register for a Tranzila account at [Tranzila.com](https://www.tranzila.com/)
2. Get your terminal name and add it to the `.env.local` file
3. The payment form is already integrated with secure hosted fields

## Deployment

This application can be deployed to Vercel with minimal configuration:

```bash
npm run build
npm run start
```

For production deployment, follow the [Next.js deployment documentation](https://nextjs.org/docs/deployment).

## License

This project is licensed under the MIT License - see the LICENSE file for details. 