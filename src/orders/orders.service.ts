import { Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository.js';
import type { ListOrdersQuery, SaveOrderDto, UpdateOrderDto } from './dto/order.schema.js';
import type { OrderDto } from './dto/order.types.js';

@Injectable()
export class OrdersService {
  constructor(private readonly repository: OrdersRepository) {}

  async findAll(ownerId: string, query: ListOrdersQuery) {
    return this.repository.listByOwner(ownerId, query.page, query.limit, query.search, query.status);
  }

  async findOne(ownerId: string, id: string) {
    const order = await this.repository.findByIdForOwner(ownerId, id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async save(ownerId: string, dto: SaveOrderDto) {
    return this.repository.create(ownerId, dto);
  }

  async update(ownerId: string, id: string, dto: UpdateOrderDto) {
    const updated = await this.repository.updateByOwner(ownerId, id, dto);
    if (!updated) throw new NotFoundException('Order not found');
    return updated;
  }

  async remove(ownerId: string, id: string) {
    const deleted = await this.repository.deleteByOwner(ownerId, id);
    if (!deleted) throw new NotFoundException('Order not found');
  }
}
