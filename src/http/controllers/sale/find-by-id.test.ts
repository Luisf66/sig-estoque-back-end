// tests/unit/controllers/sale/find-by-id.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { findSaleById } from '../../../../src/http/controllers/sale/find-by-id';
import { makeFindSaleByIdService } from '../../../../src/services/factories/sale/make-find-sale-by-id-service';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';
import { NoRecordsFoundError } from '../../../../src/services/errors/no-records-found-error';
import { InactiveError } from '../../../../src/services/errors/inactive-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/sale/make-find-sale-by-id-service');

describe('findSaleById Controller', () => {
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
    vi.mocked(makeFindSaleByIdService).mockReturnValue(mockService);

    // Mock do request e reply do Fastify
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000',
      },
    };

    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    // Mock do console.error para evitar poluição nos logs dos testes
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return sale for a valid ID', async () => {
    // Arrange
    const mockSale = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-1',
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
    };

    mockService.execute.mockResolvedValue({
      sale: mockSale,
    });

    // Act
    await findSaleById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(makeFindSaleByIdService).toHaveBeenCalledTimes(1);
    expect(mockService.execute).toHaveBeenCalledWith({
      saleId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      sale: mockSale,
    });
  });

  it('should return 404 when sale is not found (sale is null)', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      sale: null,
    });

    // Act
    await findSaleById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      saleId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Sale not found',
    });
  });

  it('should return 404 when sale is not found (sale is undefined)', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      sale: undefined,
    });

    // Act
    await findSaleById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      saleId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Sale not found',
    });
  });

  it('should return 404 when service does not return sale property', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({}); // No sale property

    // Act
    await findSaleById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      saleId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Sale not found',
    });
  });

  it('should handle ResourceNotFoundError from service with 500 response', async () => {
    // Arrange
    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await findSaleById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      saleId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith('Error fetching sale by ID:', error);
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
    await findSaleById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      saleId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith('Error fetching sale by ID:', error);
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
    await findSaleById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      saleId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith('Error fetching sale by ID:', error);
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
    await findSaleById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      saleId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith('Error fetching sale by ID:', error);
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
    await findSaleById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      saleId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith('Error fetching sale by ID:', error);
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
    await findSaleById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      saleId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith('Error fetching sale by ID:', error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle invalid sale ID format', async () => {
    // Arrange
    mockRequest.params = {
      id: 'invalid-uuid',
    };

    const error = new Error('Invalid ID format');
    mockService.execute.mockRejectedValue(error);

    // Act
    await findSaleById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      saleId: 'invalid-uuid',
    });
    expect(console.error).toHaveBeenCalledWith('Error fetching sale by ID:', error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle missing sale ID parameter', async () => {
    // Arrange
    mockRequest.params = {};

    const error = new Error('Sale ID is required');
    mockService.execute.mockRejectedValue(error);

    // Act
    await findSaleById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      saleId: undefined,
    });
    expect(console.error).toHaveBeenCalledWith('Error fetching sale by ID:', error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle service returning sale with empty items', async () => {
    // Arrange
    const mockSale = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-1',
      nf_number: 'NF123456',
      total: 0,
      saleDate: new Date('2024-01-15'),
      items: [],
    };

    mockService.execute.mockResolvedValue({
      sale: mockSale,
    });

    // Act
    await findSaleById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      saleId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      sale: mockSale,
    });
  });

  it('should handle service returning sale with multiple items', async () => {
    // Arrange
    const mockSale = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-1',
      nf_number: 'NF123456',
      total: 377.40,
      saleDate: new Date('2024-01-15'),
      items: [
        {
          productId: 'product-1',
          quantity: 10,
          value: 29.99,
        },
        {
          productId: 'product-2',
          quantity: 5,
          value: 15.50,
        },
      ],
    };

    mockService.execute.mockResolvedValue({
      sale: mockSale,
    });

    // Act
    await findSaleById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      saleId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      sale: mockSale,
    });
  });
});