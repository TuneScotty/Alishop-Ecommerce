# E-Commerce Website

A modern e-commerce platform built with Next.js, React, and MongoDB.

## Features

- User authentication and authorization
- Product catalog with search and filtering
- Shopping cart functionality
- Checkout process
- Order management
- Admin dashboard for product management
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **State Management**: React Context API
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB connection

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This application can be deployed on Vercel, Netlify, or any other platform that supports Next.js applications. 