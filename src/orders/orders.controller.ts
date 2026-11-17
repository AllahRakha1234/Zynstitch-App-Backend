import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ADMIN_ROLES, type AuthenticatedUser } from '../common/types/authenticated-user.js';
import { OrdersService } from './orders.service.js';
import { listOrdersQuerySchema, orderIdParamSchema, saveOrderSchema, updateOrderSchema, type ListOrdersQuery, type OrderIdParam, type SaveOrderDto, type UpdateOrderDto } from './dto/order.schema.js';

@Controller('orders')
@Roles(...ADMIN_ROLES)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query({ schema: listOrdersQuerySchema }) query: ListOrdersQuery) {
    return this.ordersService.findAll(user.id, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param({ schema: orderIdParamSchema }) params: OrderIdParam) {
    return this.ordersService.findOne(user.id, params.id);
  }

  @Post()
  save(@CurrentUser() user: AuthenticatedUser, @Body({ schema: saveOrderSchema }) dto: SaveOrderDto) {
    return this.ordersService.save(user.id, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthenticatedUser, @Param({ schema: orderIdParamSchema }) params: OrderIdParam, @Body({ schema: updateOrderSchema }) dto: UpdateOrderDto) {
    return this.ordersService.update(user.id, params.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param({ schema: orderIdParamSchema }) params: OrderIdParam) {
    return this.ordersService.remove(user.id, params.id);
  }
}
