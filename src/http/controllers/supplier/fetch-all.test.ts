import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { fetchAllSupplier } from './fetch-all'; // Ajuste o caminho

// Mock da factory que cria o service
const fetchAllSupplierServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/supplier/make-fetch-all-supplier-service', () => {
  return {
    makeFetchAllSupplierService: () => fetchAllSupplierServiceMock,
  };
});

describe('Fetch All Supplier Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {}; // Não precisa de body ou params para este controller
    reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all suppliers and return status 200', async () => {
    // Arrange
    const suppliersList = [
      { id: 'supplier-01', company_name: 'Supplier A' },
      { id: 'supplier-02', company_name: 'Supplier B' },
    ];
    fetchAllSupplierServiceMock.execute.mockResolvedValue({ supplier: suppliersList });

    // Act
    await fetchAllSupplier(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(fetchAllSupplierServiceMock.execute).toHaveBeenCalled();
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ supplier: suppliersList });
  });

  it('should throw an error if the service fails', async () => {
    // Arrange
    const serviceError = new Error('Failed to fetch from database');
    fetchAllSupplierServiceMock.execute.mockRejectedValue(serviceError);

    // Act & Assert
    await expect(
      fetchAllSupplier(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow('Failed to fetch from database');
  });
});