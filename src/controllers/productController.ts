import { NextApiRequest, NextApiResponse } from 'next';
import Product, { IProduct } from '../models/Product';
import connectDB from '../config/database';

// Get all products
export const getProducts = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};
    
    const count = await Product.countDocuments({ ...keyword });
    const products = await (Product.find({ ...keyword }) as any)
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    res.status(200).json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single product by ID
export const getProductById = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    // Check if ID is undefined or invalid
    if (!req.query.id || req.query.id === 'undefined') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const product = await (Product.findById(req.query.id) as any);
    
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new product
export const createProduct = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const {
      name,
      description,
      price,
      aliExpressUrl,
      aliExpressPrice,
      images,
      category,
      countInStock,
    } = req.body;
    
    // Validate required fields
    if (!name || !description || !price) {
      return res.status(400).json({ message: 'Name, description, and price are required' });
    }
    
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Set default image if not provided
    const defaultImage = 'https://via.placeholder.com/500x500?text=No+Image';
    const productImages = images && images.length > 0 ? images : [defaultImage];
    
    const product = new Product({
      name,
      slug,
      description,
      price,
      aliExpressUrl,
      aliExpressPrice,
      images: productImages,
      image: productImages[0], // Set first image as main image
      category,
      countInStock: countInStock || 0,
      rating: 0,
      numReviews: 0,
    });
    
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update a product
export const updateProduct = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const {
      name,
      description,
      price,
      aliExpressUrl,
      aliExpressPrice,
      images,
      category,
      countInStock,
    } = req.body;
    
    const product = await (Product.findById(req.query.id) as any);
    
    if (product) {
      // Validate required fields
      if (!name || !description || !price) {
        return res.status(400).json({ message: 'Name, description, and price are required' });
      }
      
      // Generate slug from name if name has changed
      let slug = product.slug;
      if (name && name !== product.name) {
        slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }
      
      // Set default image if not provided
      const defaultImage = 'https://via.placeholder.com/500x500?text=No+Image';
      const productImages = images && images.length > 0 ? images : [defaultImage];
      
      product.name = name;
      product.slug = slug;
      product.description = description;
      product.price = price;
      product.aliExpressUrl = aliExpressUrl || product.aliExpressUrl;
      product.aliExpressPrice = aliExpressPrice !== undefined ? aliExpressPrice : product.aliExpressPrice;
      product.images = productImages;
      product.image = productImages[0]; // Set first image as main image
      product.category = category || product.category;
      product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
      
      const updatedProduct = await product.save();
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a product
export const deleteProduct = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const product = await (Product.findById(req.query.id) as any);
    
    if (product) {
      await product.deleteOne();
      res.status(200).json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create a product review
export const createProductReview = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const { rating, comment } = req.body;
    const userId = req.body.user; // Assuming user ID is passed in the request
    
    const product = await (Product.findById(req.query.id) as any);
    
    if (product) {
      // Check if the user already reviewed the product
      const alreadyReviewed = product.reviews?.find(
        (review: any) => review.user.toString() === userId.toString()
      );
      
      if (alreadyReviewed) {
        res.status(400).json({ message: 'Product already reviewed' });
        return;
      }
      
      const review = {
        name: req.body.name,
        rating: Number(rating),
        comment,
        user: userId,
      };
      
      if (!product.reviews) {
        product.reviews = [];
      }
      
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc: number, item: any) => item.rating + acc, 0) /
        product.reviews.length;
      
      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}; 