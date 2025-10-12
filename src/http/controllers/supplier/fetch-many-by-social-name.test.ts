// tests/unit/controllers/supplier/fetch-many-by-social-name.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { fetchManyBySocialName } from '../../../../src/http/controllers/supplier/fetch-many-by-social-name';
import { makeFetchManySupplierBySocialNameService } from '../../../../src/services/factories/supplier/make-fetch-many-by-social-name';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';
import { NoRecordsFoundError } from '../../../../src/services/errors/no-records-found-error';
import { InactiveError } from '../../../../src/services/errors/inactive-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/supplier/make-fetch-many-by-social-name');

describe('fetchManyBySocialName Controller', () => {
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
    vi.mocked(makeFetchManySupplierBySocialNameService).mockReturnValue(mockService);

    // Mock do request e reply do Fastify
    mockRequest = {
      params: {
        socialName: 'Fornecedor ABC Ltda',
      },
    };

    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    // Mock do console.error para evitar poluição nos logs dos testes
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return suppliers for a valid social name', async () => {
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
        social_name: 'Fornecedor ABC EPP',
        company_name: 'ABC Comércio',
        phone_number: '(11) 88888-8888',
        cnpj: '12.345.678/0002-71',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
      },
    ];

    mockService.execute.mockResolvedValue({
      supplier: mockSuppliers,
    });

    // Act
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(makeFetchManySupplierBySocialNameService).toHaveBeenCalledTimes(1);
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: 'Fornecedor ABC Ltda',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSuppliers,
    });
  });

  it('should handle empty suppliers list for valid social name', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      supplier: [],
    });

    // Act
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: 'Fornecedor ABC Ltda',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: [],
    });
  });

  it('should handle ResourceNotFoundError from service with 500 response', async () => {
    // Arrange
    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: 'Fornecedor ABC Ltda',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching suppliers',
      statusCode: 500,
    });
  });

  it('should handle NoRecordsFoundError from service with 500 response', async () => {
    // Arrange
    const error = new NoRecordsFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: 'Fornecedor ABC Ltda',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching suppliers',
      statusCode: 500,
    });
  });

  it('should handle InactiveError from service with 500 response', async () => {
    // Arrange
    const error = new InactiveError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: 'Fornecedor ABC Ltda',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching suppliers',
      statusCode: 500,
    });
  });

  it('should handle InvalidCredentialError from service with 500 response', async () => {
    // Arrange
    const { InvalidCredentialError } = await import('../../../../src/services/errors/invalid-credential-error');
    const error = new InvalidCredentialError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: 'Fornecedor ABC Ltda',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching suppliers',
      statusCode: 500,
    });
  });

  it('should handle UserAlreadyExistsError from service with 500 response', async () => {
    // Arrange
    const { UserAlreadyExistsError } = await import('../../../../src/services/errors/user-already-exists-error');
    const error = new UserAlreadyExistsError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: 'Fornecedor ABC Ltda',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching suppliers',
      statusCode: 500,
    });
  });

  it('should handle generic errors from service with 500 response', async () => {
    // Arrange
    const error = new Error('Database connection failed');
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: 'Fornecedor ABC Ltda',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching suppliers',
      statusCode: 500,
    });
  });

  it('should handle social name with special characters', async () => {
    // Arrange
    mockRequest.params = {
      socialName: 'Fornecedor & Cia Ltda',
    };

    const mockSuppliers = [
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        social_name: 'Fornecedor & Cia Ltda',
        company_name: 'Fornecedor & Cia',
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
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: 'Fornecedor & Cia Ltda',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSuppliers,
    });
  });

  it('should handle social name with spaces', async () => {
    // Arrange
    mockRequest.params = {
      socialName: 'Fornecedor   ABC   Ltda',
    };

    const mockSuppliers = [
      {
        id: '123e4567-e89b-12d3-a456-426614174003',
        social_name: 'Fornecedor ABC Ltda',
        company_name: 'ABC Distribuidora',
        phone_number: '(11) 66666-6666',
        cnpj: '33.444.555/0001-66',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
      },
    ];

    mockService.execute.mockResolvedValue({
      supplier: mockSuppliers,
    });

    // Act
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: 'Fornecedor   ABC   Ltda',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSuppliers,
    });
  });

  it('should handle social name with accents', async () => {
    // Arrange
    mockRequest.params = {
      socialName: 'Fornecedor Ação Ltda',
    };

    const mockSuppliers = [
      {
        id: '123e4567-e89b-12d3-a456-426614174004',
        social_name: 'Fornecedor Ação Ltda',
        company_name: 'Ação Distribuidora',
        phone_number: '(11) 55555-5555',
        cnpj: '44.555.666/0001-77',
        createdAt: new Date('2024-01-19'),
        updatedAt: new Date('2024-01-19'),
      },
    ];

    mockService.execute.mockResolvedValue({
      supplier: mockSuppliers,
    });

    // Act
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: 'Fornecedor Ação Ltda',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSuppliers,
    });
  });

  it('should handle partial social name match', async () => {
    // Arrange
    mockRequest.params = {
      socialName: 'Fornecedor',
    };

    const mockSuppliers = [
      {
        id: '123e4567-e89b-12d3-a456-426614174005',
        social_name: 'Fornecedor ABC Ltda',
        company_name: 'ABC Distribuidora',
        phone_number: '(11) 44444-4444',
        cnpj: '55.666.777/0001-88',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174006',
        social_name: 'Fornecedor XYZ Ltda',
        company_name: 'XYZ Comércio',
        phone_number: '(11) 33333-3333',
        cnpj: '66.777.888/0001-99',
        createdAt: new Date('2024-01-21'),
        updatedAt: new Date('2024-01-21'),
      },
    ];

    mockService.execute.mockResolvedValue({
      supplier: mockSuppliers,
    });

    // Act
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: 'Fornecedor',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSuppliers,
    });
  });

  it('should handle missing social name parameter', async () => {
    // Arrange
    mockRequest.params = {};

    const error = new Error('Social name is required');
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: undefined,
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching suppliers',
      statusCode: 500,
    });
  });

  it('should handle empty social name string', async () => {
    // Arrange
    mockRequest.params = {
      socialName: '',
    };

    const mockSuppliers = [
      {
        id: '123e4567-e89b-12d3-a456-426614174007',
        social_name: '',
        company_name: 'Empresa Teste',
        phone_number: '(11) 22222-2222',
        cnpj: '77.888.999/0001-00',
        createdAt: new Date('2024-01-22'),
        updatedAt: new Date('2024-01-22'),
      },
    ];

    mockService.execute.mockResolvedValue({
      supplier: mockSuppliers,
    });

    // Act
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: '',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSuppliers,
    });
  });

  it('should handle service returning null suppliers', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      supplier: null,
    });

    // Act
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: 'Fornecedor ABC Ltda',
    });
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
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: 'Fornecedor ABC Ltda',
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
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: 'Fornecedor ABC Ltda',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: undefined, // Destructuring will result in undefined
    });
  });

  it('should handle service returning single supplier object instead of array', async () => {
    // Arrange
    const mockSingleSupplier = {
      id: '123e4567-e89b-12d3-a456-426614174008',
      social_name: 'Fornecedor Único Ltda',
      company_name: 'Único Comércio',
      phone_number: '(11) 11111-1111',
      cnpj: '88.999.000/0001-11',
      createdAt: new Date('2024-01-23'),
      updatedAt: new Date('2024-01-23'),
    };

    mockService.execute.mockResolvedValue({
      supplier: mockSingleSupplier,
    });

    // Act
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: 'Fornecedor ABC Ltda',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSingleSupplier,
    });
  });

  it('should handle case insensitive social name search', async () => {
    // Arrange
    mockRequest.params = {
      socialName: 'fornecedor abc ltda', // lowercase
    };

    const mockSuppliers = [
      {
        id: '123e4567-e89b-12d3-a456-426614174009',
        social_name: 'Fornecedor ABC Ltda', // uppercase
        company_name: 'ABC Distribuidora',
        phone_number: '(11) 00000-0000',
        cnpj: '99.000.111/0001-22',
        createdAt: new Date('2024-01-24'),
        updatedAt: new Date('2024-01-24'),
      },
    ];

    mockService.execute.mockResolvedValue({
      supplier: mockSuppliers,
    });

    // Act
    await fetchManyBySocialName(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      socialName: 'fornecedor abc ltda',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      supplier: mockSuppliers,
    });
  });
});