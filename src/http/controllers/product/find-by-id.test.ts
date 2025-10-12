// tests/unit/controllers/product/find-by-id.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { findProductById } from '../../../../src/http/controllers/product/find-by-id';
import { makeFindProductByIdService } from '../../../../src/services/factories/product/make-find-product-by-id-service';
import { NoRecordsFoundError } from '../../../../src/services/errors/no-records-found-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/product/make-find-product-by-id-service');

const mockMakeFindProductByIdService = vi.mocked(makeFindProductByIdService);

describe('findProductById Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockFindProductByIdService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockFindProductByIdService = {
      execute: vi.fn()
    };

    mockMakeFindProductByIdService.mockReturnValue(mockFindProductByIdService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should find a product by id successfully', async () => {
    // Arrange
    const mockProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Product',
      description: 'Test Description',
      price: 29.99,
      quantity_in_stock: 100,
      batch: 'BATCH1',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockFindProductByIdService.execute.mockResolvedValue({
      product: mockProduct
    });

    // Act
    await findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockMakeFindProductByIdService).toHaveBeenCalledOnce();
    expect(mockFindProductByIdService.execute).toHaveBeenCalledWith({
      productId: '123e4567-e89b-12d3-a456-426614174000'
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      product: mockProduct
    });
  });

  it('should return 404 when product is not found', async () => {
    // Arrange
    mockFindProductByIdService.execute.mockRejectedValue(
      new NoRecordsFoundError() // Mensagem fixa "No records found."
    );

    // Act
    await findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'No records found.'
    });
  });

  it('should throw ZodError when id is missing in params', async () => {
    // Arrange
    mockRequest.params = {
      // id está faltando
    };

    // Act & Assert
    await expect(
      findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);
    
    // O serviço não deve ser chamado quando a validação falha
    expect(mockFindProductByIdService.execute).not.toHaveBeenCalled();
  });

  it('should handle empty string id by calling service (Zod allows empty strings)', async () => {
    // Arrange
    mockRequest.params = {
      id: ''
    };

    // Mock do serviço para retornar null quando ID é vazio
    mockFindProductByIdService.execute.mockResolvedValue({
      product: null
    });

    // Act
    await findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - Como o Zod permite string vazia, o serviço é chamado
    expect(mockFindProductByIdService.execute).toHaveBeenCalledWith({
      productId: ''
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      product: null
    });
  });

  it('should throw ZodError when id is not a string', async () => {
    // Arrange
    mockRequest.params = {
      id: 123 as any // Tipo incorreto
    };

    // Act & Assert
    await expect(
      findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);
    
    // O serviço não deve ser chamado quando a validação falha
    expect(mockFindProductByIdService.execute).not.toHaveBeenCalled();
  });

  it('should rethrow unexpected errors', async () => {
    // Arrange
    const unexpectedError = new Error('Database connection failed');
    mockFindProductByIdService.execute.mockRejectedValue(unexpectedError);

    // Act & Assert
    await expect(
      findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow('Database connection failed');
    
    // Verifica que não foi chamado o status 404
    expect(mockReply.status).not.toHaveBeenCalledWith(404);
  });

  it('should handle different UUID formats', async () => {
    // Arrange
    const uuidFormats = [
      '123e4567-e89b-12d3-a456-426614174000', // UUID v4
      '550e8400-e29b-41d4-a716-446655440000', // Outro UUID v4
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8' // UUID v1
    ];

    for (const uuid of uuidFormats) {
      mockRequest.params = { id: uuid };
      
      const mockProduct = {
        id: uuid,
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        quantity_in_stock: 100,
        batch: 'BATCH1',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockFindProductByIdService.execute.mockResolvedValue({
        product: mockProduct
      });

      // Act
      await findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert
      expect(mockFindProductByIdService.execute).toHaveBeenCalledWith({
        productId: uuid
      });
      expect(mockReply.send).toHaveBeenCalledWith({
        product: mockProduct
      });

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });
});

// Testes adicionais para casos específicos
describe('findProductById Controller - Edge Cases', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockFindProductByIdService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockFindProductByIdService = {
      execute: vi.fn()
    };

    mockMakeFindProductByIdService.mockReturnValue(mockFindProductByIdService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should always return fixed message for NoRecordsFoundError', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    mockFindProductByIdService.execute.mockRejectedValue(
      new NoRecordsFoundError() // Sem mensagem customizada - usa a fixa
    );

    // Act
    await findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - deve sempre retornar a mensagem fixa da classe
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'No records found.'
    });
  });

  it('should handle service returning null product', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    mockFindProductByIdService.execute.mockResolvedValue({
      product: null
    });

    // Act
    await findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      product: null
    });
  });

  it('should throw ZodError when params are undefined', async () => {
    // Arrange
    mockRequest.params = undefined;

    // Act & Assert
    await expect(
      findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);
    
    // O serviço não deve ser chamado
    expect(mockFindProductByIdService.execute).not.toHaveBeenCalled();
  });

  it('should handle various error types from service', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    const errorTypes = [
      new Error('Generic error'),
      new TypeError('Type error'),
      { customError: 'Custom error object' },
      'String error message'
    ];

    for (const error of errorTypes) {
      if (error instanceof NoRecordsFoundError) {
        continue; // Pula pois já testamos NoRecordsFoundError separadamente
      }

      mockFindProductByIdService.execute.mockRejectedValue(error);

      // Act & Assert - deve rejeitar com o erro original
      await expect(
        findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toBe(error);

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle product with special characters in data', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    const productWithSpecialChars = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Produto Café & Chá Especial',
      description: 'Descrição com caracteres especiais: áéíóú ñ ç',
      price: 49.99,
      quantity_in_stock: 25,
      batch: 'SPEC1',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockFindProductByIdService.execute.mockResolvedValue({
      product: productWithSpecialChars
    });

    // Act
    await findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      product: productWithSpecialChars
    });
  });

  it('should handle multiple NoRecordsFoundError instances with same message', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: 'non-existent-id'
      }
    };

    // Simula múltiplas instâncias do erro (todas com a mesma mensagem fixa)
    const errorInstances = [
      new NoRecordsFoundError(),
      new NoRecordsFoundError(),
      new NoRecordsFoundError()
    ];

    for (const errorInstance of errorInstances) {
      mockFindProductByIdService.execute.mockRejectedValue(errorInstance);

      // Act
      await findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert - mensagem sempre fixa
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'No records found.'
      });

      // Reset para o próximo teste
      vi.clearAllMocks();
    }
  });

  it('should not catch other custom errors', async () => {
    // Arrange - Simulando outros erros personalizados que não devem ser tratados
    class OtherCustomError extends Error {
      constructor() {
        super('Other custom error');
      }
    }

    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    mockFindProductByIdService.execute.mockRejectedValue(
      new OtherCustomError()
    );

    // Act & Assert - deve rejeitar com o erro original
    await expect(
      findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow('Other custom error');
  });

  it('should validate that service is only called when validation passes', async () => {
    // Arrange - casos onde a validação deve falhar vs passar
    const testCases = [
      { 
        params: undefined, // deve falhar
        shouldCallService: false 
      },
      { 
        params: {}, // deve falhar - id faltando
        shouldCallService: false 
      },
      { 
        params: { id: 123 }, // deve falhar - tipo errado
        shouldCallService: false 
      },
      { 
        params: { id: '' }, // deve passar - Zod permite string vazia
        shouldCallService: true 
      },
      { 
        params: { id: 'valid-uuid' }, // deve passar
        shouldCallService: true 
      }
    ];

    for (const testCase of testCases) {
      mockRequest.params = testCase.params as any;

      if (testCase.shouldCallService) {
        // Configura o mock para sucesso quando o serviço deve ser chamado
        mockFindProductByIdService.execute.mockResolvedValue({
          product: null
        });

        // Act - não deve lançar erro
        await expect(
          findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply)
        ).resolves.not.toThrow();

        // Assert - serviço deve ser chamado
        expect(mockFindProductByIdService.execute).toHaveBeenCalled();
      } else {
        // Act & Assert - deve lançar erro
        await expect(
          findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply)
        ).rejects.toThrow();

        // Assert - serviço não deve ser chamado
        expect(mockFindProductByIdService.execute).not.toHaveBeenCalled();
      }

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle empty string id with NoRecordsFoundError', async () => {
    // Arrange
    mockRequest.params = {
      id: ''
    };

    mockFindProductByIdService.execute.mockRejectedValue(
      new NoRecordsFoundError()
    );

    // Act
    await findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - deve retornar 404 mesmo com ID vazio
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'No records found.'
    });
  });

  it('should handle product with additional properties', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    const productWithExtraProps = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Product with Extra Properties',
      description: 'Product description',
      price: 39.99,
      quantity_in_stock: 50,
      batch: 'EXTRA1',
      created_at: new Date(),
      updated_at: new Date(),
      category: 'Electronics',
      supplier: 'Supplier A',
      is_active: true,
      weight: 2.5,
      dimensions: '10x5x3 cm'
    };

    mockFindProductByIdService.execute.mockResolvedValue({
      product: productWithExtraProps
    });

    // Act
    await findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      product: productWithExtraProps
    });
  });

  it('should handle products with extreme price and quantity values', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    const productWithExtremeValues = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Extreme Value Product',
      description: 'Product with extreme price and quantity',
      price: 0.01, // Preço muito baixo
      quantity_in_stock: 1000000, // Quantidade muito alta
      batch: 'EXTREME1',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockFindProductByIdService.execute.mockResolvedValue({
      product: productWithExtremeValues
    });

    // Act
    await findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      product: productWithExtremeValues
    });
  });

  it('should handle product with different batch formats', async () => {
    // Arrange
    const batchFormats = [
      'ABC123',
      'XYZ789',
      'BATCH01',
      'LOT99',
      '123456'
    ];

    for (const batch of batchFormats) {
      mockRequest = {
        params: {
          id: '123e4567-e89b-12d3-a456-426614174000'
        }
      };

      const productWithBatch = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        quantity_in_stock: 100,
        batch: batch,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockFindProductByIdService.execute.mockResolvedValue({
        product: productWithBatch
      });

      // Act
      await findProductById(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert
      expect(mockReply.send).toHaveBeenCalledWith({
        product: productWithBatch
      });

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });
});