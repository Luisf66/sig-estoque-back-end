// tests/unit/services/product/reduce-product-stock.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReduceProductStockService } from "../../../src/services/product/reduce-product-stock";
import type { ProductRepository } from "../../../src/repositories/product-repository";
import { ResourceNotFoundError } from "../../../src/services/errors/resource-not-found-error";
import type { Product } from "@prisma/client";

describe("ReduceProductStockService", () => {
  let reduceProductStockService: ReduceProductStockService;
  let mockProductRepository: ProductRepository;

  beforeEach(() => {
    mockProductRepository = {
      findById: vi.fn(),
      reduceStock: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      inactivate: vi.fn(),
      patch: vi.fn(),
      // Adicione outros métodos se necessário
    };

    reduceProductStockService = new ReduceProductStockService(mockProductRepository);
    vi.clearAllMocks();
  });

  describe("execute", () => {
    const mockRequest = {
      productId: "product-123",
      quantity: 5,
    };

    const mockProductWithStock: Product = {
      id: "product-123",
      name: "Notebook Dell",
      description: "Notebook Dell Inspiron 15",
      price: 2500.99,
      quantity_in_stock: 50,
      batch: "BATCH-001",
      active: true,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01'),
    };

    const mockProductWithLowStock: Product = {
      ...mockProductWithStock,
      quantity_in_stock: 3,
    };

    const mockProductWithNullStock: Product = {
      ...mockProductWithStock,
      quantity_in_stock: null,
    };

    it("should reduce product stock successfully", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProductWithStock);
      vi.mocked(mockProductRepository.reduceStock).mockResolvedValue();

      // Act
      await reduceProductStockService.execute(mockRequest);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.productId);
      expect(mockProductRepository.reduceStock).toHaveBeenCalledWith(
        mockRequest.productId,
        mockRequest.quantity
      );
    });

    it("should throw ResourceNotFoundError when product not found", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(reduceProductStockService.execute(mockRequest))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.productId);
      expect(mockProductRepository.reduceStock).not.toHaveBeenCalled();
    });

    it("should throw error when product stock is null", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProductWithNullStock);

      // Act & Assert
      await expect(reduceProductStockService.execute(mockRequest))
        .rejects
        .toThrow("Product stock information is missing");

      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.productId);
      expect(mockProductRepository.reduceStock).not.toHaveBeenCalled();
    });

    it("should throw error when insufficient stock", async () => {
      // Arrange
      const insufficientStockRequest = {
        productId: "product-123",
        quantity: 5,
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProductWithLowStock);

      // Act & Assert
      await expect(reduceProductStockService.execute(insufficientStockRequest))
        .rejects
        .toThrow("Insufficient stock");

      expect(mockProductRepository.findById).toHaveBeenCalledWith(insufficientStockRequest.productId);
      expect(mockProductRepository.reduceStock).not.toHaveBeenCalled();
    });

    it("should allow reducing exact stock quantity", async () => {
      // Arrange
      const exactStockRequest = {
        productId: "product-123",
        quantity: 50, // Exact same as current stock
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProductWithStock);
      vi.mocked(mockProductRepository.reduceStock).mockResolvedValue();

      // Act
      await reduceProductStockService.execute(exactStockRequest);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith(exactStockRequest.productId);
      expect(mockProductRepository.reduceStock).toHaveBeenCalledWith(
        exactStockRequest.productId,
        exactStockRequest.quantity
      );
    });

    it("should propagate errors from product repository during find", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockProductRepository.findById).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(reduceProductStockService.execute(mockRequest))
        .rejects
        .toThrow("Database connection error");

      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.productId);
      expect(mockProductRepository.reduceStock).not.toHaveBeenCalled();
    });

    it("should propagate errors from product repository during stock reduction", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProductWithStock);
      
      const repositoryError = new Error("Stock reduction failed");
      vi.mocked(mockProductRepository.reduceStock).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(reduceProductStockService.execute(mockRequest))
        .rejects
        .toThrow("Stock reduction failed");

      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.productId);
      expect(mockProductRepository.reduceStock).toHaveBeenCalledWith(
        mockRequest.productId,
        mockRequest.quantity
      );
    });

    it("should reduce stock with correct product ID and quantity", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProductWithStock);
      vi.mocked(mockProductRepository.reduceStock).mockResolvedValue();
      
      const differentRequest = {
        productId: "different-product",
        quantity: 10,
      };

      // Act
      await reduceProductStockService.execute(differentRequest);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith("different-product");
      expect(mockProductRepository.reduceStock).toHaveBeenCalledWith("different-product", 10);
      expect(mockProductRepository.findById).not.toHaveBeenCalledWith(mockRequest.productId);
      expect(mockProductRepository.reduceStock).not.toHaveBeenCalledWith(mockRequest.productId, mockRequest.quantity);
    });

    it("should handle reducing zero quantity", async () => {
      // Arrange
      const zeroQuantityRequest = {
        productId: "product-123",
        quantity: 0,
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProductWithStock);
      vi.mocked(mockProductRepository.reduceStock).mockResolvedValue();

      // Act
      await reduceProductStockService.execute(zeroQuantityRequest);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith(zeroQuantityRequest.productId);
      expect(mockProductRepository.reduceStock).toHaveBeenCalledWith(
        zeroQuantityRequest.productId,
        0
      );
    });

    it("should handle product with zero stock when reducing zero quantity", async () => {
      // Arrange
      const productWithZeroStock: Product = {
        ...mockProductWithStock,
        quantity_in_stock: 0,
      };

      const zeroQuantityRequest = {
        productId: "product-123",
        quantity: 0,
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(productWithZeroStock);
      vi.mocked(mockProductRepository.reduceStock).mockResolvedValue();

      // Act
      await reduceProductStockService.execute(zeroQuantityRequest);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith(zeroQuantityRequest.productId);
      expect(mockProductRepository.reduceStock).toHaveBeenCalledWith(
        zeroQuantityRequest.productId,
        0
      );
    });

    it("should throw error when reducing from zero stock with positive quantity", async () => {
      // Arrange
      const productWithZeroStock: Product = {
        ...mockProductWithStock,
        quantity_in_stock: 0,
      };

      const positiveQuantityRequest = {
        productId: "product-123",
        quantity: 1,
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(productWithZeroStock);

      // Act & Assert
      await expect(reduceProductStockService.execute(positiveQuantityRequest))
        .rejects
        .toThrow("Insufficient stock");

      expect(mockProductRepository.findById).toHaveBeenCalledWith(positiveQuantityRequest.productId);
      expect(mockProductRepository.reduceStock).not.toHaveBeenCalled();
    });

    it("should handle product with decimal stock quantity", async () => {
      // Arrange
      const productWithDecimalStock: Product = {
        ...mockProductWithStock,
        quantity_in_stock: 10.5,
      };

      const decimalRequest = {
        productId: "product-123",
        quantity: 2.5,
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(productWithDecimalStock);
      vi.mocked(mockProductRepository.reduceStock).mockResolvedValue();

      // Act
      await reduceProductStockService.execute(decimalRequest);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith(decimalRequest.productId);
      expect(mockProductRepository.reduceStock).toHaveBeenCalledWith(
        decimalRequest.productId,
        2.5
      );
    });

    it("should throw error for insufficient decimal stock", async () => {
      // Arrange
      const productWithDecimalStock: Product = {
        ...mockProductWithStock,
        quantity_in_stock: 2.5,
      };

      const largeDecimalRequest = {
        productId: "product-123",
        quantity: 3.0,
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(productWithDecimalStock);

      // Act & Assert
      await expect(reduceProductStockService.execute(largeDecimalRequest))
        .rejects
        .toThrow("Insufficient stock");

      expect(mockProductRepository.findById).toHaveBeenCalledWith(largeDecimalRequest.productId);
      expect(mockProductRepository.reduceStock).not.toHaveBeenCalled();
    });

    it("should complete successfully without returning any value", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProductWithStock);
      vi.mocked(mockProductRepository.reduceStock).mockResolvedValue();

      // Act & Assert
      // Não deve lançar erro e deve completar a Promise
      await expect(reduceProductStockService.execute(mockRequest)).resolves.toBeUndefined();
    });

    it("should validate stock before attempting reduction", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProductWithLowStock);

      // Act & Assert
      await expect(reduceProductStockService.execute(mockRequest))
        .rejects
        .toThrow("Insufficient stock");

      // Garante que reduceStock não foi chamado após validação falhar
      expect(mockProductRepository.reduceStock).not.toHaveBeenCalled();
    });
  });
});