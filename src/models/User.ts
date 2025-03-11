import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the address schema with proper validation
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
}, { _id: true }); // Ensure _id is generated for each address

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

// Hash password before saving
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

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the model safely
const createModel = () => {
  // Delete the model if it exists to prevent OverwriteModelError
  if (mongoose.models && mongoose.models.User) {
    delete mongoose.models.User;
  }
  
  return mongoose.model<IUser>('User', userSchema);
};

// Export the model
const User = createModel();
export default User; 