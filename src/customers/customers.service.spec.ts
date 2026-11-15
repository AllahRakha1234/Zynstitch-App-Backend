import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ServiceMessages } from '../common/constants/service-messages.js';
import { CustomersRepository } from './customers.repository.js';
import { CustomersService } from './customers.service.js';
import type { CustomerDto } from './dto/customer.types.js';

const ownerId = '507f1f77bcf86cd799439011';

const customer: CustomerDto = {
  _id: '507f191e810c19729de860ea',
  ownerId,
  name: 'Ali Khan',
  phone: '+92-300-1111111',
  email: 'ali@example.com',
  address: 'Lahore',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('CustomersService', () => {
  let service: CustomersService;
  let repository: {
    listByOwner: ReturnType<typeof vi.fn>;
    findByIdForOwner: ReturnType<typeof vi.fn>;
    findDuplicate: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    updateByOwner: ReturnType<typeof vi.fn>;
    deleteByOwner: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    repository = {
      listByOwner: vi.fn(),
      findByIdForOwner: vi.fn(),
      findDuplicate: vi.fn(),
      create: vi.fn(),
      updateByOwner: vi.fn(),
      deleteByOwner: vi.fn(),
    };
    service = new CustomersService(
      repository as unknown as CustomersRepository,
    );
  });

  it('lists customers for the authenticated owner', async () => {
    repository.listByOwner.mockResolvedValue({
      customers: [customer],
      total: 1,
    });

    const result = await service.findAll(ownerId, {
      page: 0,
      limit: 20,
    });

    expect(result).toEqual({
      success: true,
      data: { customers: [customer], total: 1 },
      message: ServiceMessages.fetchSuccess,
    });
    expect(repository.listByOwner).toHaveBeenCalledWith(
      ownerId,
      0,
      20,
      undefined,
    );
  });

  it('creates a customer when the record is unique', async () => {
    repository.findDuplicate.mockResolvedValue(false);
    repository.create.mockResolvedValue(customer);

    const result = await service.save(ownerId, {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe(ServiceMessages.createSuccess);
    expect(repository.create).toHaveBeenCalled();
  });

  it('rejects a duplicate customer', async () => {
    repository.findDuplicate.mockResolvedValue(true);

    const result = await service.save(ownerId, {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
    });

    expect(result).toEqual({
      success: false,
      data: null,
      message: ServiceMessages.duplicate,
    });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('updates an existing customer by id', async () => {
    repository.findDuplicate.mockResolvedValue(false);
    repository.updateByOwner.mockResolvedValue({
      ...customer,
      address: 'Karachi',
    });

    const result = await service.save(ownerId, {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: 'Karachi',
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe(ServiceMessages.updateSuccess);
    expect(repository.updateByOwner).toHaveBeenCalledWith(
      ownerId,
      customer._id,
      {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: 'Karachi',
      },
    );
  });

  it('returns not found when updating a missing customer', async () => {
    repository.findDuplicate.mockResolvedValue(false);
    repository.updateByOwner.mockResolvedValue(null);

    const result = await service.update(ownerId, customer._id, {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
    });

    expect(result.message).toBe(ServiceMessages.notFound);
    expect(result.success).toBe(false);
  });

  it('deletes a customer owned by the caller', async () => {
    repository.deleteByOwner.mockResolvedValue(true);

    const result = await service.remove(ownerId, customer._id);

    expect(result).toEqual({
      success: true,
      data: null,
      message: ServiceMessages.deleteSuccess,
    });
  });
});
