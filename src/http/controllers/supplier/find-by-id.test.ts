// tests/unit/controllers/supplier/find-by-id.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { findSupplierById } from '../../../../src/http/controllers/supplier/find-by-id';
import { makeFindSupplierByIdService } from '../../../../src/services/factories/supplier/make-find-supplier-by-id-service';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';
import { NoRecordsFoundError } from '../../../../src/services/errors/no-records-found-error';
import { InactiveError } from '../../../../src/services/errors/inactive-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/supplier/make-find-supplier-by-id-service');

describe('findSupplierById Controller', () => {
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
    vi.mocked(makeFindSupplierByIdService).mockReturnValue(mockService);

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

  it('should return supplier for a valid ID', async () => {
    // Arrange
    const mockSupplier = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      social_name: 'Fornecedor ABC Ltda',
      company_name: 'ABC Distribuidora',
      phone_number: '(11) 99999-9999',
      cnpj: '12.345.678/0001-90',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    mockService.execute.mockResolvedValue({
      supplier: mockSupplier,
    });

    // Act
    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(makeFindSupplierByIdService).toHaveBeenCalledTimes(1);
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSupplier,
    });
  });

  it('should handle ResourceNotFoundError from service with 500 response', async () => {
    // Arrange
    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching the supplier',
      statusCode: 500,
    });
  });

  it('should handle NoRecordsFoundError from service with 500 response', async () => {
    // Arrange
    const error = new NoRecordsFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching the supplier',
      statusCode: 500,
    });
  });

  it('should handle InactiveError from service with 500 response', async () => {
    // Arrange
    const error = new InactiveError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching the supplier',
      statusCode: 500,
    });
  });

  it('should handle InvalidCredentialError from service with 500 response', async () => {
    // Arrange
    const { InvalidCredentialError } = await import('../../../../src/services/errors/invalid-credential-error');
    const error = new InvalidCredentialError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching the supplier',
      statusCode: 500,
    });
  });

  it('should handle UserAlreadyExistsError from service with 500 response', async () => {
    // Arrange
    const { UserAlreadyExistsError } = await import('../../../../src/services/errors/user-already-exists-error');
    const error = new UserAlreadyExistsError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching the supplier',
      statusCode: 500,
    });
  });

  it('should handle generic errors from service with 500 response', async () => {
    // Arrange
    const error = new Error('Database connection failed');
    mockService.execute.mockRejectedValue(error);

    // Act
    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching the supplier',
      statusCode: 500,
    });
  });

  it('should handle invalid supplier ID format', async () => {
    // Arrange
    mockRequest.params = {
      id: 'invalid-uuid',
    };

    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: 'invalid-uuid',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching the supplier',
      statusCode: 500,
    });
  });

  it('should handle missing supplier ID parameter', async () => {
    // Arrange
    mockRequest.params = {};

    const error = new Error('Supplier ID is required');
    mockService.execute.mockRejectedValue(error);

    // Act
    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: undefined,
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching the supplier',
      statusCode: 500,
    });
  });

  it('should handle service returning null supplier', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      supplier: null,
    });

    // Act
    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: null,
    });
  });

  it('should handle service returning undefined supplier', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      supplier: undefined,
    });

    // Act
    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: undefined,
    });
  });

  it('should handle service method not returning supplier property', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({}); // No supplier property

    // Act
    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: undefined, // Destructuring will result in undefined
    });
  });

  it('should handle service returning supplier with minimal data', async () => {
    // Arrange
    const mockSupplier = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      social_name: 'Fornecedor ABC Ltda',
      company_name: 'ABC Distribuidora',
      phone_number: '(11) 99999-9999',
      cnpj: '12.345.678/0001-90',
      // Sem createdAt e updatedAt
    };

    mockService.execute.mockResolvedValue({
      supplier: mockSupplier,
    });

    // Act
    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSupplier,
    });
  });

  it('should handle service returning supplier with all fields', async () => {
    // Arrange
    const mockSupplier = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      social_name: 'Fornecedor ABC Ltda',
      company_name: 'ABC Distribuidora',
      phone_number: '(11) 99999-9999',
      cnpj: '12.345.678/0001-90',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      // Campos adicionais que podem existir
      email: 'contato@abc.com.br',
      address: 'Rua Teste, 123',
    };

    mockService.execute.mockResolvedValue({
      supplier: mockSupplier,
    });

    // Act
    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSupplier,
    });
  });

  it('should handle UUID with different format', async () => {
    // Arrange
    mockRequest.params = {
      id: '123e4567-e89b-12d3-a456-426614174001',
    };

    const mockSupplier = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      social_name: 'Fornecedor XYZ Ltda',
      company_name: 'XYZ Comércio',
      phone_number: '(11) 88888-8888',
      cnpj: '98.765.432/0001-10',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
    };

    mockService.execute.mockResolvedValue({
      supplier: mockSupplier,
    });

    // Act
    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174001',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSupplier,
    });
  });

  it('should handle service returning empty object as supplier', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      supplier: {},
    });

    // Act
    await findSupplierById(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: {},
    });
  });
});