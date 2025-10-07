import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { findSupplierById } from './find-by-id'; // Ajuste o caminho

// Mock da factory que cria o service
const findSupplierByIdServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/supplier/make-find-supplier-by-id-service', () => {
  return {
    makeFindSupplierByIdService: () => findSupplierByIdServiceMock,
  };
});

describe('Find Supplier By Id Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;
  const supplierIdToSearch = 'supplier-01';

  beforeEach(() => {
    request = {
      params: { id: supplierIdToSearch },
    };
    reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch a supplier by id and return status 200', async () => {
    // Arrange
    const supplierData = { id: supplierIdToSearch, company_name: 'Supplier A' };
    findSupplierByIdServiceMock.execute.mockResolvedValue({ supplier: supplierData });

    // Act
    await findSupplierById(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(findSupplierByIdServiceMock.execute).toHaveBeenCalledWith({ supplierId: supplierIdToSearch });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ supplier: supplierData });
  });

  it('should return status 500 if the service fails', async () => {
    // Arrange
    const serviceError = new Error('Resource not found');
    findSupplierByIdServiceMock.execute.mockRejectedValue(serviceError);

    // Act
    await findSupplierById(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'An error occurred while fetching the supplier',
        statusCode: 500
    });
  });
});
