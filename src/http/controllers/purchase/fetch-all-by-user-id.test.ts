// tests/unit/controllers/purchase/fetch-all-by-user-id.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { fetchAllPurchaseByUserId } from '../../../../src/http/controllers/purchase/fetch-all-by-user-id';
import { makeFetchAllPurchaseByUserIdService } from '../../../../src/services/factories/purchase/make-fetch-all-purchase-by-user-id';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';
import { NoRecordsFoundError } from '../../../../src/services/errors/no-records-found-error';
import { InactiveError } from '../../../../src/services/errors/inactive-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/purchase/make-fetch-all-purchase-by-user-id');

describe('fetchAllPurchaseByUserId Controller', () => {
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
    vi.mocked(makeFetchAllPurchaseByUserIdService).mockReturnValue(mockService);

    // Mock do request e reply do Fastify
    mockRequest = {
      params: {
        userId: '123e4567-e89b-12d3-a456-426614174000',
      },
    };

    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  it('should return purchases for a valid user ID', async () => {
    // Arrange
    const mockPurchases = [
      {
        id: 'purchase-1',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        supplierId: 'supplier-1',
        productId: 'product-1',
        quantity: 10,
        unitPrice: 29.99,
        totalPrice: 299.90,
        purchaseDate: new Date('2024-01-15'),
      },
      {
        id: 'purchase-2',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        supplierId: 'supplier-2',
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
    await fetchAllPurchaseByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(makeFetchAllPurchaseByUserIdService).toHaveBeenCalledTimes(1);
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
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
    await fetchAllPurchaseByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
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

    // Act & Assert
    await expect(
      fetchAllPurchaseByUserId(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(ResourceNotFoundError);

    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle NoRecordsFoundError from service', async () => {
    // Arrange
    const error = new NoRecordsFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchaseByUserId(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(NoRecordsFoundError);

    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle InactiveError from service', async () => {
    // Arrange
    const error = new InactiveError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchaseByUserId(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(InactiveError);

    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle generic errors from service', async () => {
    // Arrange
    const error = new Error('Database connection failed');
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchaseByUserId(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow('Database connection failed');

    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle invalid user ID format', async () => {
    // Arrange
    mockRequest.params = {
      userId: 'invalid-uuid',
    };

    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchaseByUserId(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(ResourceNotFoundError);

    expect(mockService.execute).toHaveBeenCalledWith({
      userId: 'invalid-uuid',
    });
  });

  it('should handle missing user ID parameter', async () => {
    // Arrange
    mockRequest.params = {};

    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchaseByUserId(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(ResourceNotFoundError);

    expect(mockService.execute).toHaveBeenCalledWith({
      userId: undefined,
    });
  });

  it('should handle InvalidCredentialError from service', async () => {
    // Arrange
    const { InvalidCredentialError } = await import('../../../../src/services/errors/invalid-credential-error');
    const error = new InvalidCredentialError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchaseByUserId(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(InvalidCredentialError);

    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
  });

  it('should handle UserAlreadyExistsError from service', async () => {
    // Arrange
    const { UserAlreadyExistsError } = await import('../../../../src/services/errors/user-already-exists-error');
    const error = new UserAlreadyExistsError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllPurchaseByUserId(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(UserAlreadyExistsError);

    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
  });
});