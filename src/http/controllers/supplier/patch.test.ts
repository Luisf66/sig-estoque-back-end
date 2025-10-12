// tests/unit/controllers/supplier/patch.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { patchSupplier } from '../../../../src/http/controllers/supplier/patch';
import { makePatchSupplierService } from '../../../../src/services/factories/supplier/make-patch-supplier-service';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';
import { InactiveError } from '../../../../src/services/errors/inactive-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/supplier/make-patch-supplier-service');

describe('patchSupplier Controller', () => {
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
    vi.mocked(makePatchSupplierService).mockReturnValue(mockService);

    // Mock do request e reply do Fastify
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000',
      },
      body: {
        social_name: 'Fornecedor ABC Atualizado Ltda',
        company_name: 'ABC Distribuidora Atualizada',
      },
    };

    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    // Mock do console.error para evitar poluição nos logs dos testes
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should update supplier successfully with valid partial data', async () => {
    // Arrange
    const mockUpdatedSupplier = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      social_name: 'Fornecedor ABC Atualizado Ltda',
      company_name: 'ABC Distribuidora Atualizada',
      phone_number: '(11) 99999-9999',
      cnpj: '12.345.678/0001-90',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
    };

    mockService.handle.mockResolvedValue({
      supplier: mockUpdatedSupplier,
    });

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(makePatchSupplierService).toHaveBeenCalledTimes(1);
    expect(mockService.handle).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        social_name: 'Fornecedor ABC Atualizado Ltda',
        company_name: 'ABC Distribuidora Atualizada',
        phone_number: undefined,
        cnpj: undefined,
      },
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockUpdatedSupplier,
    });
  });

  it('should update supplier successfully with all fields', async () => {
    // Arrange
    mockRequest.body = {
      social_name: 'Fornecedor ABC Atualizado Ltda',
      company_name: 'ABC Distribuidora Atualizada',
      phone_number: '(11) 88888-8888',
      cnpj: '12.345.678/0001-90',
    };

    const mockUpdatedSupplier = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      social_name: 'Fornecedor ABC Atualizado Ltda',
      company_name: 'ABC Distribuidora Atualizada',
      phone_number: '(11) 88888-8888',
      cnpj: '12.345.678/0001-90',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
    };

    mockService.handle.mockResolvedValue({
      supplier: mockUpdatedSupplier,
    });

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        social_name: 'Fornecedor ABC Atualizado Ltda',
        company_name: 'ABC Distribuidora Atualizada',
        phone_number: '(11) 88888-8888',
        cnpj: '12.345.678/0001-90',
      },
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockUpdatedSupplier,
    });
  });

  it('should update supplier successfully with single field', async () => {
    // Arrange
    mockRequest.body = {
      phone_number: '(11) 77777-7777',
    };

    const mockUpdatedSupplier = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      social_name: 'Fornecedor ABC Ltda',
      company_name: 'ABC Distribuidora',
      phone_number: '(11) 77777-7777',
      cnpj: '12.345.678/0001-90',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
    };

    mockService.handle.mockResolvedValue({
      supplier: mockUpdatedSupplier,
    });

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        social_name: undefined,
        company_name: undefined,
        phone_number: '(11) 77777-7777',
        cnpj: undefined,
      },
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockUpdatedSupplier,
    });
  });

  it('should return 400 for invalid request payload (ZodError) - invalid field types', async () => {
    // Arrange
    mockRequest.body = {
      social_name: 'Fornecedor ABC Ltda',
      company_name: 12345, // should be string
      phone_number: '(11) 99999-9999',
    };

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).not.toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid input',
    });
  });

  // REMOVIDO: Teste com campos extras, pois Zod por padrão permite (strip behavior)
  // Se você quiser rejeitar campos extras, precisa usar .strict() no schema

  it('should ignore extra fields in request body (Zod strip behavior)', async () => {
    // Arrange
    mockRequest.body = {
      social_name: 'Fornecedor ABC Ltda',
      company_name: 'ABC Distribuidora',
      invalid_field: 'should be ignored', // Campo extra será ignorado pelo Zod
      another_invalid: 12345,
    };

    const mockUpdatedSupplier = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      social_name: 'Fornecedor ABC Ltda',
      company_name: 'ABC Distribuidora',
      phone_number: '(11) 99999-9999',
      cnpj: '12.345.678/0001-90',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
    };

    mockService.handle.mockResolvedValue({
      supplier: mockUpdatedSupplier,
    });

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    // Zod deve ignorar campos extras e passar apenas os validados
    expect(mockService.handle).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        social_name: 'Fornecedor ABC Ltda',
        company_name: 'ABC Distribuidora',
        phone_number: undefined,
        cnpj: undefined,
      },
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockUpdatedSupplier,
    });
  });

  it('should handle empty request body', async () => {
    // Arrange
    mockRequest.body = {};

    const mockUpdatedSupplier = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      social_name: 'Fornecedor ABC Ltda',
      company_name: 'ABC Distribuidora',
      phone_number: '(11) 99999-9999',
      cnpj: '12.345.678/0001-90',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    mockService.handle.mockResolvedValue({
      supplier: mockUpdatedSupplier,
    });

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        social_name: undefined,
        company_name: undefined,
        phone_number: undefined,
        cnpj: undefined,
      },
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockUpdatedSupplier,
    });
  });

  it('should handle ResourceNotFoundError from service with 500 response', async () => {
    // Arrange
    const error = new ResourceNotFoundError();
    mockService.handle.mockRejectedValue(error);

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An error occurred while updating the supplier',
    });
  });

  it('should handle InactiveError from service with 500 response', async () => {
    // Arrange
    const error = new InactiveError();
    mockService.handle.mockRejectedValue(error);

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An error occurred while updating the supplier',
    });
  });

  it('should handle InvalidCredentialError from service with 500 response', async () => {
    // Arrange
    const { InvalidCredentialError } = await import('../../../../src/services/errors/invalid-credential-error');
    const error = new InvalidCredentialError();
    mockService.handle.mockRejectedValue(error);

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An error occurred while updating the supplier',
    });
  });

  it('should handle UserAlreadyExistsError from service with 500 response', async () => {
    // Arrange
    const { UserAlreadyExistsError } = await import('../../../../src/services/errors/user-already-exists-error');
    const error = new UserAlreadyExistsError();
    mockService.handle.mockRejectedValue(error);

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An error occurred while updating the supplier',
    });
  });

  it('should handle NoRecordsFoundError from service with 500 response', async () => {
    // Arrange
    const { NoRecordsFoundError } = await import('../../../../src/services/errors/no-records-found-error');
    const error = new NoRecordsFoundError();
    mockService.handle.mockRejectedValue(error);

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An error occurred while updating the supplier',
    });
  });

  it('should handle generic errors from service with 500 response', async () => {
    // Arrange
    const error = new Error('Database connection failed');
    mockService.handle.mockRejectedValue(error);

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An error occurred while updating the supplier',
    });
  });

  it('should handle invalid supplier ID format', async () => {
    // Arrange
    mockRequest.params = {
      id: 'invalid-uuid',
    };

    const error = new ResourceNotFoundError();
    mockService.handle.mockRejectedValue(error);

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalledWith({
      id: 'invalid-uuid',
      data: {
        social_name: 'Fornecedor ABC Atualizado Ltda',
        company_name: 'ABC Distribuidora Atualizada',
        phone_number: undefined,
        cnpj: undefined,
      },
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An error occurred while updating the supplier',
    });
  });

  it('should handle missing supplier ID parameter', async () => {
    // Arrange
    mockRequest.params = {};

    const error = new Error('Supplier ID is required');
    mockService.handle.mockRejectedValue(error);

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalledWith({
      id: undefined,
      data: {
        social_name: 'Fornecedor ABC Atualizado Ltda',
        company_name: 'ABC Distribuidora Atualizada',
        phone_number: undefined,
        cnpj: undefined,
      },
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An error occurred while updating the supplier',
    });
  });

  it('should handle missing request body', async () => {
    // Arrange
    mockRequest.body = undefined;

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).not.toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid input',
    });
  });

  it('should handle service returning null supplier', async () => {
    // Arrange
    mockService.handle.mockResolvedValue({
      supplier: null,
    });

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: null,
    });
  });

  it('should handle service returning undefined supplier', async () => {
    // Arrange
    mockService.handle.mockResolvedValue({
      supplier: undefined,
    });

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: undefined,
    });
  });

  it('should handle service method not returning supplier property', async () => {
    // Arrange
    mockService.handle.mockResolvedValue({}); // No supplier property

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: undefined, // Destructuring will result in undefined
    });
  });

  it('should handle fields with empty strings', async () => {
    // Arrange
    mockRequest.body = {
      social_name: '', // empty string - Zod permite pois é string
      phone_number: '(11) 88888-8888',
    };

    const mockUpdatedSupplier = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      social_name: '',
      company_name: 'ABC Distribuidora',
      phone_number: '(11) 88888-8888',
      cnpj: '12.345.678/0001-90',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
    };

    mockService.handle.mockResolvedValue({
      supplier: mockUpdatedSupplier,
    });

    // Act
    await patchSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        social_name: '',
        company_name: undefined,
        phone_number: '(11) 88888-8888',
        cnpj: undefined,
      },
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockUpdatedSupplier,
    });
  });
});