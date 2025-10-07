import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { patchSupplier } from './patch'; // Ajuste o caminho

// Mock da factory que cria o service
const patchSupplierServiceMock = {
  handle: vi.fn(),
};

vi.mock('../../../services/factories/supplier/make-patch-supplier-service', () => {
  return {
    makePatchSupplierService: () => patchSupplierServiceMock,
  };
});

describe('Patch Supplier Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;
  const supplierIdToUpdate = 'supplier-01';

  beforeEach(() => {
    request = {
      params: { id: supplierIdToUpdate },
      body: {}, // Body será definido em cada teste
    };
    reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should update a supplier and return status 200', async () => {
    // Arrange
    const updateData = { company_name: 'New Company Name' };
    const updatedSupplier = { id: supplierIdToUpdate, ...updateData };
    request.body = updateData;
    patchSupplierServiceMock.handle.mockResolvedValue({ supplier: updatedSupplier });

    // Act
    await patchSupplier(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(patchSupplierServiceMock.handle).toHaveBeenCalledWith({
      id: supplierIdToUpdate,
      data: {
        social_name: undefined,
        company_name: updateData.company_name,
        phone_number: undefined,
        cnpj: undefined,
      },
    });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ supplier: updatedSupplier });
  });

  it('should return status 400 for invalid body data', async () => {
    // Arrange
    // O Zod espera um 'string', mas enviamos um número para forçar o erro.
    request.body = { company_name: 12345 }; 

    // Act
    await patchSupplier(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.code).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid input',
    });
  });

  it('should return status 500 if the service fails', async () => {
    // Arrange
    const serviceError = new Error('Database connection failed');
    request.body = { company_name: 'Any Name' };
    patchSupplierServiceMock.handle.mockRejectedValue(serviceError);

    // Act
    await patchSupplier(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An error occurred while updating the supplier',
    });
  });
});