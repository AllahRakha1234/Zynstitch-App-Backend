import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { escapeRegExp } from '../common/utils/escape-regexp.js';
import { toObjectId } from '../common/utils/object-id.js';
import { toCustomerDto } from './mappers/customer.mapper.js';
import { Customer, CustomerDocument } from './schemas/customer.schema.js';
import type { CustomerDto } from './dto/customer.types.js';

interface CustomerWritePayload {
  name: string;
  phone: string;
  email: string;
  address: string;
}

@Injectable()
export class CustomersRepository {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
  ) {}

  async listByOwner(
    ownerId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ customers: CustomerDto[]; total: number }> {
    const match: mongoose.QueryFilter<CustomerDocument> = {
      ownerId: toObjectId(ownerId),
    };

    if (search) {
      const pattern = new RegExp(escapeRegExp(search), 'i');
      match.$or = [
        { name: pattern },
        { email: pattern },
        { phone: pattern },
        { address: pattern },
      ];
    }

    const skipStage = limit > 0 ? [{ $skip: page * limit }, { $limit: limit }] : [];

    const [result] = await this.customerModel
      .aggregate<{
        customers: Array<Record<string, unknown>>;
        totalCount: Array<{ count: number }>;
      }>([
        { $match: match },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            customers: skipStage,
            totalCount: [{ $count: 'count' }],
          },
        },
      ])
      .exec();

    return {
      customers: (result?.customers ?? []).map((doc) => toCustomerDto(doc)),
      total: result?.totalCount[0]?.count ?? 0,
    };
  }

  async findByIdForOwner(
    ownerId: string,
    customerId: string,
  ): Promise<CustomerDto | null> {
    const customer = await this.customerModel
      .findOne({
        _id: toObjectId(customerId),
        ownerId: toObjectId(ownerId),
      })
      .exec();

    return customer ? toCustomerDto(customer) : null;
  }

  async findDuplicate(
    ownerId: string,
    payload: CustomerWritePayload,
    excludeId?: string,
  ): Promise<boolean> {
    const filter: mongoose.QueryFilter<CustomerDocument> = {
      ownerId: toObjectId(ownerId),
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
    };

    if (excludeId) {
      filter._id = { $ne: toObjectId(excludeId) };
    }

    const existing = await this.customerModel.exists(filter);
    return Boolean(existing);
  }

  async create(
    ownerId: string,
    payload: CustomerWritePayload,
  ): Promise<CustomerDto> {
    const created = await this.customerModel.create({
      ...payload,
      ownerId: toObjectId(ownerId),
    });
    return toCustomerDto(created);
  }

  async updateByOwner(
    ownerId: string,
    customerId: string,
    payload: CustomerWritePayload,
  ): Promise<CustomerDto | null> {
    const updated = await this.customerModel
      .findOneAndUpdate(
        {
          _id: toObjectId(customerId),
          ownerId: toObjectId(ownerId),
        },
        { $set: payload },
        { new: true, runValidators: true },
      )
      .exec();

    return updated ? toCustomerDto(updated) : null;
  }

  async deleteByOwner(ownerId: string, customerId: string): Promise<boolean> {
    const result = await this.customerModel
      .deleteOne({
        _id: toObjectId(customerId),
        ownerId: toObjectId(ownerId),
      })
      .exec();

    return result.deletedCount > 0;
  }
}
