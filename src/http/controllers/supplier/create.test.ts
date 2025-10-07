import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { createSupplier } from './create'; // Ajuste o caminho
import { z } from 'zod';

// Mock da factory que cria o service
const createSupplierServiceMock = {
  handle: vi.fn(),
};

vi.mock('../../../services/factories/supplier/make-create-supplier-service', () => {
  return {
    makeCreateSupplierService: () => createSupplierServiceMock,
  };
});

describe('Create Supplier Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      body: {
        social_name: 'Supplier Social Name',
        company_name: 'Supplier Company Name',
        phone_number: '123456789',
        cnpj: '12345678901234',
      },
    };

    reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a supplier and return status 201', async () => {
    // Arrange
    const newSupplier = { id: 'supplier-01', ...request.body };
    createSupplierServiceMock.handle.mockResolvedValue({ supplier: newSupplier });

    // Act
    await createSupplier(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(createSupplierServiceMock.handle).toHaveBeenCalledWith(request.body);
    expect(reply.code).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({ supplier: newSupplier });
  });

  it('should return status 400 for invalid request data', async () => {
    // Arrange
    request.body = { social_name: 'Only one field' }; // Corpo inválido

    // Act
    await createSupplier(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.code).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Invalid request data' });
  });

  it('should return status 500 when the service fails', async () => {
    // Arrange
    const serviceError = new Error('Database insertion failed');
    createSupplierServiceMock.handle.mockRejectedValue(serviceError);

    // Act
    await createSupplier(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});