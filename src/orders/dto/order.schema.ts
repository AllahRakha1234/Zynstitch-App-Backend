import { z } from 'zod';
import { isObjectIdString } from '../../common/utils/object-id.js';

const objectIdSchema = z
  .string()
  .refine(isObjectIdString, 'Invalid id');

export const orderIdParamSchema = z.object({
  id: objectIdSchema,
});

export type OrderIdParam = z.infer<typeof orderIdParamSchema>;

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(0).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  status: z.string().optional(),
});

export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;

export const saveOrderSchema = z.object({
  _id: objectIdSchema.optional(),
  customerId: objectIdSchema,
  measurementId: objectIdSchema.optional().nullable(),
  orderNumber: z.string().trim().min(1, 'Order number is required').max(50),
  price: z.coerce.number().min(0),
  advancePaid: z.coerce.number().min(0),
  status: z.string().trim().min(1, 'Status is required'),
  orderDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  notes: z.string().trim().optional(),
});

export type SaveOrderDto = z.infer<typeof saveOrderSchema>;

export const updateOrderSchema = saveOrderSchema.omit({ _id: true, customerId: true });

export type UpdateOrderDto = z.infer<typeof updateOrderSchema>;
