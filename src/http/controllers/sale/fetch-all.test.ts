// tests/unit/controllers/sale/fetch-all.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { fetchAllSale } from '../../../../src/http/controllers/sale/fetch-all';
import { makeFetchAllSaleService } from '../../../../src/services/factories/sale/make-fetch-all-sale-service';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';
import { NoRecordsFoundError } from '../../../../src/services/errors/no-records-found-error';
import { InactiveError } from '../../../../src/services/errors/inactive-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/sale/make-fetch-all-sale-service');

describe('fetchAllSale Controller', () => {
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
    vi.mocked(makeFetchAllSaleService).mockReturnValue(mockService);

    // Mock do request e reply do Fastify
    mockRequest = {};

    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    // Mock do console.log e console.error para evitar poluição nos logs dos testes
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return all sales successfully', async () => {
    // Arrange
    const mockSales = [
      {
        id: 'sale-1',
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
      },
      {
        id: 'sale-2',
        userId: 'user-2',
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
      {
        id: 'sale-3',
        userId: 'user-1',
        nf_number: 'NF123458',
        total: 175.00,
        saleDate: new Date('2024-01-25'),
        items: [
          {
            productId: 'product-3',
            quantity: 20,
            value: 8.75,
          },
        ],
      },
    ];

    mockService.execute.mockResolvedValue({
      sale: mockSales,
    });

    // Act
    await fetchAllSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(makeFetchAllSaleService).toHaveBeenCalledTimes(1);
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(console.log).toHaveBeenCalledWith('Fetched sales:', mockSales);
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      sale: mockSales,
    });
  });

  it('should handle empty sales list', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      sale: [],
    });

    // Act
    await fetchAllSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(console.log).toHaveBeenCalledWith('Fetched sales:', []);
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      sale: [],
    });
  });

  it('should handle ResourceNotFoundError from service with 500 response', async () => {
    // Arrange
    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchAllSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(console.error).toHaveBeenCalledWith('Error fetching sales:', error);
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
    await fetchAllSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(console.error).toHaveBeenCalledWith('Error fetching sales:', error);
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
    await fetchAllSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(console.error).toHaveBeenCalledWith('Error fetching sales:', error);
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
    await fetchAllSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(console.error).toHaveBeenCalledWith('Error fetching sales:', error);
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
    await fetchAllSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(console.error).toHaveBeenCalledWith('Error fetching sales:', error);
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
    await fetchAllSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(console.error).toHaveBeenCalledWith('Error fetching sales:', error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle service returning null sales', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      sale: null,
    });

    // Act
    await fetchAllSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(console.log).toHaveBeenCalledWith('Fetched sales:', null);
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      sale: null,
    });
  });

  it('should handle service returning undefined sales', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      sale: undefined,
    });

    // Act
    await fetchAllSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(console.log).toHaveBeenCalledWith('Fetched sales:', undefined);
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      sale: undefined,
    });
  });

  it('should handle service method not returning sale property', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({}); // No sale property

    // Act
    await fetchAllSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(console.log).toHaveBeenCalledWith('Fetched sales:', undefined);
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      sale: undefined, // Destructuring will result in undefined
    });
  });

  it('should handle service returning single sale object instead of array', async () => {
    // Arrange
    const mockSingleSale = {
      id: 'sale-1',
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
      sale: mockSingleSale,
    });

    // Act
    await fetchAllSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(console.log).toHaveBeenCalledWith('Fetched sales:', mockSingleSale);
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      sale: mockSingleSale,
    });
  });

  it('should work with request parameters if provided', async () => {
    // Arrange
    mockRequest.params = {
      someParam: 'value',
    };

    const mockSales = [
      {
        id: 'sale-1',
        userId: 'user-1',
        nf_number: 'NF123456',
        total: 299.90,
        saleDate: new Date('2024-01-15'),
        items: [],
      },
    ];

    mockService.execute.mockResolvedValue({
      sale: mockSales,
    });

    // Act
    await fetchAllSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      sale: mockSales,
    });
  });
});