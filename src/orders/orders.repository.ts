import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { escapeRegExp } from '../common/utils/escape-regexp.js';
import { toObjectId } from '../common/utils/object-id.js';
import { toOrderDto } from './mappers/order.mapper.js';
import { Order, OrderDocument } from './schemas/order.schema.js';
import type { OrderDto } from './dto/order.types.js';
import type { SaveOrderDto } from './dto/order.schema.js';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async listByOwner(ownerId: string, page: number, limit: number, search?: string, status?: string): Promise<{ orders: any[]; total: number }> {
    const match: mongoose.QueryFilter<OrderDocument> = { ownerId: toObjectId(ownerId) };
    if (status) match.status = status;
    const skipStage = limit > 0 ? [{ $skip: page * limit }, { $limit: limit }] : [];
    const pipeline: any[] = [{ $match: match }, { $lookup: { from: 'customers', localField: 'customerId', foreignField: '_id', as: 'customer' } }, { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } }];
    if (search) {
      const pattern = new RegExp(escapeRegExp(search), 'i');
      pipeline.push({ $match: { $or: [{ orderNumber: pattern }, { 'customer.name': pattern }, { 'customer.phone': pattern }] } });
    }
    pipeline.push({ $sort: { orderDate: -1 } }, { $facet: { orders: skipStage, totalCount: [{ $count: 'count' }] } });
    const [result] = await this.orderModel.aggregate(pipeline).exec();
    return { orders: (result?.orders ?? []).map((doc: any) => ({ ...toOrderDto(doc as any), customerName: doc.customer?.name, customerPhone: doc.customer?.phone })), total: result?.totalCount[0]?.count ?? 0 };
  }

  async findByIdForOwner(ownerId: string, orderId: string): Promise<any | null> {
    const [doc] = await this.orderModel.aggregate([{ $match: { _id: toObjectId(orderId), ownerId: toObjectId(ownerId) } }, { $lookup: { from: 'customers', localField: 'customerId', foreignField: '_id', as: 'customer' } }, { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } }]).exec();
    return doc ? { ...toOrderDto(doc as any), customerName: doc.customer?.name, customerPhone: doc.customer?.phone } : null;
  }

  async create(ownerId: string, payload: SaveOrderDto): Promise<OrderDto> {
    const created = await this.orderModel.create({ ...payload, ownerId: toObjectId(ownerId), customerId: toObjectId(payload.customerId), measurementId: payload.measurementId ? toObjectId(payload.measurementId) : undefined });
    return toOrderDto(created);
  }

  async updateByOwner(ownerId: string, orderId: string, payload: any): Promise<OrderDto | null> {
    if (payload.measurementId) payload.measurementId = toObjectId(payload.measurementId);
    else if (payload.measurementId === null) payload.measurementId = null;
    const updated = await this.orderModel.findOneAndUpdate({ _id: toObjectId(orderId), ownerId: toObjectId(ownerId) }, { $set: payload }, { new: true, runValidators: true }).exec();
    return updated ? toOrderDto(updated) : null;
  }

  async deleteByOwner(ownerId: string, orderId: string): Promise<boolean> {
    const result = await this.orderModel.deleteOne({ _id: toObjectId(orderId), ownerId: toObjectId(ownerId) }).exec();
    return result.deletedCount > 0;
  }
}
