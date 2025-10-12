// tests/unit/controllers/purchase/fetch-all-by-supplier-id.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { fetchAllPurchaseBySupplierId } from '../../../../src/http/controllers/purchase/fetch-all-by-supplier-id';
import { makeFetchAllPurchaseBySupplierIdService } from '../../../../src/services/factories/purchase/make-fetch-all-purchase-by-supplier-id';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';
import { NoRecordsFoundError } from '../../../../src/services/errors/no-records-found-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/purchase/make-fetch-all-purchase-by-supplier-id');

describe('fetchAllPurchaseBySupplierId Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockService: any;

  beforeEach(() => {
    // Reset dos mocks
    vi.clearAllMocks();

    // Mock do serviço
    mockService = {
      execute: vi.fn(),
    };

    // Mock da factory
    vi.mocked(makeFetchAllPurchaseBySupplierIdService).mockReturnValue(mockService);

    // Mock do request e reply do Fastify
    mockRequest = {
      params: {
        supplierId: '123e4567-e89b-12d3-a456-426614174000',
      },
    };

    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  it('should return purchases for a valid supplier ID', async () => {
    // Arrange
    const mockPurchases = [
      {
        id: 'purchase-1',
        supplierId: '123e4567-e89b-12d3-a456-426614174000',
        productId: 'product-1',
        quantity: 10,
        unitPrice: 29.99,
        totalPrice: 299.90,
        purchaseDate: new Date('2024-01-15'),
      },
      {
        id: 'purchase-2',
        supplierId: '123e4567-e89b-12d3-a456-426614174000',
        productId: 'product-2',
        quantity: 5,
        unitPrice: 15.50,
        totalPrice: 77.50,
        purchaseDate: new Date('2024-01-20'),
      },
    ];

    mockService.execute.mockResolvedValue({
      purchases: mockPurchases,
    });

    // Act
    await fetchAllPurchaseBySupplierId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(makeFetchAllPurchaseBySupplierIdService).toHaveBeenCalledTimes(1);
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      purchases: mockPurchases,
    });
  });

  it('should handle empty purchases list', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      purchases: [],
    });

    // Act
    await fetchAllPurchaseBySupplierId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      purchases: [],
    });
  });

  it('should handle ResourceNotFoundError from service', async () => {
    // Arrange
    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Mock do reply para capturar o erro
    const sendMock = vi.fn();
    mockReply.send = sendMock;

    // Act & Assert
    await expect(
      fetchAllPurchaseBySupplierId(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(ResourceNotFoundError);

    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('should handle NoRecordsFoundError from service', async () => {
    // Arrange
    const error = new NoRecordsFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchaseBySupplierId(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(NoRecordsFoundError);

    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).not.toHaveBeenCalled();
  });

  it('should handle generic errors from service', async () => {
    // Arrange
    const error = new Error('Database connection failed');
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchaseBySupplierId(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow('Database connection failed');

    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
  });

  it('should handle invalid supplier ID format', async () => {
    // Arrange
    mockRequest.params = {
      supplierId: 'invalid-uuid',
    };

    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchaseBySupplierId(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(ResourceNotFoundError);

    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: 'invalid-uuid',
    });
  });

  it('should handle missing supplier ID parameter', async () => {
    // Arrange
    mockRequest.params = {};

    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchaseBySupplierId(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(ResourceNotFoundError);

    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: undefined,
    });
  });

  it('should handle InactiveError from service', async () => {
    // Arrange
    // Importando o InactiveError (assumindo que está em errors/inactive-error)
    const { InactiveError } = await import('../../../../src/services/errors/inactive-error');
    const error = new InactiveError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchaseBySupplierId(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(InactiveError);

    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
  });
});