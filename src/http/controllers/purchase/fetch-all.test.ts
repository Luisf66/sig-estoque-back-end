// tests/unit/controllers/purchase/fetch-all.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { fetchAllPurchase } from '../../../../src/http/controllers/purchase/fetch-all';
import { makeFetchAllPurchaseService } from '../../../../src/services/factories/purchase/make-fetch-all-purchase-service';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';
import { NoRecordsFoundError } from '../../../../src/services/errors/no-records-found-error';
import { InactiveError } from '../../../../src/services/errors/inactive-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/purchase/make-fetch-all-purchase-service');

describe('fetchAllPurchase Controller', () => {
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
    vi.mocked(makeFetchAllPurchaseService).mockReturnValue(mockService);

    // Mock do request e reply do Fastify
    mockRequest = {};

    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  it('should return all purchases successfully', async () => {
    // Arrange
    const mockPurchases = [
      {
        id: 'purchase-1',
        userId: 'user-1',
        supplierId: 'supplier-1',
        productId: 'product-1',
        quantity: 10,
        unitPrice: 29.99,
        totalPrice: 299.90,
        purchaseDate: new Date('2024-01-15'),
      },
      {
        id: 'purchase-2',
        userId: 'user-2',
        supplierId: 'supplier-2',
        productId: 'product-2',
        quantity: 5,
        unitPrice: 15.50,
        totalPrice: 77.50,
        purchaseDate: new Date('2024-01-20'),
      },
      {
        id: 'purchase-3',
        userId: 'user-1',
        supplierId: 'supplier-3',
        productId: 'product-3',
        quantity: 20,
        unitPrice: 8.75,
        totalPrice: 175.00,
        purchaseDate: new Date('2024-01-25'),
      },
    ];

    mockService.execute.mockResolvedValue({
      purchase: mockPurchases,
    });

    // Act
    await fetchAllPurchase(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(makeFetchAllPurchaseService).toHaveBeenCalledTimes(1);
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      purchase: mockPurchases,
    });
  });

  it('should handle empty purchases list', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      purchase: [],
    });

    // Act
    await fetchAllPurchase(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      purchase: [],
    });
  });

  it('should handle NoRecordsFoundError from service', async () => {
    // Arrange
    const error = new NoRecordsFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchase(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(NoRecordsFoundError);

    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle ResourceNotFoundError from service', async () => {
    // Arrange
    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchase(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(ResourceNotFoundError);

    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle InactiveError from service', async () => {
    // Arrange
    const error = new InactiveError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchase(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(InactiveError);

    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle generic errors from service', async () => {
    // Arrange
    const error = new Error('Database connection failed');
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchase(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow('Database connection failed');

    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle InvalidCredentialError from service', async () => {
    // Arrange
    const { InvalidCredentialError } = await import('../../../../src/services/errors/invalid-credential-error');
    const error = new InvalidCredentialError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchase(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(InvalidCredentialError);

    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle UserAlreadyExistsError from service', async () => {
    // Arrange
    const { UserAlreadyExistsError } = await import('../../../../src/services/errors/user-already-exists-error');
    const error = new UserAlreadyExistsError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchase(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(UserAlreadyExistsError);

    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle service returning null purchases', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      purchase: null,
    });

    // Act
    await fetchAllPurchase(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      purchase: null,
    });
  });

  it('should handle service returning undefined purchases', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      purchase: undefined,
    });

    // Act
    await fetchAllPurchase(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      purchase: undefined,
    });
  });
});