import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MeasurementDocument = HydratedDocument<Measurement>;

@Schema({
  collection: 'measurements',
  timestamps: true,
})
export class Measurement {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  measurementName: string;

  @Prop({ type: Date })
  measurementDate?: Date;

  @Prop({ type: String })
  kameezLength?: string;
  @Prop({ type: String })
  sleeveLength?: string;
  @Prop({ type: String })
  shoulderWidth?: string;
  @Prop({ type: String })
  neck?: string;
  @Prop({ type: String })
  chest?: string;
  @Prop({ type: String })
  waist?: string;
  @Prop({ type: String })
  bottomWidth?: string;
  @Prop({ type: String })
  shalwarLength?: string;
  @Prop({ type: String })
  bottomOpening?: string;
  @Prop({ type: String })
  cuff?: string;

  @Prop({ type: String })
  collarStyle?: string;

  @Prop({ type: Boolean, default: false })
  hasChakPattiKaaj?: boolean;
  @Prop({ type: Boolean, default: false })
  hasChestPocket?: boolean;
  @Prop({ type: Boolean, default: false })
  hasSidePockets?: boolean;
  @Prop({ type: Boolean, default: false })
  hasShalwarPocket?: boolean;

  @Prop({ trim: true, default: '' })
  notes: string;

  createdAt: Date;
  updatedAt: Date;
}

export const MeasurementSchema = SchemaFactory.createForClass(Measurement);

MeasurementSchema.index({ ownerId: 1, customerId: 1, createdAt: -1 });
