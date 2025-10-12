// tests/unit/controllers/purchase/create.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { createPurchase } from '../../../../src/http/controllers/purchase/create';
import { makeCreatePurchaseService } from '../../../../src/services/factories/purchase/make-create-purchase-service';

// Mock das dependências
vi.mock('../../../../src/services/factories/purchase/make-create-purchase-service');

const mockMakeCreatePurchaseService = vi.mocked(makeCreatePurchaseService);

describe('createPurchase Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockCreatePurchaseService: {
    handle: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockRequest = {
      body: {
        nf_number: 'NF123456789',
        supplierId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        items: [
          {
            productId: '123e4567-e89b-12d3-a456-426614174002',
            quantity: 10,
            value: 29.99
          },
          {
            productId: '123e4567-e89b-12d3-a456-426614174003',
            quantity: 5,
            value: 49.99
          }
        ]
      }
    };

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockCreatePurchaseService = {
      handle: vi.fn()
    };

    mockMakeCreatePurchaseService.mockReturnValue(mockCreatePurchaseService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a purchase successfully', async () => {
    // Arrange
    mockCreatePurchaseService.handle.mockResolvedValue(undefined);

    // Act
    await createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockMakeCreatePurchaseService).toHaveBeenCalledOnce();
    expect(mockCreatePurchaseService.handle).toHaveBeenCalledWith({
      nf_number: 'NF123456789',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: [
        {
          productId: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 10,
          value: 29.99
        },
        {
          productId: '123e4567-e89b-12d3-a456-426614174003',
          quantity: 5,
          value: 49.99
        }
      ]
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it('should create a purchase with single item', async () => {
    // Arrange
    mockRequest.body = {
      nf_number: 'NF987654321',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: [
        {
          productId: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 1,
          value: 99.99
        }
      ]
    };

    mockCreatePurchaseService.handle.mockResolvedValue(undefined);

    // Act
    await createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockCreatePurchaseService.handle).toHaveBeenCalledWith({
      nf_number: 'NF987654321',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: [
        {
          productId: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 1,
          value: 99.99
        }
      ]
    });
  });

  it('should throw ZodError when required fields are missing', async () => {
    // Arrange
    mockRequest.body = {
      // nf_number faltando
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: [
        {
          productId: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 10,
          value: 29.99
        }
      ]
    };

    // Act & Assert
    await expect(
      createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);

    // O serviço não deve ser chamado quando a validação falha
    expect(mockCreatePurchaseService.handle).not.toHaveBeenCalled();
  });

  it('should handle empty items array by calling service (Zod allows empty arrays)', async () => {
    // Arrange
    mockRequest.body = {
      nf_number: 'NF123456789',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: [] // Array vazio - Zod permite
    };

    mockCreatePurchaseService.handle.mockResolvedValue(undefined);

    // Act
    await createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - Como o Zod permite array vazio, o serviço é chamado
    expect(mockCreatePurchaseService.handle).toHaveBeenCalledWith({
      nf_number: 'NF123456789',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: []
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
  });

  it('should throw ZodError when items are missing required fields', async () => {
    // Arrange
    mockRequest.body = {
      nf_number: 'NF123456789',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: [
        {
          productId: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 10
          // value faltando
        }
      ]
    };

    // Act & Assert
    await expect(
      createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);

    expect(mockCreatePurchaseService.handle).not.toHaveBeenCalled();
  });

  it('should throw ZodError when item quantity is not a number', async () => {
    // Arrange
    mockRequest.body = {
      nf_number: 'NF123456789',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: [
        {
          productId: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 'invalid-quantity', // Quantidade não é número
          value: 29.99
        }
      ]
    };

    // Act & Assert
    await expect(
      createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);

    expect(mockCreatePurchaseService.handle).not.toHaveBeenCalled();
  });

  it('should throw ZodError when item value is not a number', async () => {
    // Arrange
    mockRequest.body = {
      nf_number: 'NF123456789',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: [
        {
          productId: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 10,
          value: 'invalid-value' // Valor não é número
        }
      ]
    };

    // Act & Assert
    await expect(
      createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);

    expect(mockCreatePurchaseService.handle).not.toHaveBeenCalled();
  });

  it('should handle empty request body', async () => {
    // Arrange
    mockRequest.body = undefined;

    // Act & Assert
    await expect(
      createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);

    expect(mockCreatePurchaseService.handle).not.toHaveBeenCalled();
  });

  it('should handle service errors', async () => {
    // Arrange
    const serviceError = new Error('Database connection failed');
    mockCreatePurchaseService.handle.mockRejectedValue(serviceError);

    // Act & Assert
    await expect(
      createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow('Database connection failed');
  });
});

// Testes adicionais para casos específicos
describe('createPurchase Controller - Edge Cases', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockCreatePurchaseService: {
    handle: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    // Inicializar as variáveis no beforeEach do segundo describe
    mockRequest = {
      body: {
        nf_number: 'NF123456789',
        supplierId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        items: [
          {
            productId: '123e4567-e89b-12d3-a456-426614174002',
            quantity: 10,
            value: 29.99
          }
        ]
      }
    };

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockCreatePurchaseService = {
      handle: vi.fn()
    };

    mockMakeCreatePurchaseService.mockReturnValue(mockCreatePurchaseService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle purchase with many items', async () => {
    // Arrange
    const manyItems = Array.from({ length: 100 }, (_, index) => ({
      productId: `123e4567-e89b-12d3-a456-426614174${index.toString().padStart(3, '0')}`,
      quantity: index + 1,
      value: (index + 1) * 10
    }));

    mockRequest.body = {
      nf_number: 'NF123456789',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: manyItems
    };

    mockCreatePurchaseService.handle.mockResolvedValue(undefined);

    // Act
    await createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockCreatePurchaseService.handle).toHaveBeenCalledWith({
      nf_number: 'NF123456789',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: manyItems
    });
    expect(manyItems).toHaveLength(100);
  });

  it('should handle different UUID formats', async () => {
    // Arrange
    const uuidFormats = [
      '123e4567-e89b-12d3-a456-426614174000',
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
    ];

    for (const uuid of uuidFormats) {
      mockRequest.body = {
        nf_number: 'NF123456789',
        supplierId: uuid,
        userId: uuid,
        items: [
          {
            productId: uuid,
            quantity: 10,
            value: 29.99
          }
        ]
      };

      mockCreatePurchaseService.handle.mockResolvedValue(undefined);

      // Act
      await createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert
      expect(mockCreatePurchaseService.handle).toHaveBeenCalledWith({
        nf_number: 'NF123456789',
        supplierId: uuid,
        userId: uuid,
        items: [
          {
            productId: uuid,
            quantity: 10,
            value: 29.99
          }
        ]
      });

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle various NF number formats', async () => {
    // Arrange
    const nfNumbers = [
      'NF123456789',
      'NF987654321',
      'NF000000001',
      'NF999999999',
      '12345678901234567890' // NF número muito longo
    ];

    for (const nfNumber of nfNumbers) {
      mockRequest.body = {
        nf_number: nfNumber,
        supplierId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        items: [
          {
            productId: '123e4567-e89b-12d3-a456-426614174002',
            quantity: 10,
            value: 29.99
          }
        ]
      };

      mockCreatePurchaseService.handle.mockResolvedValue(undefined);

      // Act
      await createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert
      expect(mockCreatePurchaseService.handle).toHaveBeenCalledWith({
        nf_number: nfNumber,
        supplierId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        items: [
          {
            productId: '123e4567-e89b-12d3-a456-426614174002',
            quantity: 10,
            value: 29.99
          }
        ]
      });

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle items with extreme quantity and value values', async () => {
    // Arrange
    mockRequest.body = {
      nf_number: 'NF123456789',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: [
        {
          productId: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 1, // Quantidade mínima
          value: 0.01 // Valor mínimo
        },
        {
          productId: '123e4567-e89b-12d3-a456-426614174003',
          quantity: 1000000, // Quantidade muito alta
          value: 999999.99 // Valor muito alto
        }
      ]
    };

    mockCreatePurchaseService.handle.mockResolvedValue(undefined);

    // Act
    await createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockCreatePurchaseService.handle).toHaveBeenCalledWith({
      nf_number: 'NF123456789',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: [
        {
          productId: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 1,
          value: 0.01
        },
        {
          productId: '123e4567-e89b-12d3-a456-426614174003',
          quantity: 1000000,
          value: 999999.99
        }
      ]
    });
  });

  it('should handle various error types from service', async () => {
    // Arrange
    mockRequest.body = {
      nf_number: 'NF123456789',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: [
        {
          productId: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 10,
          value: 29.99
        }
      ]
    };

    const errorTypes = [
      new Error('Generic error'),
      new TypeError('Type error'),
      new RangeError('Range error'),
      { customError: 'Custom error object' },
      'String error'
    ];

    for (const error of errorTypes) {
      mockCreatePurchaseService.handle.mockRejectedValue(error);

      // Act & Assert - deve rejeitar com o erro original
      await expect(
        createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toBe(error);

      // Reset para próximo teste
      vi.clearAllMocks();
    }
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
          nf_number: 'NF123456789',
          supplierId: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174001',
          items: [] // deve passar - Zod permite array vazio
        },
        shouldCallService: true 
      },
      { 
        body: {
          nf_number: 'NF123456789',
          supplierId: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174001',
          items: [
            {
              productId: '123e4567-e89b-12d3-a456-426614174002',
              quantity: 'invalid', // deve falhar - quantidade inválida
              value: 29.99
            }
          ]
        },
        shouldCallService: false 
      },
      { 
        body: {
          nf_number: 'NF123456789',
          supplierId: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174001',
          items: [
            {
              productId: '123e4567-e89b-12d3-a456-426614174002',
              quantity: 10,
              value: 29.99
            }
          ]
        },
        shouldCallService: true 
      }
    ];

    for (const testCase of testCases) {
      mockRequest.body = testCase.body;

      if (testCase.shouldCallService) {
        // Configura o mock para sucesso quando o serviço deve ser chamado
        mockCreatePurchaseService.handle.mockResolvedValue(undefined);

        // Act - não deve lançar erro
        await expect(
          createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply)
        ).resolves.not.toThrow();

        // Assert - serviço deve ser chamado
        expect(mockCreatePurchaseService.handle).toHaveBeenCalled();
      } else {
        // Act & Assert - deve lançar erro
        await expect(
          createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply)
        ).rejects.toThrow();

        // Assert - serviço não deve ser chamado
        expect(mockCreatePurchaseService.handle).not.toHaveBeenCalled();
      }

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle items with decimal quantity and value', async () => {
    // Arrange
    mockRequest.body = {
      nf_number: 'NF123456789',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: [
        {
          productId: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 10.5, // Quantidade decimal
          value: 29.99 // Valor decimal
        },
        {
          productId: '123e4567-e89b-12d3-a456-426614174003',
          quantity: 0.5, // Quantidade fracionada
          value: 100.50 // Valor com centavos
        }
      ]
    };

    mockCreatePurchaseService.handle.mockResolvedValue(undefined);

    // Act
    await createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockCreatePurchaseService.handle).toHaveBeenCalledWith({
      nf_number: 'NF123456789',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: [
        {
          productId: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 10.5,
          value: 29.99
        },
        {
          productId: '123e4567-e89b-12d3-a456-426614174003',
          quantity: 0.5,
          value: 100.50
        }
      ]
    });
  });

  it('should handle purchase with same product multiple times', async () => {
    // Arrange
    mockRequest.body = {
      nf_number: 'NF123456789',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: [
        {
          productId: '123e4567-e89b-12d3-a456-426614174002', // Mesmo produto
          quantity: 5,
          value: 29.99
        },
        {
          productId: '123e4567-e89b-12d3-a456-426614174002', // Mesmo produto
          quantity: 3,
          value: 29.99
        },
        {
          productId: '123e4567-e89b-12d3-a456-426614174003', // Produto diferente
          quantity: 2,
          value: 49.99
        }
      ]
    };

    mockCreatePurchaseService.handle.mockResolvedValue(undefined);

    // Act
    await createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockCreatePurchaseService.handle).toHaveBeenCalledWith({
      nf_number: 'NF123456789',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: [
        {
          productId: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 5,
          value: 29.99
        },
        {
          productId: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 3,
          value: 29.99
        },
        {
          productId: '123e4567-e89b-12d3-a456-426614174003',
          quantity: 2,
          value: 49.99
        }
      ]
    });
  });

  it('should handle empty items array with service error', async () => {
    // Arrange
    mockRequest.body = {
      nf_number: 'NF123456789',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: [] // Array vazio
    };

    const serviceError = new Error('Cannot create purchase with empty items');
    mockCreatePurchaseService.handle.mockRejectedValue(serviceError);

    // Act & Assert - deve rejeitar com o erro do serviço
    await expect(
      createPurchase(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow('Cannot create purchase with empty items');

    // Assert - serviço foi chamado mesmo com array vazio
    expect(mockCreatePurchaseService.handle).toHaveBeenCalledWith({
      nf_number: 'NF123456789',
      supplierId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      items: []
    });
  });
});