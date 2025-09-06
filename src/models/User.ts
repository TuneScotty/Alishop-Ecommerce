// User model with authentication, address management, and preferences functionality
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String, default: '' },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, default: '' },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const preferencesSchema = new mongoose.Schema({
  currency: { type: String, default: 'USD' },
  language: { type: String, default: 'en' },
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
});

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  phone?: string;
  shippingAddresses: {
    _id?: string;
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
  }[];
  preferences?: {
    currency: string;
    language: string;
    theme: 'light' | 'dark' | 'system';
  };
  wishlist: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    shippingAddresses: {
      type: [addressSchema],
      default: [],
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * Hashes user password before saving to database using bcrypt with salt rounds
 * @param next - Mongoose middleware next function to continue the save operation
 * Purpose: Automatically encrypts user passwords with bcrypt (10 salt rounds) before storing in database,
 * only triggers when password field is modified to avoid unnecessary re-hashing
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

/**
 * Compares entered password with hashed password stored in database
 * @param enteredPassword - Plain text password entered by user during login
 * @returns Promise<boolean> - Returns true if passwords match, false otherwise
 * Purpose: Validates user login credentials by comparing plain text password with bcrypt hashed password
 */
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Creates User model safely by deleting existing model to prevent OverwriteModelError
 * @returns mongoose.Model<IUser> - Returns User model instance for database operations
 * Purpose: Handles Next.js hot reload issues by clearing existing model before creating new one,
 * prevents Mongoose OverwriteModelError during development
 */
const createModel = () => {
  if (mongoose.models && mongoose.models.User) {
    delete mongoose.models.User;
  }
  
  return mongoose.model<IUser>('User', userSchema);
};

const User = createModel();
export default User; 