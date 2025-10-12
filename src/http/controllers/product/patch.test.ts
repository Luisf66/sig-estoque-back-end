// tests/unit/controllers/product/patch.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { patchProduct } from '../../../../src/http/controllers/product/patch';
import { makePatchProductService } from '../../../../src/services/factories/product/make-patch-product-service';
import { NoRecordsFoundError } from '../../../../src/services/errors/no-records-found-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/product/make-patch-product-service');

const mockMakePatchProductService = vi.mocked(makePatchProductService);

describe('patchProduct Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockPatchProductService: {
    handle: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      },
      body: {
        name: 'Updated Product Name',
        description: 'Updated Product Description',
        price: 39.99,
        quantity_in_stock: 75,
        batch: 'UPDATED1'
      }
    };

    mockReply = {
      code: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockPatchProductService = {
      handle: vi.fn()
    };

    mockMakePatchProductService.mockReturnValue(mockPatchProductService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should patch a product successfully with all fields', async () => {
    // Arrange
    const mockUpdatedProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Updated Product Name',
      description: 'Updated Product Description',
      price: 39.99,
      quantity_in_stock: 75,
      batch: 'UPDATED1',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockPatchProductService.handle.mockResolvedValue({
      product: mockUpdatedProduct
    });

    // Act
    await patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockMakePatchProductService).toHaveBeenCalledOnce();
    expect(mockPatchProductService.handle).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        name: 'Updated Product Name',
        description: 'Updated Product Description',
        price: 39.99,
        quantity_in_stock: 75,
        batch: 'UPDATED1'
      }
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      product: mockUpdatedProduct
    });
  });

  it('should patch a product successfully with partial fields', async () => {
    // Arrange
    mockRequest.body = {
      name: 'Only Name Updated',
      price: 49.99
      // outros campos omitidos
    };

    const mockUpdatedProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Only Name Updated',
      description: 'Original Description', // Não foi atualizado
      price: 49.99,
      quantity_in_stock: 100, // Não foi atualizado
      batch: 'ORIGINAL1', // Não foi atualizado
      created_at: new Date(),
      updated_at: new Date()
    };

    mockPatchProductService.handle.mockResolvedValue({
      product: mockUpdatedProduct
    });

    // Act
    await patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockPatchProductService.handle).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        name: 'Only Name Updated',
        price: 49.99,
        description: undefined,
        quantity_in_stock: undefined,
        batch: undefined
      }
    });
  });

  it('should patch a product with only one field', async () => {
    // Arrange
    mockRequest.body = {
      name: 'Single Field Update'
      // apenas um campo
    };

    const mockUpdatedProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Single Field Update',
      description: 'Original Description',
      price: 29.99,
      quantity_in_stock: 100,
      batch: 'ORIGINAL1',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockPatchProductService.handle.mockResolvedValue({
      product: mockUpdatedProduct
    });

    // Act
    await patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockPatchProductService.handle).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        name: 'Single Field Update',
        description: undefined,
        price: undefined,
        quantity_in_stock: undefined,
        batch: undefined
      }
    });
  });

  it('should return 404 when product is not found', async () => {
    // Arrange
    mockPatchProductService.handle.mockRejectedValue(
      new NoRecordsFoundError() // Mensagem fixa "No records found."
    );

    // Act
    await patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'No records found.'
    });
  });

  it('should throw ZodError when body contains invalid data', async () => {
    // Arrange
    mockRequest.body = {
      name: 'Valid Name',
      price: 'invalid-price', // Preço não é número
      quantity_in_stock: 50
    };

    // Act & Assert
    await expect(
      patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);

    // O serviço não deve ser chamado quando a validação falha
    expect(mockPatchProductService.handle).not.toHaveBeenCalled();
  });

  it('should handle empty request body successfully', async () => {
    // Arrange
    mockRequest.body = {}; // Body vazio - todos os campos são undefined

    const mockUpdatedProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Original Name',
      description: 'Original Description',
      price: 29.99,
      quantity_in_stock: 100,
      batch: 'ORIGINAL1',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockPatchProductService.handle.mockResolvedValue({
      product: mockUpdatedProduct
    });

    // Act
    await patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - serviço é chamado com todos os campos undefined
    expect(mockPatchProductService.handle).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        name: undefined,
        description: undefined,
        price: undefined,
        quantity_in_stock: undefined,
        batch: undefined
      }
    });
  });

  it('should rethrow unexpected errors', async () => {
    // Arrange
    const unexpectedError = new Error('Database connection failed');
    mockPatchProductService.handle.mockRejectedValue(unexpectedError);

    // Act & Assert
    await expect(
      patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow('Database connection failed');
    
    // Verifica que não foi chamado o status 404
    expect(mockReply.status).not.toHaveBeenCalledWith(404);
  });

  it('should handle different UUID formats', async () => {
    // Arrange
    const uuidFormats = [
      '123e4567-e89b-12d3-a456-426614174000',
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
    ];

    for (const uuid of uuidFormats) {
      mockRequest.params = { id: uuid };
      mockRequest.body = { name: 'Updated Product' };

      const mockUpdatedProduct = {
        id: uuid,
        name: 'Updated Product',
        description: 'Description',
        price: 29.99,
        quantity_in_stock: 100,
        batch: 'BATCH1',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPatchProductService.handle.mockResolvedValue({
        product: mockUpdatedProduct
      });

      // Act
      await patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert
      expect(mockPatchProductService.handle).toHaveBeenCalledWith({
        id: uuid,
        data: expect.objectContaining({
          name: 'Updated Product'
        })
      });

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });
});

// Testes adicionais para casos específicos
describe('patchProduct Controller - Edge Cases', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockPatchProductService: {
    handle: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockReply = {
      code: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockPatchProductService = {
      handle: vi.fn()
    };

    mockMakePatchProductService.mockReturnValue(mockPatchProductService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should always return fixed message for NoRecordsFoundError', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      },
      body: {
        name: 'Updated Name'
      }
    };

    mockPatchProductService.handle.mockRejectedValue(
      new NoRecordsFoundError() // Sem mensagem customizada - usa a fixa
    );

    // Act
    await patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - deve sempre retornar a mensagem fixa da classe
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'No records found.'
    });
  });

  it('should handle products with special characters in data', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      },
      body: {
        name: 'Produto Café & Chá Atualizado',
        description: 'Descrição atualizada com caracteres especiais: áéíóú ñ ç'
      }
    };

    const mockUpdatedProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Produto Café & Chá Atualizado',
      description: 'Descrição atualizada com caracteres especiais: áéíóú ñ ç',
      price: 29.99,
      quantity_in_stock: 100,
      batch: 'SPECIAL1',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockPatchProductService.handle.mockResolvedValue({
      product: mockUpdatedProduct
    });

    // Act
    await patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockPatchProductService.handle).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        name: 'Produto Café & Chá Atualizado',
        description: 'Descrição atualizada com caracteres especiais: áéíóú ñ ç',
        price: undefined,
        quantity_in_stock: undefined,
        batch: undefined
      }
    });
  });

  it('should handle various error types from service', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      },
      body: {
        name: 'Test Product'
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

      mockPatchProductService.handle.mockRejectedValue(error);

      // Act & Assert - deve rejeitar com o erro original
      await expect(
        patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toBe(error);

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle empty string id', async () => {
    // Arrange
    mockRequest.params = {
      id: ''
    };
    mockRequest.body = {
      name: 'Updated Product'
    };

    const mockUpdatedProduct = {
      id: '',
      name: 'Updated Product',
      description: 'Description',
      price: 29.99,
      quantity_in_stock: 100,
      batch: 'BATCH1',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockPatchProductService.handle.mockResolvedValue({
      product: mockUpdatedProduct
    });

    // Act
    await patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - serviço é chamado mesmo com ID vazio
    expect(mockPatchProductService.handle).toHaveBeenCalledWith({
      id: '',
      data: expect.objectContaining({
        name: 'Updated Product'
      })
    });
  });

  it('should handle empty string id with NoRecordsFoundError', async () => {
    // Arrange
    mockRequest.params = {
      id: ''
    };
    mockRequest.body = {
      name: 'Updated Product'
    };

    mockPatchProductService.handle.mockRejectedValue(
      new NoRecordsFoundError()
    );

    // Act
    await patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - deve retornar 404 mesmo com ID vazio
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'No records found.'
    });
  });

  it('should handle undefined params by throwing error', async () => {
    // Arrange
    mockRequest.params = undefined;
    mockRequest.body = {
      name: 'Updated Product'
    };

    // Act & Assert - deve lançar erro ao tentar desestruturar undefined
    await expect(
      patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow();

    // O serviço não deve ser chamado
    expect(mockPatchProductService.handle).not.toHaveBeenCalled();
  });

  it('should handle params missing id property by having undefined id', async () => {
    // Arrange
    mockRequest.params = {
      // id está faltando
      otherParam: 'value'
    };
    mockRequest.body = {
      name: 'Updated Product'
    };

    const mockUpdatedProduct = {
      id: undefined,
      name: 'Updated Product',
      description: 'Description',
      price: 29.99,
      quantity_in_stock: 100,
      batch: 'BATCH1',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockPatchProductService.handle.mockResolvedValue({
      product: mockUpdatedProduct
    });

    // Act
    await patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - serviço é chamado com id undefined
    expect(mockPatchProductService.handle).toHaveBeenCalledWith({
      id: undefined,
      data: expect.objectContaining({
        name: 'Updated Product'
      })
    });
  });

  it('should handle different field combinations', async () => {
    // Arrange - testando diferentes combinações de campos
    const fieldCombinations = [
      { body: { name: 'Name Only' } },
      { body: { description: 'Description Only' } },
      { body: { price: 99.99 } },
      { body: { quantity_in_stock: 200 } },
      { body: { batch: 'NEWBATCH' } },
      { body: { name: 'Name', price: 49.99 } },
      { body: { description: 'Desc', quantity_in_stock: 50 } },
      { body: { price: 19.99, batch: 'BATCH99' } }
    ];

    for (const combination of fieldCombinations) {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.body = combination.body;

      const mockUpdatedProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Product',
        description: 'Description',
        price: 29.99,
        quantity_in_stock: 100,
        batch: 'BATCH1',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPatchProductService.handle.mockResolvedValue({
        product: mockUpdatedProduct
      });

      // Act
      await patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert
      expect(mockPatchProductService.handle).toHaveBeenCalledWith({
        id: '123e4567-e89b-12d3-a456-426614174000',
        data: expect.objectContaining(combination.body)
      });

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle extreme values for numeric fields', async () => {
    // Arrange
    mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
    mockRequest.body = {
      price: 0.01, // Preço muito baixo
      quantity_in_stock: 1000000 // Quantidade muito alta
    };

    const mockUpdatedProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Product',
      description: 'Description',
      price: 0.01,
      quantity_in_stock: 1000000,
      batch: 'BATCH1',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockPatchProductService.handle.mockResolvedValue({
      product: mockUpdatedProduct
    });

    // Act
    await patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockPatchProductService.handle).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        name: undefined,
        description: undefined,
        price: 0.01,
        quantity_in_stock: 1000000,
        batch: undefined
      }
    });
  });

  it('should handle empty strings for optional fields', async () => {
    // Arrange
    mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
    mockRequest.body = {
      name: '', // Nome vazio
      description: '', // Descrição vazia
      batch: '' // Batch vazio
    };

    const mockUpdatedProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: '',
      description: '',
      price: 29.99,
      quantity_in_stock: 100,
      batch: '',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockPatchProductService.handle.mockResolvedValue({
      product: mockUpdatedProduct
    });

    // Act
    await patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - Zod permite strings vazias para campos optional
    expect(mockPatchProductService.handle).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        name: '',
        description: '',
        price: undefined,
        quantity_in_stock: undefined,
        batch: ''
      }
    });
  });

  it('should validate that service is only called when validation passes', async () => {
    // Arrange - casos onde a validação deve falhar vs passar
    const testCases = [
      { 
        params: undefined, // deve falhar - params undefined
        body: { name: 'Test' },
        shouldCallService: false 
      },
      { 
        params: { id: 'valid-id' },
        body: { price: 'invalid' }, // deve falhar - preço inválido
        shouldCallService: false 
      },
      { 
        params: { id: 'valid-id' },
        body: { quantity_in_stock: 'invalid' }, // deve falhar - quantidade inválida
        shouldCallService: false 
      },
      { 
        params: { id: 'valid-id' },
        body: { name: 'Valid Name' }, // deve passar
        shouldCallService: true 
      },
      { 
        params: { id: 'valid-id' },
        body: {}, // deve passar - body vazio
        shouldCallService: true 
      }
    ];

    for (const testCase of testCases) {
      mockRequest.params = testCase.params as any;
      mockRequest.body = testCase.body;

      if (testCase.shouldCallService) {
        // Configura o mock para sucesso quando o serviço deve ser chamado
        mockPatchProductService.handle.mockResolvedValue({
          product: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Product',
            description: 'Description',
            price: 29.99,
            quantity_in_stock: 100,
            batch: 'BATCH1',
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        // Act - não deve lançar erro
        await expect(
          patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
        ).resolves.not.toThrow();

        // Assert - serviço deve ser chamado
        expect(mockPatchProductService.handle).toHaveBeenCalled();
      } else {
        // Act & Assert - deve lançar erro
        await expect(
          patchProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
        ).rejects.toThrow();

        // Assert - serviço não deve ser chamado
        expect(mockPatchProductService.handle).not.toHaveBeenCalled();
      }

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });
});