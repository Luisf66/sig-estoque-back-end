// tests/unit/controllers/product/fetch-all.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { fetchAllProduct } from '../../../../src/http/controllers/product/fetch-all';
import { makeFetchAllProductService } from '../../../../src/services/factories/product/make-fetch-all-product-service';

// Mock das dependências
vi.mock('../../../../src/services/factories/product/make-fetch-all-product-service');

const mockMakeFetchAllProductService = vi.mocked(makeFetchAllProductService);

describe('fetchAllProduct Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockFetchAllProductService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockRequest = {
      // Request vazio pois não há parâmetros, query ou body
    };

    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockFetchAllProductService = {
      execute: vi.fn()
    };

    mockMakeFetchAllProductService.mockReturnValue(mockFetchAllProductService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return all products successfully', async () => {
    // Arrange
    const mockProducts = [
      {
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: 29.99,
        quantity_in_stock: 100,
        batch: 'BATCH1',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '2',
        name: 'Product 2',
        description: 'Description 2',
        price: 39.99,
        quantity_in_stock: 50,
        batch: 'BATCH2',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    mockFetchAllProductService.execute.mockResolvedValue({
      product: mockProducts
    });

    // Act
    await fetchAllProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockMakeFetchAllProductService).toHaveBeenCalledOnce();
    expect(mockFetchAllProductService.execute).toHaveBeenCalledOnce();
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      product: mockProducts
    });
  });

  it('should return empty array when no products exist', async () => {
    // Arrange
    mockFetchAllProductService.execute.mockResolvedValue({
      product: []
    });

    // Act
    await fetchAllProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      product: []
    });
  });

  it('should handle service errors', async () => {
    // Arrange
    const serviceError = new Error('Database connection failed');
    mockFetchAllProductService.execute.mockRejectedValue(serviceError);

    // Act & Assert
    await expect(
      fetchAllProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow('Database connection failed');
  });

  it('should handle large number of products', async () => {
    // Arrange
    const largeProductList = Array.from({ length: 1000 }, (_, index) => ({
      id: `${index + 1}`,
      name: `Product ${index + 1}`,
      description: `Description ${index + 1}`,
      price: 10 + index,
      quantity_in_stock: 50 + index,
      batch: `BATCH${index + 1}`,
      created_at: new Date(),
      updated_at: new Date()
    }));

    mockFetchAllProductService.execute.mockResolvedValue({
      product: largeProductList
    });

    // Act
    await fetchAllProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      product: largeProductList
    });
    expect(largeProductList).toHaveLength(1000);
  });
});

// Testes adicionais para casos específicos
describe('fetchAllProduct Controller - Edge Cases', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockFetchAllProductService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockRequest = {};
    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };
    mockFetchAllProductService = {
      execute: vi.fn()
    };
    mockMakeFetchAllProductService.mockReturnValue(mockFetchAllProductService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle products with special characters in names and descriptions', async () => {
    // Arrange
    const productsWithSpecialChars = [
      {
        id: '1',
        name: 'Produto Café & Chá',
        description: 'Descrição com caracteres especiais: áéíóú ñ ç',
        price: 49.99,
        quantity_in_stock: 25,
        batch: 'SPEC1',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '2',
        name: 'Produit Français Élégant',
        description: 'Description avec caractères français: àâä éèêë îï ôö ùûü',
        price: 59.99,
        quantity_in_stock: 30,
        batch: 'SPEC2',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    mockFetchAllProductService.execute.mockResolvedValue({
      product: productsWithSpecialChars
    });

    // Act
    await fetchAllProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      product: productsWithSpecialChars
    });
  });

  it('should handle products with different price formats', async () => {
    // Arrange
    const productsWithVariousPrices = [
      {
        id: '1',
        name: 'Low Price Product',
        description: 'Product with low price',
        price: 0.99,
        quantity_in_stock: 1000,
        batch: 'LOW1',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '2',
        name: 'High Price Product',
        description: 'Product with high price',
        price: 9999.99,
        quantity_in_stock: 5,
        batch: 'HIGH1',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '3',
        name: 'Free Product',
        description: 'Product with zero price',
        price: 0,
        quantity_in_stock: 500,
        batch: 'FREE1',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    mockFetchAllProductService.execute.mockResolvedValue({
      product: productsWithVariousPrices
    });

    // Act
    await fetchAllProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      product: productsWithVariousPrices
    });
  });

  it('should handle service returning null or undefined products', async () => {
    // Arrange
    mockFetchAllProductService.execute.mockResolvedValue({
      product: null
    });

    // Act
    await fetchAllProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      product: null
    });
  });

  it('should handle various error types from service', async () => {
    // Arrange
    const errorTypes = [
      new Error('Generic error'),
      new TypeError('Type error'),
      new RangeError('Range error'),
      { customError: 'Custom error object' },
      'String error'
    ];

    for (const error of errorTypes) {
      mockFetchAllProductService.execute.mockRejectedValue(error);

      // Act & Assert - deve rejeitar com o erro original
      await expect(
        fetchAllProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toBe(error);

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle products with minimal data', async () => {
    // Arrange
    const minimalProducts = [
      {
        id: '1',
        name: 'P',
        description: 'D',
        price: 1,
        quantity_in_stock: 1,
        batch: 'B',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    mockFetchAllProductService.execute.mockResolvedValue({
      product: minimalProducts
    });

    // Act
    await fetchAllProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      product: minimalProducts
    });
  });

  it('should handle single product in array', async () => {
    // Arrange
    const singleProduct = [
      {
        id: '1',
        name: 'Solo Product',
        description: 'Single product description',
        price: 19.99,
        quantity_in_stock: 10,
        batch: 'SOLO1',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    mockFetchAllProductService.execute.mockResolvedValue({
      product: singleProduct
    });

    // Act
    await fetchAllProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      product: singleProduct
    });
    expect(singleProduct).toHaveLength(1);
  });

  it('should preserve product data structure', async () => {
    // Arrange
    const productsWithCompleteData = [
      {
        id: '1',
        name: 'Complete Product',
        description: 'Product with all fields',
        price: 49.99,
        quantity_in_stock: 25,
        batch: 'COMP1',
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-02'),
        // Outros campos que podem existir
        category: 'Electronics',
        is_active: true,
        supplier: 'Supplier A'
      }
    ];

    mockFetchAllProductService.execute.mockResolvedValue({
      product: productsWithCompleteData
    });

    // Act
    await fetchAllProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      product: productsWithCompleteData
    });
    // Verifica se a estrutura de dados é preservada
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        product: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            description: expect.any(String),
            price: expect.any(Number),
            quantity_in_stock: expect.any(Number),
            batch: expect.any(String),
            created_at: expect.any(Date),
            updated_at: expect.any(Date)
          })
        ])
      })
    );
  });

  it('should handle products with different batch formats', async () => {
    // Arrange
    const productsWithVariousBatches = [
      {
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: 29.99,
        quantity_in_stock: 100,
        batch: 'ABC123',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '2',
        name: 'Product 2',
        description: 'Description 2',
        price: 39.99,
        quantity_in_stock: 50,
        batch: 'XYZ789',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '3',
        name: 'Product 3',
        description: 'Description 3',
        price: 49.99,
        quantity_in_stock: 75,
        batch: 'BATCH01',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    mockFetchAllProductService.execute.mockResolvedValue({
      product: productsWithVariousBatches
    });

    // Act
    await fetchAllProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      product: productsWithVariousBatches
    });
  });

  it('should handle products with extreme quantity values', async () => {
    // Arrange
    const productsWithExtremeQuantities = [
      {
        id: '1',
        name: 'Out of Stock',
        description: 'Product with zero quantity',
        price: 19.99,
        quantity_in_stock: 0,
        batch: 'ZERO1',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '2',
        name: 'High Stock',
        description: 'Product with very high quantity',
        price: 9.99,
        quantity_in_stock: 1000000,
        batch: 'HIGHQ1',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    mockFetchAllProductService.execute.mockResolvedValue({
      product: productsWithExtremeQuantities
    });

    // Act
    await fetchAllProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      product: productsWithExtremeQuantities
    });
  });
});