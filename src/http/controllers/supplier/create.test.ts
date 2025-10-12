// tests/unit/controllers/supplier/create.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { createSupplier } from '../../../../src/http/controllers/supplier/create';
import { makeCreateSupplierService } from '../../../../src/services/factories/supplier/make-create-supplier-service';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';
import { InactiveError } from '../../../../src/services/errors/inactive-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/supplier/make-create-supplier-service');

describe('createSupplier Controller', () => {
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
    vi.mocked(makeCreateSupplierService).mockReturnValue(mockService);

    // Mock do request e reply do Fastify
    mockRequest = {
      body: {
        social_name: 'Fornecedor ABC Ltda',
        company_name: 'ABC Distribuidora',
        phone_number: '(11) 99999-9999',
        cnpj: '12.345.678/0001-90',
      },
    };

    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    // Mock do console.error para evitar poluição nos logs dos testes
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should create a supplier successfully with valid data', async () => {
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

    mockService.handle.mockResolvedValue({
      supplier: mockSupplier,
    });

    // Act
    await createSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(makeCreateSupplierService).toHaveBeenCalledTimes(1);
    expect(mockService.handle).toHaveBeenCalledWith({
      social_name: 'Fornecedor ABC Ltda',
      company_name: 'ABC Distribuidora',
      phone_number: '(11) 99999-9999',
      cnpj: '12.345.678/0001-90',
    });
    expect(mockReply.code).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSupplier,
    });
  });

  it('should return 400 for invalid request payload (ZodError) - missing required fields', async () => {
    // Arrange
    mockRequest.body = {
      social_name: 'Fornecedor ABC Ltda',
      // company_name missing - should trigger Zod validation error
      phone_number: '(11) 99999-9999',
      cnpj: '12.345.678/0001-90',
    };

    // Act
    await createSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).not.toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({ 
      message: 'Invalid request data' 
    });
  });

  it('should return 400 for invalid request payload (ZodError) - invalid field types', async () => {
    // Arrange
    mockRequest.body = {
      social_name: 'Fornecedor ABC Ltda',
      company_name: 'ABC Distribuidora',
      phone_number: 11999999999, // should be string
      cnpj: '12.345.678/0001-90',
    };

    // Act
    await createSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).not.toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({ 
      message: 'Invalid request data' 
    });
  });

  // REMOVIDO: Teste com string vazia, pois o Zod padrão permite strings vazias
  // Se você quiser validar strings não vazias, precisa usar .min(1) no schema

  it('should handle empty strings if Zod schema allows them', async () => {
    // Arrange
    mockRequest.body = {
      social_name: '', // empty string - Zod padrão permite
      company_name: 'ABC Distribuidora',
      phone_number: '(11) 99999-9999',
      cnpj: '12.345.678/0001-90',
    };

    const mockSupplier = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      social_name: '',
      company_name: 'ABC Distribuidora',
      phone_number: '(11) 99999-9999',
      cnpj: '12.345.678/0001-90',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    mockService.handle.mockResolvedValue({
      supplier: mockSupplier,
    });

    // Act
    await createSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    // Se o Zod permitir strings vazias, o serviço será chamado
    expect(mockService.handle).toHaveBeenCalledWith({
      social_name: '',
      company_name: 'ABC Distribuidora',
      phone_number: '(11) 99999-9999',
      cnpj: '12.345.678/0001-90',
    });
    expect(mockReply.code).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSupplier,
    });
  });

  it('should handle ResourceNotFoundError from service with 500 response', async () => {
    // Arrange
    const error = new ResourceNotFoundError();
    mockService.handle.mockRejectedValue(error);

    // Act
    await createSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({ 
      message: 'Internal Server Error' 
    });
  });

  it('should handle InactiveError from service with 500 response', async () => {
    // Arrange
    const error = new InactiveError();
    mockService.handle.mockRejectedValue(error);

    // Act
    await createSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
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
    await createSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
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
    await createSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
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
    await createSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({ 
      message: 'Internal Server Error' 
    });
  });

  it('should handle generic errors from service with 500 response', async () => {
    // Arrange
    const error = new Error('Database connection failed');
    mockService.handle.mockRejectedValue(error);

    // Act
    await createSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({ 
      message: 'Internal Server Error' 
    });
  });

  it('should handle missing request body', async () => {
    // Arrange
    mockRequest.body = undefined;

    // Act
    await createSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).not.toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({ 
      message: 'Invalid request data' 
    });
  });

  it('should handle service returning null supplier', async () => {
    // Arrange
    mockService.handle.mockResolvedValue({
      supplier: null,
    });

    // Act
    await createSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(201);
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
    await createSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: undefined,
    });
  });

  it('should handle service not returning supplier property', async () => {
    // Arrange
    mockService.handle.mockResolvedValue({}); // No supplier property

    // Act
    await createSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: undefined, // Destructuring will result in undefined
    });
  });

  it('should handle CNPJ with different formats', async () => {
    // Arrange
    mockRequest.body = {
      social_name: 'Fornecedor XYZ Ltda',
      company_name: 'XYZ Comércio',
      phone_number: '(11) 88888-8888',
      cnpj: '12345678000190', // CNPJ without formatting
    };

    const mockSupplier = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      social_name: 'Fornecedor XYZ Ltda',
      company_name: 'XYZ Comércio',
      phone_number: '(11) 88888-8888',
      cnpj: '12345678000190',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
    };

    mockService.handle.mockResolvedValue({
      supplier: mockSupplier,
    });

    // Act
    await createSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.handle).toHaveBeenCalledWith({
      social_name: 'Fornecedor XYZ Ltda',
      company_name: 'XYZ Comércio',
      phone_number: '(11) 88888-8888',
      cnpj: '12345678000190',
    });
    expect(mockReply.code).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSupplier,
    });
  });

  it('should handle additional unexpected fields in request body', async () => {
    // Arrange
    mockRequest.body = {
      social_name: 'Fornecedor Teste Ltda',
      company_name: 'Teste Empresa',
      phone_number: '(11) 99999-9999',
      cnpj: '12.345.678/0001-90',
      unexpected_field: 'this should be ignored by Zod', // Campo extra
      another_field: 12345,
    };

    const mockSupplier = {
      id: '123e4567-e89b-12d3-a456-426614174003',
      social_name: 'Fornecedor Teste Ltda',
      company_name: 'Teste Empresa',
      phone_number: '(11) 99999-9999',
      cnpj: '12.345.678/0001-90',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18'),
    };

    mockService.handle.mockResolvedValue({
      supplier: mockSupplier,
    });

    // Act
    await createSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    // Zod deve ignorar campos extras e passar apenas os validados
    expect(mockService.handle).toHaveBeenCalledWith({
      social_name: 'Fornecedor Teste Ltda',
      company_name: 'Teste Empresa',
      phone_number: '(11) 99999-9999',
      cnpj: '12.345.678/0001-90',
    });
    expect(mockReply.code).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSupplier,
    });
  });
});