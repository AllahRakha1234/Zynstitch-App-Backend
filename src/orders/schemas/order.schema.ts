import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({
  collection: 'orders',
  timestamps: true,
})
export class Order {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false })
  measurementId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  orderNumber: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, type: Number })
  advancePaid: number;

  @Prop({ required: true, trim: true })
  status: string;

  @Prop({ type: Date, required: true })
  orderDate: Date;

  @Prop({ type: Date, required: true })
  dueDate: Date;

  @Prop({ trim: true, default: '' })
  notes: string;

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ ownerId: 1, customerId: 1, orderDate: -1 });
