import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import {
  ADMIN_ROLES,
  type AuthenticatedUser,
} from '../common/types/authenticated-user.js';
import { CustomersService } from './customers.service.js';
import {
  customerIdParamSchema,
  listCustomersQuerySchema,
  saveCustomerSchema,
  updateCustomerSchema,
  type CustomerIdParam,
  type ListCustomersQuery,
  type SaveCustomerDto,
  type UpdateCustomerDto,
} from './dto/customer.schema.js';

@Controller('customers')
@Roles(...ADMIN_ROLES)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query({ schema: listCustomersQuerySchema }) query: ListCustomersQuery,
  ) {
    return this.customersService.findAll(user.id, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param({ schema: customerIdParamSchema }) params: CustomerIdParam,
  ) {
    return this.customersService.findOne(user.id, params.id);
  }

  @Post()
  save(
    @CurrentUser() user: AuthenticatedUser,
    @Body({ schema: saveCustomerSchema }) dto: SaveCustomerDto,
  ) {
    return this.customersService.save(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param({ schema: customerIdParamSchema }) params: CustomerIdParam,
    @Body({ schema: updateCustomerSchema }) dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(user.id, params.id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param({ schema: customerIdParamSchema }) params: CustomerIdParam,
  ) {
    return this.customersService.remove(user.id, params.id);
  }
}
