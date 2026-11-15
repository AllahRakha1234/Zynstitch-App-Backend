import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { UserRole, UserStatus } from '../../common/types/authenticated-user.js';

export type UserDocument = HydratedDocument<User>;

@Schema({
  collection: 'users',
  timestamps: true,
})
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, enum: ['ADMIN', 'SUPER_ADMIN'], default: 'ADMIN' })
  role: UserRole;

  @Prop({ required: true, enum: ['ACTIVE', 'BLOCKED'], default: 'ACTIVE' })
  status: UserStatus;

  @Prop({ trim: true, default: '' })
  companyName?: string;

  @Prop({ default: '' })
  profilePhoto?: string;

  @Prop()
  passwordChangedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
