import { Injectable, Logger } from '@nestjs/common';
import { ServiceMessages } from '../common/constants/service-messages.js';
import { fail, ok, type ApiResponse } from '../common/types/api-response.js';
import { isDuplicateKeyError } from '../common/utils/mongo-errors.js';
import { CustomersRepository } from './customers.repository.js';
import type {
  ListCustomersQuery,
  SaveCustomerDto,
  UpdateCustomerDto,
} from './dto/customer.schema.js';
import type { CustomerDto, CustomerListData } from './dto/customer.types.js';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly customersRepository: CustomersRepository) {}

  async findAll(
    ownerId: string,
    query: ListCustomersQuery,
  ): Promise<ApiResponse<CustomerListData>> {
    try {
      const data = await this.customersRepository.listByOwner(
        ownerId,
        query.page,
        query.limit,
        query.search,
      );
      return ok(data, ServiceMessages.fetchSuccess);
    } catch (error) {
      this.logger.error(error);
      return fail(ServiceMessages.fetchFail, { customers: [], total: 0 });
    }
  }

  async findOne(
    ownerId: string,
    customerId: string,
  ): Promise<ApiResponse<CustomerDto>> {
    try {
      const customer = await this.customersRepository.findByIdForOwner(
        ownerId,
        customerId,
      );
      if (!customer) {
        return fail(ServiceMessages.notFound);
      }
      return ok(customer, ServiceMessages.fetchSuccess);
    } catch (error) {
      this.logger.error(error);
      return fail(ServiceMessages.fetchFail);
    }
  }

  async save(
    ownerId: string,
    dto: SaveCustomerDto,
  ): Promise<ApiResponse<CustomerDto>> {
    return dto._id
      ? this.update(ownerId, dto._id, dto)
      : this.create(ownerId, dto);
  }

  async create(
    ownerId: string,
    dto: UpdateCustomerDto,
  ): Promise<ApiResponse<CustomerDto>> {
    const payload = this.normalizeWritePayload(dto);

    try {
      const duplicate = await this.customersRepository.findDuplicate(
        ownerId,
        payload,
      );
      if (duplicate) {
        return fail(ServiceMessages.duplicate);
      }

      const created = await this.customersRepository.create(ownerId, payload);
      return ok(created, ServiceMessages.createSuccess);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        return fail(ServiceMessages.duplicate);
      }
      this.logger.error(error);
      return fail(ServiceMessages.saveFail);
    }
  }

  async update(
    ownerId: string,
    customerId: string,
    dto: UpdateCustomerDto,
  ): Promise<ApiResponse<CustomerDto>> {
    const payload = this.normalizeWritePayload(dto);

    try {
      const duplicate = await this.customersRepository.findDuplicate(
        ownerId,
        payload,
        customerId,
      );
      if (duplicate) {
        return fail(ServiceMessages.duplicate);
      }

      const updated = await this.customersRepository.updateByOwner(
        ownerId,
        customerId,
        payload,
      );
      if (!updated) {
        return fail(ServiceMessages.notFound);
      }
      return ok(updated, ServiceMessages.updateSuccess);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        return fail(ServiceMessages.duplicate);
      }
      this.logger.error(error);
      return fail(ServiceMessages.saveFail);
    }
  }

  async remove(
    ownerId: string,
    customerId: string,
  ): Promise<ApiResponse<null>> {
    try {
      const deleted = await this.customersRepository.deleteByOwner(
        ownerId,
        customerId,
      );
      return ok(
        null,
        deleted ? ServiceMessages.deleteSuccess : ServiceMessages.deleteNotFound,
      );
    } catch (error) {
      this.logger.error(error);
      return fail(ServiceMessages.deleteFail);
    }
  }

  private normalizeWritePayload(dto: UpdateCustomerDto) {
    return {
      name: dto.name.trim(),
      phone: dto.phone.trim(),
      email: (dto.email ?? '').trim().toLowerCase(),
      address: dto.address.trim(),
    };
  }
}
