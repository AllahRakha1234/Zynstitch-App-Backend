import { MeasurementDocument } from '../schemas/measurement.schema.js';
import { MeasurementDto } from '../dto/measurement.types.js';

function toIsoString(value: unknown): string | undefined {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
}

export function toMeasurementDto(doc: MeasurementDocument | Record<string, any>): MeasurementDto {
  const obj = doc instanceof Date ? doc : (doc as any);
  const record = (doc instanceof Object ? (doc as any).toObject ? (doc as any).toObject() : doc : doc) as any;
  return {
    _id: record._id.toString(),
    ownerId: record.ownerId.toString(),
    customerId: record.customerId.toString(),
    measurementName: record.measurementName,
    measurementDate: toIsoString(record.measurementDate),
    kameezLength: record.kameezLength,
    sleeveLength: record.sleeveLength,
    shoulderWidth: record.shoulderWidth,
    neck: record.neck,
    chest: record.chest,
    waist: record.waist,
    bottomWidth: record.bottomWidth,
    shalwarLength: record.shalwarLength,
    bottomOpening: record.bottomOpening,
    cuff: record.cuff,
    collarStyle: record.collarStyle,
    hasChakPattiKaaj: record.hasChakPattiKaaj,
    hasChestPocket: record.hasChestPocket,
    hasSidePockets: record.hasSidePockets,
    hasShalwarPocket: record.hasShalwarPocket,
    notes: record.notes,
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt),
  };
}
