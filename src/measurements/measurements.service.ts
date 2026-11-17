import { Injectable, NotFoundException } from '@nestjs/common';
import { MeasurementsRepository } from './measurements.repository.js';
import type { ListMeasurementsQuery, SaveMeasurementDto, UpdateMeasurementDto } from './dto/measurement.schema.js';
import type { MeasurementDto } from './dto/measurement.types.js';

@Injectable()
export class MeasurementsService {
  constructor(private readonly repository: MeasurementsRepository) {}

  async findAll(ownerId: string, query: ListMeasurementsQuery): Promise<{ measurements: MeasurementDto[]; total: number }> {
    return this.repository.listByOwner(ownerId, query.page, query.limit, query.search, query.customerId);
  }

  async findOne(ownerId: string, id: string): Promise<MeasurementDto> {
    const measurement = await this.repository.findByIdForOwner(ownerId, id);
    if (!measurement) throw new NotFoundException('Measurement not found');
    return measurement;
  }

  async save(ownerId: string, dto: SaveMeasurementDto): Promise<MeasurementDto> {
    return this.repository.create(ownerId, dto);
  }

  async update(ownerId: string, id: string, dto: UpdateMeasurementDto): Promise<MeasurementDto> {
    const updated = await this.repository.updateByOwner(ownerId, id, dto);
    if (!updated) throw new NotFoundException('Measurement not found');
    return updated;
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const deleted = await this.repository.deleteByOwner(ownerId, id);
    if (!deleted) throw new NotFoundException('Measurement not found');
  }
}
