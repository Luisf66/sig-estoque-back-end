// tests/unit/controllers/sale/fetch-all-by-user-id.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { fetchAllSaleByUserId } from '../../../../src/http/controllers/sale/fetch-all-by-user-id';
import { makeFetchAllSaleByUserIdService } from '../../../../src/services/factories/sale/make-fetch-all-sale-by-user-id';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';
import { NoRecordsFoundError } from '../../../../src/services/errors/no-records-found-error';
import { InactiveError } from '../../../../src/services/errors/inactive-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/sale/make-fetch-all-sale-by-user-id');

describe('fetchAllSaleByUserId Controller', () => {
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
    vi.mocked(makeFetchAllSaleByUserIdService).mockReturnValue(mockService);

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

  it('should return sales for a valid user ID', async () => {
    // Arrange
    const mockSales = [
      {
        id: 'sale-1',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        nf_number: 'NF123456',
        total: 299.90,
        saleDate: new Date('2024-01-15'),
        items: [
          {
            productId: 'product-1',
            quantity: 10,
            value: 29.99,
          },
        ],
      },
      {
        id: 'sale-2',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        nf_number: 'NF123457',
        total: 77.50,
        saleDate: new Date('2024-01-20'),
        items: [
          {
            productId: 'product-2',
            quantity: 5,
            value: 15.50,
          },
        ],
      },
    ];

    mockService.execute.mockResolvedValue({
      sales: mockSales,
    });

    // Act
    await fetchAllSaleByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(makeFetchAllSaleByUserIdService).toHaveBeenCalledTimes(1);
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      sales: mockSales,
    });
  });

  it('should handle empty sales list', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      sales: [],
    });

    // Act
    await fetchAllSaleByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      sales: [],
    });
  });

  it('should handle ResourceNotFoundError from service with 500 response', async () => {
    // Arrange
    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchAllSaleByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle NoRecordsFoundError from service with 500 response', async () => {
    // Arrange
    const error = new NoRecordsFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchAllSaleByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle InactiveError from service with 500 response', async () => {
    // Arrange
    const error = new InactiveError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchAllSaleByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle InvalidCredentialError from service with 500 response', async () => {
    // Arrange
    const { InvalidCredentialError } = await import('../../../../src/services/errors/invalid-credential-error');
    const error = new InvalidCredentialError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchAllSaleByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle UserAlreadyExistsError from service with 500 response', async () => {
    // Arrange
    const { UserAlreadyExistsError } = await import('../../../../src/services/errors/user-already-exists-error');
    const error = new UserAlreadyExistsError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchAllSaleByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle generic errors from service with 500 response', async () => {
    // Arrange
    const error = new Error('Database connection failed');
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchAllSaleByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle invalid user ID format', async () => {
    // Arrange
    mockRequest.params = {
      userId: 'invalid-uuid',
    };

    const error = new Error('Database error');
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchAllSaleByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: 'invalid-uuid',
    });
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle missing user ID parameter', async () => {
    // Arrange
    mockRequest.params = {};

    const error = new Error('User ID is required');
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchAllSaleByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: undefined,
    });
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle service returning null sales', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      sales: null,
    });

    // Act
    await fetchAllSaleByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      sales: null,
    });
  });

  it('should handle service returning undefined sales', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      sales: undefined,
    });

    // Act
    await fetchAllSaleByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      sales: undefined,
    });
  });

  it('should handle service method not returning sales property', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({}); // No sales property

    // Act
    await fetchAllSaleByUserId(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      sales: undefined, // Destructuring will result in undefined
    });
  });
});