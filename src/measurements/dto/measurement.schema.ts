import { z } from 'zod';
import { isObjectIdString } from '../../common/utils/object-id.js';

const objectIdSchema = z
  .string()
  .refine(isObjectIdString, 'Invalid id');

export const measurementIdParamSchema = z.object({
  id: objectIdSchema,
});

export type MeasurementIdParam = z.infer<typeof measurementIdParamSchema>;

export const listMeasurementsQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(0).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  customerId: objectIdSchema.optional(),
});

export type ListMeasurementsQuery = z.infer<typeof listMeasurementsQuerySchema>;

export const saveMeasurementSchema = z.object({
  _id: objectIdSchema.optional(),
  customerId: objectIdSchema,
  measurementName: z.string().trim().min(1, 'Measurement name is required').max(120),
  measurementDate: z.coerce.date().optional(),
  kameezLength: z.string().optional(),
  sleeveLength: z.string().optional(),
  shoulderWidth: z.string().optional(),
  neck: z.string().optional(),
  chest: z.string().optional(),
  waist: z.string().optional(),
  bottomWidth: z.string().optional(),
  shalwarLength: z.string().optional(),
  bottomOpening: z.string().optional(),
  cuff: z.string().optional(),
  collarStyle: z.string().optional(),
  hasChakPattiKaaj: z.boolean().optional(),
  hasChestPocket: z.boolean().optional(),
  hasSidePockets: z.boolean().optional(),
  hasShalwarPocket: z.boolean().optional(),
  notes: z.string().trim().optional(),
});

export type SaveMeasurementDto = z.infer<typeof saveMeasurementSchema>;

export const updateMeasurementSchema = saveMeasurementSchema.omit({ _id: true, customerId: true });

export type UpdateMeasurementDto = z.infer<typeof updateMeasurementSchema>;
