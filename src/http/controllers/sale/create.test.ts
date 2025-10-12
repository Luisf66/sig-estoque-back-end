// tests/unit/controllers/purchase/create.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { createSale } from '../../../../src/http/controllers/sale/create';
import { makeCreateSaleService } from '../../../../src/services/factories/sale/make-create-sale-service';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';
import { InactiveError } from '../../../../src/services/errors/inactive-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/sale/make-create-sale-service');

describe('createSale Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockService: any;

  beforeEach(() => {
    // Reset dos mocks
    vi.clearAllMocks();

    // Mock do serviço
    mockService = {
      handle: vi.fn(),
    };

    // Mock da factory
    vi.mocked(makeCreateSaleService).mockReturnValue(mockService);

    // Mock do request e reply do Fastify
    mockRequest = {
      body: {
        nf_number: 'NF123456',
        userId: '123e4567-e89b-12d3-a456-426614174000',
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
      },
    };

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  it('should create a sale successfully with valid data', async () => {
    // Arrange
    mockService.handle.mockResolvedValue(undefined);

    // Act
    await createSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(makeCreateSaleService).toHaveBeenCalledTimes(1);
    expect(mockService.handle).toHaveBeenCalledWith({
      nf_number: 'NF123456',
      userId: '123e4567-e89b-12d3-a456-426614174000',
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
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should return 400 for invalid request payload (ZodError)', async () => {
    // Arrange
    mockRequest.body = {
      nf_number: 'NF123456',
      // userId missing - should trigger Zod validation error
      items: [
        {
          productId: 'product-1',
          quantity: 10,
          value: 29.99,
        },
      ],
    };

    // Act
    await createSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).not.toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({ 
      message: 'Invalid request payload' 
    });
  });

  it('should return 400 for invalid items array', async () => {
    // Arrange
    mockRequest.body = {
      nf_number: 'NF123456',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      items: [
        {
          productId: 'product-1',
          quantity: 'invalid', // should be number
          value: 29.99,
        },
      ],
    };

    // Act
    await createSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).not.toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({ 
      message: 'Invalid request payload' 
    });
  });

  it('should handle ResourceNotFoundError from service with 500 response', async () => {
    // Arrange
    const error = new ResourceNotFoundError();
    mockService.handle.mockRejectedValue(error);

    // Act
    await createSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({ 
      message: 'Internal Server Error' 
    });
  });

  it('should handle InactiveError from service with 500 response', async () => {
    // Arrange
    const error = new InactiveError();
    mockService.handle.mockRejectedValue(error);

    // Act
    await createSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({ 
      message: 'Internal Server Error' 
    });
  });

  it('should handle generic errors from service with 500 response', async () => {
    // Arrange
    const error = new Error('Database connection failed');
    mockService.handle.mockRejectedValue(error);

    // Act
    await createSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({ 
      message: 'Internal Server Error' 
    });
  });

  it('should handle InvalidCredentialError from service with 500 response', async () => {
    // Arrange
    const { InvalidCredentialError } = await import('../../../../src/services/errors/invalid-credential-error');
    const error = new InvalidCredentialError();
    mockService.handle.mockRejectedValue(error);

    // Act
    await createSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({ 
      message: 'Internal Server Error' 
    });
  });

  it('should handle UserAlreadyExistsError from service with 500 response', async () => {
    // Arrange
    const { UserAlreadyExistsError } = await import('../../../../src/services/errors/user-already-exists-error');
    const error = new UserAlreadyExistsError();
    mockService.handle.mockRejectedValue(error);

    // Act
    await createSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({ 
      message: 'Internal Server Error' 
    });
  });

  it('should handle NoRecordsFoundError from service with 500 response', async () => {
    // Arrange
    const { NoRecordsFoundError } = await import('../../../../src/services/errors/no-records-found-error');
    const error = new NoRecordsFoundError();
    mockService.handle.mockRejectedValue(error);

    // Act
    await createSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({ 
      message: 'Internal Server Error' 
    });
  });

  it('should handle empty items array', async () => {
    // Arrange
    mockRequest.body = {
      nf_number: 'NF123456',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      items: [],
    };

    mockService.handle.mockResolvedValue(undefined);

    // Act
    await createSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalledWith({
      nf_number: 'NF123456',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      items: [],
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle single item in array', async () => {
    // Arrange
    mockRequest.body = {
      nf_number: 'NF123456',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      items: [
        {
          productId: 'product-1',
          quantity: 1,
          value: 10.00,
        },
      ],
    };

    mockService.handle.mockResolvedValue(undefined);

    // Act
    await createSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalledWith({
      nf_number: 'NF123456',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      items: [
        {
          productId: 'product-1',
          quantity: 1,
          value: 10.00,
        },
      ],
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle missing request body', async () => {
    // Arrange
    mockRequest.body = undefined;

    // Act
    await createSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).not.toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({ 
      message: 'Invalid request payload' 
    });
  });

  it('should handle invalid nf_number type', async () => {
    // Arrange
    mockRequest.body = {
      nf_number: 123456, // should be string
      userId: '123e4567-e89b-12d3-a456-426614174000',
      items: [
        {
          productId: 'product-1',
          quantity: 10,
          value: 29.99,
        },
      ],
    };

    // Act
    await createSale(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).not.toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({ 
      message: 'Invalid request payload' 
    });
  });
});