import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ADMIN_ROLES, type AuthenticatedUser } from '../common/types/authenticated-user.js';
import { MeasurementsService } from './measurements.service.js';
import {
  listMeasurementsQuerySchema,
  measurementIdParamSchema,
  saveMeasurementSchema,
  updateMeasurementSchema,
  type ListMeasurementsQuery,
  type MeasurementIdParam,
  type SaveMeasurementDto,
  type UpdateMeasurementDto,
} from './dto/measurement.schema.js';

@Controller('measurements')
@Roles(...ADMIN_ROLES)
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query({ schema: listMeasurementsQuerySchema }) query: ListMeasurementsQuery,
  ) {
    return this.measurementsService.findAll(user.id, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param({ schema: measurementIdParamSchema }) params: MeasurementIdParam,
  ) {
    return this.measurementsService.findOne(user.id, params.id);
  }

  @Post()
  save(
    @CurrentUser() user: AuthenticatedUser,
    @Body({ schema: saveMeasurementSchema }) dto: SaveMeasurementDto,
  ) {
    return this.measurementsService.save(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param({ schema: measurementIdParamSchema }) params: MeasurementIdParam,
    @Body({ schema: updateMeasurementSchema }) dto: UpdateMeasurementDto,
  ) {
    return this.measurementsService.update(user.id, params.id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param({ schema: measurementIdParamSchema }) params: MeasurementIdParam,
  ) {
    return this.measurementsService.remove(user.id, params.id);
  }
}
