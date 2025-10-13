// tests/unit/services/product/inactivate-product.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InactivateProductService } from "../../../src/services/product/inactivate-product";
import type { ProductRepository } from "../../../src/repositories/product-repository";
import type { Product } from "@prisma/client";

describe("InactivateProductService", () => {
  let inactivateProductService: InactivateProductService;
  let mockProductRepository: ProductRepository;

  beforeEach(() => {
    mockProductRepository = {
      findById: vi.fn(),
      inactivate: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      // Adicione outros métodos se necessário
    };

    inactivateProductService = new InactivateProductService(mockProductRepository);
    vi.clearAllMocks();
  });

  describe("execute", () => {
    const mockRequest = {
      productId: "product-123",
    };

    const mockActiveProduct: Product = {
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

    const mockInactiveProduct: Product = {
      ...mockActiveProduct,
      active: false,
    };

    it("should inactivate product successfully", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct);
      vi.mocked(mockProductRepository.inactivate).mockResolvedValue();

      // Act
      await inactivateProductService.execute(mockRequest);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.productId);
      expect(mockProductRepository.inactivate).toHaveBeenCalledWith(mockRequest.productId);
      expect(mockProductRepository.findById).toHaveBeenCalledOnce();
      expect(mockProductRepository.inactivate).toHaveBeenCalledOnce();
    });

    it("should throw error when product not found", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(inactivateProductService.execute(mockRequest))
        .rejects
        .toThrow("Product not found");

      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.productId);
      expect(mockProductRepository.inactivate).not.toHaveBeenCalled();
    });

    it("should inactivate already inactive product", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockInactiveProduct);
      vi.mocked(mockProductRepository.inactivate).mockResolvedValue();

      // Act
      await inactivateProductService.execute(mockRequest);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.productId);
      expect(mockProductRepository.inactivate).toHaveBeenCalledWith(mockRequest.productId);
    });

    it("should propagate errors from product repository during find", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockProductRepository.findById).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(inactivateProductService.execute(mockRequest))
        .rejects
        .toThrow("Database connection error");

      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.productId);
      expect(mockProductRepository.inactivate).not.toHaveBeenCalled();
    });

    it("should propagate errors from product repository during inactivation", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct);
      
      const repositoryError = new Error("Inactivation failed");
      vi.mocked(mockProductRepository.inactivate).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(inactivateProductService.execute(mockRequest))
        .rejects
        .toThrow("Inactivation failed");

      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.productId);
      expect(mockProductRepository.inactivate).toHaveBeenCalledWith(mockRequest.productId);
    });

    it("should inactivate product with correct ID", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct);
      vi.mocked(mockProductRepository.inactivate).mockResolvedValue();
      const differentIdRequest = {
        productId: "different-product-id",
      };

      // Act
      await inactivateProductService.execute(differentIdRequest);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith("different-product-id");
      expect(mockProductRepository.inactivate).toHaveBeenCalledWith("different-product-id");
      expect(mockProductRepository.findById).not.toHaveBeenCalledWith(mockRequest.productId);
      expect(mockProductRepository.inactivate).not.toHaveBeenCalledWith(mockRequest.productId);
    });

    it("should handle product with zero quantity in stock", async () => {
      // Arrange
      const productWithZeroStock: Product = {
        ...mockActiveProduct,
        quantity_in_stock: 0,
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(productWithZeroStock);
      vi.mocked(mockProductRepository.inactivate).mockResolvedValue();

      // Act
      await inactivateProductService.execute(mockRequest);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.productId);
      expect(mockProductRepository.inactivate).toHaveBeenCalledWith(mockRequest.productId);
    });

    it("should handle product with different properties", async () => {
      // Arrange
      const differentProduct: Product = {
        id: "product-456",
        name: "Mouse Logitech",
        description: "Mouse sem fio",
        price: 89.90,
        quantity_in_stock: 100,
        batch: "BATCH-002",
        active: true,
        created_at: new Date('2023-02-01'),
        updated_at: new Date('2023-02-01'),
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(differentProduct);
      vi.mocked(mockProductRepository.inactivate).mockResolvedValue();

      // Act
      await inactivateProductService.execute({ productId: "product-456" });

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith("product-456");
      expect(mockProductRepository.inactivate).toHaveBeenCalledWith("product-456");
    });

    it("should throw error for empty product ID", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(inactivateProductService.execute({ productId: "" }))
        .rejects
        .toThrow("Product not found");

      expect(mockProductRepository.findById).toHaveBeenCalledWith("");
      expect(mockProductRepository.inactivate).not.toHaveBeenCalled();
    });

    it("should throw error for non-existent product ID", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(inactivateProductService.execute({ productId: "non-existent-id" }))
        .rejects
        .toThrow("Product not found");

      expect(mockProductRepository.findById).toHaveBeenCalledWith("non-existent-id");
      expect(mockProductRepository.inactivate).not.toHaveBeenCalled();
    });

    it("should not call inactivate if product is not found", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(inactivateProductService.execute(mockRequest))
        .rejects
        .toThrow("Product not found");

      expect(mockProductRepository.findById).toHaveBeenCalled();
      expect(mockProductRepository.inactivate).not.toHaveBeenCalled();
    });

    it("should complete successfully without returning any value", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct);
      vi.mocked(mockProductRepository.inactivate).mockResolvedValue();

      // Act & Assert
      // Não deve lançar erro e deve completar a Promise
      await expect(inactivateProductService.execute(mockRequest)).resolves.toBeUndefined();
    });
  });
});