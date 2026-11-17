import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { escapeRegExp } from '../common/utils/escape-regexp.js';
import { toObjectId } from '../common/utils/object-id.js';
import { toMeasurementDto } from './mappers/measurement.mapper.js';
import { Measurement, MeasurementDocument } from './schemas/measurement.schema.js';
import type { MeasurementDto } from './dto/measurement.types.js';
import type { SaveMeasurementDto } from './dto/measurement.schema.js';

@Injectable()
export class MeasurementsRepository {
  constructor(
    @InjectModel(Measurement.name)
    private readonly measurementModel: Model<MeasurementDocument>,
  ) {}

  async listByOwner(ownerId: string, page: number, limit: number, search?: string, customerId?: string): Promise<{ measurements: any[]; total: number }> {
    const match: mongoose.QueryFilter<MeasurementDocument> = { ownerId: toObjectId(ownerId) };
    if (customerId) match.customerId = toObjectId(customerId);
    const skipStage = limit > 0 ? [{ $skip: page * limit }, { $limit: limit }] : [];
    const pipeline: any[] = [{ $match: match }, { $lookup: { from: 'customers', localField: 'customerId', foreignField: '_id', as: 'customer' } }, { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } }];
    if (search) {
      const pattern = new RegExp(escapeRegExp(search), 'i');
      pipeline.push({ $match: { $or: [{ measurementName: pattern }, { 'customer.name': pattern }, { 'customer.phone': pattern }] } });
    }
    pipeline.push({ $sort: { createdAt: -1 } }, { $facet: { measurements: skipStage, totalCount: [{ $count: 'count' }] } });
    const [result] = await this.measurementModel.aggregate(pipeline).exec();
    return { measurements: (result?.measurements ?? []).map((doc: any) => ({ ...toMeasurementDto(doc as any), customerName: doc.customer?.name, customerPhone: doc.customer?.phone })), total: result?.totalCount[0]?.count ?? 0 };
  }

  async findByIdForOwner(ownerId: string, measurementId: string): Promise<any | null> {
    const [doc] = await this.measurementModel.aggregate([{ $match: { _id: toObjectId(measurementId), ownerId: toObjectId(ownerId) } }, { $lookup: { from: 'customers', localField: 'customerId', foreignField: '_id', as: 'customer' } }, { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } }]).exec();
    return doc ? { ...toMeasurementDto(doc as any), customerName: doc.customer?.name, customerPhone: doc.customer?.phone } : null;
  }

  async create(ownerId: string, payload: SaveMeasurementDto): Promise<MeasurementDto> {
    const created = await this.measurementModel.create({ ...payload, ownerId: toObjectId(ownerId), customerId: toObjectId(payload.customerId) });
    return toMeasurementDto(created);
  }

  async updateByOwner(ownerId: string, measurementId: string, payload: any): Promise<MeasurementDto | null> {
    const updated = await this.measurementModel.findOneAndUpdate({ _id: toObjectId(measurementId), ownerId: toObjectId(ownerId) }, { $set: payload }, { new: true, runValidators: true }).exec();
    return updated ? toMeasurementDto(updated) : null;
  }

  async deleteByOwner(ownerId: string, measurementId: string): Promise<boolean> {
    const result = await this.measurementModel.deleteOne({ _id: toObjectId(measurementId), ownerId: toObjectId(ownerId) }).exec();
    return result.deletedCount > 0;
  }
}
