import { OrderDocument } from '../schemas/order.schema.js';
import { OrderDto } from '../dto/order.types.js';

function toIsoString(value: unknown): string | undefined {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
}

export function toOrderDto(doc: OrderDocument | Record<string, any>): OrderDto {
  const record = (doc instanceof Object ? (doc as any).toObject ? (doc as any).toObject() : doc : doc) as any;
  return {
    _id: record._id.toString(),
    ownerId: record.ownerId.toString(),
    customerId: record.customerId.toString(),
    measurementId: record.measurementId?.toString() ?? null,
    orderNumber: record.orderNumber,
    price: record.price,
    advancePaid: record.advancePaid,
    status: record.status,
    orderDate: toIsoString(record.orderDate)!,
    dueDate: toIsoString(record.dueDate)!,
    notes: record.notes,
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt),
  };
}
