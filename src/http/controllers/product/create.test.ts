// tests/unit/controllers/product/create.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { createProduct } from '../../../../src/http/controllers/product/create';
import { makeCreateProductService } from '../../../../src/services/factories/product/make-create-product-service';

// Mock das dependências
vi.mock('../../../../src/services/factories/product/make-create-product-service');

const mockMakeCreateProductService = vi.mocked(makeCreateProductService);

describe('createProduct Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockCreateProductService: {
    handle: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockRequest = {
      body: {
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        quantity_in_stock: 100
      }
    };

    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockCreateProductService = {
      handle: vi.fn()
    };

    mockMakeCreateProductService.mockReturnValue(mockCreateProductService);

    // Mock do Math.random para gerar um batch previsível
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789);
    vi.spyOn(global.Math, 'random').mockReturnValue(0.123456789);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should create a product successfully', async () => {
    // Arrange
    const mockProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Product',
      description: 'Test Description',
      price: 29.99,
      quantity_in_stock: 100,
      batch: '4ZIRXG',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockCreateProductService.handle.mockResolvedValue({
      product: mockProduct
    });

    // Act
    await createProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockMakeCreateProductService).toHaveBeenCalledOnce();
    expect(mockCreateProductService.handle).toHaveBeenCalledWith({
      name: 'Test Product',
      description: 'Test Description',
      price: 29.99,
      quantity_in_stock: 100,
      batch: expect.any(String) // Não testamos o batch exato pois pode variar
    });
    expect(mockReply.code).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({
      product: mockProduct
    });
  });

  it('should throw ZodError when required fields are missing', async () => {
    // Arrange
    mockRequest.body = {
      // Campos obrigatórios faltando
      name: 'Test Product',
      description: 'Test Description'
      // price e quantity_in_stock faltando
    };

    // Act & Assert
    await expect(
      createProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);

    // O serviço não deve ser chamado quando a validação falha
    expect(mockCreateProductService.handle).not.toHaveBeenCalled();
  });

  it('should throw ZodError when price is not a number', async () => {
    // Arrange
    mockRequest.body = {
      name: 'Test Product',
      description: 'Test Description',
      price: 'invalid-price', // Preço não é número
      quantity_in_stock: 100
    };

    // Act & Assert
    await expect(
      createProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);

    expect(mockCreateProductService.handle).not.toHaveBeenCalled();
  });

  it('should throw ZodError when quantity_in_stock is not a number', async () => {
    // Arrange
    mockRequest.body = {
      name: 'Test Product',
      description: 'Test Description',
      price: 29.99,
      quantity_in_stock: 'invalid-quantity' // Quantidade não é número
    };

    // Act & Assert
    await expect(
      createProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);

    expect(mockCreateProductService.handle).not.toHaveBeenCalled();
  });

  it('should handle empty request body', async () => {
    // Arrange
    mockRequest.body = undefined;

    // Act & Assert
    await expect(
      createProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);

    expect(mockCreateProductService.handle).not.toHaveBeenCalled();
  });

  it('should handle service errors', async () => {
    // Arrange
    const serviceError = new Error('Database connection failed');
    mockCreateProductService.handle.mockRejectedValue(serviceError);

    // Act & Assert
    await expect(
      createProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow('Database connection failed');
  });
});

// Testes adicionais para casos específicos
describe('createProduct Controller - Edge Cases', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockCreateProductService: {
    handle: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockCreateProductService = {
      handle: vi.fn()
    };

    mockMakeCreateProductService.mockReturnValue(mockCreateProductService);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should handle products with special characters in name and description', async () => {
    // Arrange
    mockRequest = {
      body: {
        name: 'Produto Especial Café & Chá',
        description: 'Descrição com caracteres especiais: áéíóú ñ ç',
        price: 49.99,
        quantity_in_stock: 50
      }
    };

    const mockProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Produto Especial Café & Chá',
      description: 'Descrição com caracteres especiais: áéíóú ñ ç',
      price: 49.99,
      quantity_in_stock: 50,
      batch: 'TEST12',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockCreateProductService.handle.mockResolvedValue({
      product: mockProduct
    });

    // Act
    await createProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockCreateProductService.handle).toHaveBeenCalledWith({
      name: 'Produto Especial Café & Chá',
      description: 'Descrição com caracteres especiais: áéíóú ñ ç',
      price: 49.99,
      quantity_in_stock: 50,
      batch: expect.any(String)
    });
  });

  it('should handle different price values', async () => {
    // Arrange - testando diferentes formatos de preço válidos
    const priceScenarios = [
      { price: 0, expected: 0 }, // Preço zero
      { price: 0.99, expected: 0.99 }, // Preço decimal
      { price: 100, expected: 100 }, // Preço inteiro
      { price: 9999.99, expected: 9999.99 } // Preço alto
    ];

    for (const scenario of priceScenarios) {
      mockRequest = {
        body: {
          name: 'Test Product',
          description: 'Test Description',
          price: scenario.price,
          quantity_in_stock: 10
        }
      };

      const mockProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'Test Description',
        price: scenario.expected,
        quantity_in_stock: 10,
        batch: 'BATCH1',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockCreateProductService.handle.mockResolvedValue({
        product: mockProduct
      });

      // Act
      await createProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert
      expect(mockCreateProductService.handle).toHaveBeenCalledWith({
        name: 'Test Product',
        description: 'Test Description',
        price: scenario.expected,
        quantity_in_stock: 10,
        batch: expect.any(String)
      });

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle different quantity values', async () => {
    // Arrange - testando diferentes valores de quantidade
    const quantityScenarios = [
      { quantity: 0, expected: 0 }, // Quantidade zero
      { quantity: 1, expected: 1 }, // Quantidade mínima
      { quantity: 9999, expected: 9999 }, // Quantidade alta
      { quantity: 1000000, expected: 1000000 } // Quantidade muito alta
    ];

    for (const scenario of quantityScenarios) {
      mockRequest = {
        body: {
          name: 'Test Product',
          description: 'Test Description',
          price: 19.99,
          quantity_in_stock: scenario.quantity
        }
      };

      const mockProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'Test Description',
        price: 19.99,
        quantity_in_stock: scenario.expected,
        batch: 'BATCH1',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockCreateProductService.handle.mockResolvedValue({
        product: mockProduct
      });

      // Act
      await createProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert
      expect(mockCreateProductService.handle).toHaveBeenCalledWith({
        name: 'Test Product',
        description: 'Test Description',
        price: 19.99,
        quantity_in_stock: scenario.expected,
        batch: expect.any(String)
      });

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should generate a batch code with correct format', async () => {
    // Arrange
    mockRequest = {
      body: {
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        quantity_in_stock: 100
      }
    };

    const mockProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Product',
      description: 'Test Description',
      price: 29.99,
      quantity_in_stock: 100,
      batch: 'TEST12',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockCreateProductService.handle.mockResolvedValue({
      product: mockProduct
    });

    // Act
    await createProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - verifica se o batch foi gerado com formato correto
    expect(mockCreateProductService.handle).toHaveBeenCalledWith(
      expect.objectContaining({
        batch: expect.stringMatching(/^[A-Z0-9]{6}$/) // 6 caracteres alfanuméricos maiúsculos
      })
    );
  });

  it('should handle long product names and descriptions', async () => {
    // Arrange
    const longName = 'A'.repeat(255);
    const longDescription = 'B'.repeat(1000);
    
    mockRequest = {
      body: {
        name: longName,
        description: longDescription,
        price: 39.99,
        quantity_in_stock: 75
      }
    };

    const mockProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: longName,
      description: longDescription,
      price: 39.99,
      quantity_in_stock: 75,
      batch: 'LONG12',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockCreateProductService.handle.mockResolvedValue({
      product: mockProduct
    });

    // Act
    await createProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockCreateProductService.handle).toHaveBeenCalledWith({
      name: longName,
      description: longDescription,
      price: 39.99,
      quantity_in_stock: 75,
      batch: expect.any(String)
    });
  });

  it('should validate that service is only called when validation passes', async () => {
    // Arrange - casos onde a validação deve falhar vs passar
    const testCases = [
      { 
        body: undefined, // deve falhar
        shouldCallService: false 
      },
      { 
        body: {}, // deve falhar - campos obrigatórios faltando
        shouldCallService: false 
      },
      { 
        body: {
          name: 'Test Product',
          description: 'Test Description',
          price: 'invalid', // deve falhar - preço inválido
          quantity_in_stock: 100
        },
        shouldCallService: false 
      },
      { 
        body: {
          name: 'Test Product',
          description: 'Test Description',
          price: 29.99,
          quantity_in_stock: 'invalid' // deve falhar - quantidade inválida
        },
        shouldCallService: false 
      },
      { 
        body: {
          name: 'Test Product',
          description: 'Test Description',
          price: 29.99,
          quantity_in_stock: 100 // deve passar
        },
        shouldCallService: true 
      }
    ];

    for (const testCase of testCases) {
      // Reset do mock para cada teste
      mockCreateProductService.handle.mockClear();
      mockMakeCreateProductService.mockReturnValue(mockCreateProductService);

      mockRequest.body = testCase.body;

      if (testCase.shouldCallService) {
        // Configura o mock para sucesso quando o serviço deve ser chamado
        mockCreateProductService.handle.mockResolvedValue({
          product: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test Product',
            description: 'Test Description',
            price: 29.99,
            quantity_in_stock: 100,
            batch: 'BATCH1',
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        // Act - não deve lançar erro
        await expect(
          createProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
        ).resolves.not.toThrow();

        // Assert - serviço deve ser chamado
        expect(mockCreateProductService.handle).toHaveBeenCalled();
      } else {
        // Act & Assert - deve lançar erro
        await expect(
          createProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
        ).rejects.toThrow();

        // Assert - serviço não deve ser chamado
        expect(mockCreateProductService.handle).not.toHaveBeenCalled();
      }
    }
  });

  it('should handle name and description with empty strings (Zod allows empty strings)', async () => {
    // Arrange
    const emptyStringCases = [
      { 
        body: {
          name: '', // Nome vazio
          description: 'Test Description',
          price: 29.99,
          quantity_in_stock: 100
        }
      },
      { 
        body: {
          name: 'Test Product',
          description: '', // Descrição vazia
          price: 29.99,
          quantity_in_stock: 100
        }
      }
    ];

    for (const testCase of emptyStringCases) {
      mockRequest.body = testCase.body;

      // Mock do serviço para sucesso
      mockCreateProductService.handle.mockResolvedValue({
        product: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: testCase.body.name,
          description: testCase.body.description,
          price: 29.99,
          quantity_in_stock: 100,
          batch: 'BATCH1',
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Act - não deve lançar erro pois Zod permite strings vazias
      await expect(
        createProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).resolves.not.toThrow();

      // Assert - serviço deve ser chamado mesmo com strings vazias
      expect(mockCreateProductService.handle).toHaveBeenCalledWith({
        name: testCase.body.name,
        description: testCase.body.description,
        price: 29.99,
        quantity_in_stock: 100,
        batch: expect.any(String)
      });

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle both name and description as empty strings', async () => {
    // Arrange
    mockRequest.body = {
      name: '', // Nome vazio
      description: '', // Descrição vazia
      price: 29.99,
      quantity_in_stock: 100
    };

    // Mock do serviço para sucesso
    mockCreateProductService.handle.mockResolvedValue({
      product: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '',
        description: '',
        price: 29.99,
        quantity_in_stock: 100,
        batch: 'BATCH1',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Act - não deve lançar erro pois Zod permite strings vazias
    await expect(
      createProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).resolves.not.toThrow();

    // Assert - serviço deve ser chamado mesmo com ambas as strings vazias
    expect(mockCreateProductService.handle).toHaveBeenCalledWith({
      name: '',
      description: '',
      price: 29.99,
      quantity_in_stock: 100,
      batch: expect.any(String)
    });
  });
});