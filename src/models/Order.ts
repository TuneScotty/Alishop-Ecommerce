import mongoose from 'mongoose';

export interface IOrder extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  orderItems: Array<{
    name: string;
    quantity: number;
    image: string;
    price: number;
    product: mongoose.Types.ObjectId;
    aliExpressProductId?: string;
    variant?: string;
    shippingMethod?: string;
  }>;
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  status: string;
  notes?: Array<{
    text: string;
    createdAt: Date;
    createdBy: string;
  }>;
  aliExpressData?: {
    orderId?: string;
    orderStatus?: string;
    trackingInfo?: Array<{
      trackingNumber: string;
      carrier: string;
      status: string;
      updatedAt: Date;
    }>;
    createdAt?: Date;
  };
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        aliExpressProductId: { type: String },
        variant: { type: String },
        shippingMethod: { type: String },
      },
    ],
    shippingAddress: {
      name: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      default: 'Pending',
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    },
    notes: [
      {
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: String, required: true },
      },
    ],
    aliExpressData: {
      orderId: { type: String },
      orderStatus: { type: String },
      trackingInfo: [
        {
          trackingNumber: { type: String },
          carrier: { type: String },
          status: { type: String },
          updatedAt: { type: Date },
        },
      ],
      createdAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Check if the model exists before creating it
const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order as mongoose.Model<IOrder>; 