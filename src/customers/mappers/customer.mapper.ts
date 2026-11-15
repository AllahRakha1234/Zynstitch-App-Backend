import type { CustomerDocument } from '../schemas/customer.schema.js';
import type { CustomerDto } from '../dto/customer.types.js';

function toIsoString(value: unknown): string | undefined {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
}

export function toCustomerDto(
  customer: CustomerDocument | Record<string, unknown>,
): CustomerDto {
  const record = customer as Record<string, unknown> & {
    _id: { toString(): string };
    ownerId: { toString(): string };
    name: string;
    phone: string;
    email?: string;
    address: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  return {
    _id: record._id.toString(),
    ownerId: record.ownerId.toString(),
    name: record.name,
    phone: record.phone,
    email: record.email ?? '',
    address: record.address,
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt),
  };
}
