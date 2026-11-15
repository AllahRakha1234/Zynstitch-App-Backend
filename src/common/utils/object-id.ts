import { Types } from 'mongoose';

const OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;

export function isObjectIdString(value: string): boolean {
  return OBJECT_ID_PATTERN.test(value) && Types.ObjectId.isValid(value);
}

export function toObjectId(value: string): Types.ObjectId {
  return new Types.ObjectId(value);
}
