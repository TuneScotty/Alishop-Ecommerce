import mongoose from 'mongoose';

export interface IProduct extends mongoose.Document {
  name: string;
  slug: string;
  image: string;
  images: string[];
  price: number;
  currency?: string;
  rating: number;
  numReviews: number;
  countInStock: number;
  description: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isTrending: boolean;
  discount: number;
  aliExpressProductId?: string;
  aliExpressPrice?: number;
  aliExpressData?: {
    originalUrl: string;
    shippingOptions: any[];
    variants: any[];
    specifications: any[];
    returnPolicy?: any;
    videos?: string[];
    reviews?: any[];
  };
  reviews?: any[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    images: [String],
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      default: 0,
    },
    // AliExpress specific fields
    aliExpressProductId: {
      type: String,
      index: true,
    },
    aliExpressPrice: {
      type: Number,
    },
    aliExpressData: {
      originalUrl: String,
      shippingOptions: Array,
      variants: Array,
      specifications: Array,
      returnPolicy: Object,
      videos: [String],
      reviews: Array,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        name: String,
        rating: Number,
        comment: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create slug from name before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // If no image is set but images array has items, use the first one
  if (this.isModified('images') && (!this.image || this.image === '') && this.images && this.images.length > 0) {
    this.image = this.images[0];
  }
  
  next();
});

// Check if the model exists before creating it
const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);

export default Product as mongoose.Model<IProduct>; 