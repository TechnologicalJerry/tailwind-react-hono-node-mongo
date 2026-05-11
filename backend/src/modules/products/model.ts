import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  createdBy: mongoose.Types.ObjectId;
}

const productSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Product = mongoose.model<IProduct>('Product', productSchema);
