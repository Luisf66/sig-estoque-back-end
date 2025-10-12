// tests/unit/controllers/supplier/fetch-all.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { fetchAllSupplier } from '../../../../src/http/controllers/supplier/fetch-all';
import { makeFetchAllSupplierService } from '../../../../src/services/factories/supplier/make-fetch-all-supplier-service';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';
import { NoRecordsFoundError } from '../../../../src/services/errors/no-records-found-error';
import { InactiveError } from '../../../../src/services/errors/inactive-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/supplier/make-fetch-all-supplier-service');

describe('fetchAllSupplier Controller', () => {
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
    vi.mocked(makeFetchAllSupplierService).mockReturnValue(mockService);

    // Mock do request e reply do Fastify
    mockRequest = {};

    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  it('should return all suppliers successfully', async () => {
    // Arrange
    const mockSuppliers = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        social_name: 'Fornecedor ABC Ltda',
        company_name: 'ABC Distribuidora',
        phone_number: '(11) 99999-9999',
        cnpj: '12.345.678/0001-90',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        social_name: 'Fornecedor XYZ Ltda',
        company_name: 'XYZ Comércio',
        phone_number: '(11) 88888-8888',
        cnpj: '98.765.432/0001-10',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        social_name: 'Fornecedor Teste Ltda',
        company_name: 'Teste Empresa',
        phone_number: '(11) 77777-7777',
        cnpj: '11.222.333/0001-44',
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-17'),
      },
    ];

    mockService.execute.mockResolvedValue({
      supplier: mockSuppliers,
    });

    // Act
    await fetchAllSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(makeFetchAllSupplierService).toHaveBeenCalledTimes(1);
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSuppliers,
    });
  });

  it('should handle empty suppliers list', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      supplier: [],
    });

    // Act
    await fetchAllSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: [],
    });
  });

  it('should handle ResourceNotFoundError from service', async () => {
    // Arrange
    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllSupplier(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(ResourceNotFoundError);

    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle NoRecordsFoundError from service', async () => {
    // Arrange
    const error = new NoRecordsFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      fetchAllSupplier(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(NoRecordsFoundError);

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
      fetchAllSupplier(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(InactiveError);

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
      fetchAllSupplier(
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
      fetchAllSupplier(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(UserAlreadyExistsError);

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
      fetchAllSupplier(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow('Database connection failed');

    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle service returning null suppliers', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      supplier: null,
    });

    // Act
    await fetchAllSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: null,
    });
  });

  it('should handle service returning undefined suppliers', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      supplier: undefined,
    });

    // Act
    await fetchAllSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: undefined,
    });
  });

  it('should handle service method not returning supplier property', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({}); // No supplier property

    // Act
    await fetchAllSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: undefined, // Destructuring will result in undefined
    });
  });

  it('should handle service returning single supplier object instead of array', async () => {
    // Arrange
    const mockSingleSupplier = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      social_name: 'Fornecedor ABC Ltda',
      company_name: 'ABC Distribuidora',
      phone_number: '(11) 99999-9999',
      cnpj: '12.345.678/0001-90',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    mockService.execute.mockResolvedValue({
      supplier: mockSingleSupplier,
    });

    // Act
    await fetchAllSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSingleSupplier,
    });
  });

  it('should work with request parameters if provided', async () => {
    // Arrange
    mockRequest.params = {
      someParam: 'value',
    };

    const mockSuppliers = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        social_name: 'Fornecedor ABC Ltda',
        company_name: 'ABC Distribuidora',
        phone_number: '(11) 99999-9999',
        cnpj: '12.345.678/0001-90',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
    ];

    mockService.execute.mockResolvedValue({
      supplier: mockSuppliers,
    });

    // Act
    await fetchAllSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSuppliers,
    });
  });

  it('should handle service returning suppliers with minimal data', async () => {
    // Arrange
    const mockSuppliers = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        social_name: 'Fornecedor ABC Ltda',
        company_name: 'ABC Distribuidora',
        phone_number: '(11) 99999-9999',
        cnpj: '12.345.678/0001-90',
        // Sem createdAt e updatedAt
      },
    ];

    mockService.execute.mockResolvedValue({
      supplier: mockSuppliers,
    });

    // Act
    await fetchAllSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSuppliers,
    });
  });
});