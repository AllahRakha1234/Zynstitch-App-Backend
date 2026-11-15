import { z } from 'zod';
import { isObjectIdString } from '../../common/utils/object-id.js';

const objectIdSchema = z
  .string()
  .refine(isObjectIdString, 'Invalid customer id');

const optionalEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.union([z.literal(''), z.email()]))
  .optional()
  .default('');

export const customerIdParamSchema = z.object({
  id: objectIdSchema,
});

export type CustomerIdParam = z.infer<typeof customerIdParamSchema>;

export const listCustomersQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(0).max(100).default(20),
  search: z.string().trim().max(100).optional(),
});

export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>;

export const saveCustomerSchema = z.object({
  _id: objectIdSchema.optional(),
  name: z.string().trim().min(1, 'Name is required').max(120),
  phone: z.string().trim().min(1, 'Phone is required').max(40),
  email: optionalEmailSchema,
  address: z.string().trim().min(1, 'Address is required').max(500),
});

export type SaveCustomerDto = z.infer<typeof saveCustomerSchema>;

export const updateCustomerSchema = saveCustomerSchema.omit({ _id: true });

export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>;
