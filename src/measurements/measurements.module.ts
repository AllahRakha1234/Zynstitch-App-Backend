import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MeasurementsController } from './measurements.controller.js';
import { MeasurementsRepository } from './measurements.repository.js';
import { MeasurementsService } from './measurements.service.js';
import { Measurement, MeasurementSchema } from './schemas/measurement.schema.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Measurement.name, schema: MeasurementSchema }])],
  controllers: [MeasurementsController],
  providers: [MeasurementsService, MeasurementsRepository],
  exports: [MeasurementsService],
})
export class MeasurementsModule {}
