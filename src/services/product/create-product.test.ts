// tests/unit/services/product/create-product.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateProductService } from "../../../src/services/product/create-product";
import type { ProductRepository } from "../../../src/repositories/product-repository";
import type { Product } from "@prisma/client";

describe("CreateProductService", () => {
  let createProductService: CreateProductService;
  let mockProductRepository: ProductRepository;

  beforeEach(() => {
    mockProductRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      // Adicione outros métodos se necessário
    };

    createProductService = new CreateProductService(mockProductRepository);
    vi.clearAllMocks();
  });

  describe("handle", () => {
    const mockRequest = {
      name: "Notebook Dell",
      description: "Notebook Dell Inspiron 15",
      price: 2500.99,
      quantity_in_stock: 50,
      batch: "BATCH-001"
    };

    const mockProduct: Product = {
      id: "product-123",
      name: "Notebook Dell",
      description: "Notebook Dell Inspiron 15",
      price: 2500.99,
      quantity_in_stock: 50,
      batch: "BATCH-001",
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it("should create a product successfully", async () => {
      // Arrange
      vi.mocked(mockProductRepository.create).mockResolvedValue(mockProduct);

      // Act
      const result = await createProductService.handle(mockRequest);

      // Assert
      expect(mockProductRepository.create).toHaveBeenCalledWith({
        name: mockRequest.name,
        description: mockRequest.description,
        price: mockRequest.price,
        quantity_in_stock: mockRequest.quantity_in_stock,
        batch: mockRequest.batch
      });
      expect(mockProductRepository.create).toHaveBeenCalledOnce();
      expect(result.product).toEqual(mockProduct);
    });

    it("should create product with correct properties", async () => {
      // Arrange
      vi.mocked(mockProductRepository.create).mockResolvedValue(mockProduct);

      // Act
      const result = await createProductService.handle(mockRequest);

      // Assert
      expect(result.product).toHaveProperty('id', 'product-123');
      expect(result.product).toHaveProperty('name', 'Notebook Dell');
      expect(result.product).toHaveProperty('description', 'Notebook Dell Inspiron 15');
      expect(result.product).toHaveProperty('price', 2500.99);
      expect(result.product).toHaveProperty('quantity_in_stock', 50);
      expect(result.product).toHaveProperty('batch', 'BATCH-001');
      expect(result.product).toHaveProperty('active', true);
    });

    it("should propagate errors from product repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockProductRepository.create).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(createProductService.handle(mockRequest))
        .rejects
        .toThrow("Database connection error");
      
      expect(mockProductRepository.create).toHaveBeenCalledWith({
        name: mockRequest.name,
        description: mockRequest.description,
        price: mockRequest.price,
        quantity_in_stock: mockRequest.quantity_in_stock,
        batch: mockRequest.batch
      });
    });

    it("should handle product with zero price", async () => {
      // Arrange
      const requestWithZeroPrice = {
        ...mockRequest,
        price: 0,
      };

      const productWithZeroPrice: Product = {
        ...mockProduct,
        price: 0,
      };

      vi.mocked(mockProductRepository.create).mockResolvedValue(productWithZeroPrice);

      // Act
      const result = await createProductService.handle(requestWithZeroPrice);

      // Assert
      expect(mockProductRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 0,
        })
      );
      expect(result.product.price).toBe(0);
    });

    it("should handle product with zero quantity in stock", async () => {
      // Arrange
      const requestWithZeroQuantity = {
        ...mockRequest,
        quantity_in_stock: 0,
      };

      const productWithZeroQuantity: Product = {
        ...mockProduct,
        quantity_in_stock: 0,
      };

      vi.mocked(mockProductRepository.create).mockResolvedValue(productWithZeroQuantity);

      // Act
      const result = await createProductService.handle(requestWithZeroQuantity);

      // Assert
      expect(mockProductRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity_in_stock: 0,
        })
      );
      expect(result.product.quantity_in_stock).toBe(0);
    });

    it("should handle product with empty batch", async () => {
      // Arrange
      const requestWithEmptyBatch = {
        ...mockRequest,
        batch: "",
      };

      const productWithEmptyBatch: Product = {
        ...mockProduct,
        batch: "",
      };

      vi.mocked(mockProductRepository.create).mockResolvedValue(productWithEmptyBatch);

      // Act
      const result = await createProductService.handle(requestWithEmptyBatch);

      // Assert
      expect(mockProductRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          batch: "",
        })
      );
      expect(result.product.batch).toBe("");
    });

    it("should handle product with long description", async () => {
      // Arrange
      const longDescription = "This is a very long product description that contains detailed information about the product features, specifications, and benefits for the end user.";
      const requestWithLongDescription = {
        ...mockRequest,
        description: longDescription,
      };

      const productWithLongDescription: Product = {
        ...mockProduct,
        description: longDescription,
      };

      vi.mocked(mockProductRepository.create).mockResolvedValue(productWithLongDescription);

      // Act
      const result = await createProductService.handle(requestWithLongDescription);

      // Assert
      expect(mockProductRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: longDescription,
        })
      );
      expect(result.product.description).toBe(longDescription);
    });

    it("should handle product with special characters in name", async () => {
      // Arrange
      const requestWithSpecialChars = {
        ...mockRequest,
        name: "Produto Especial ©®™",
        batch: "BATCH-2024@#$",
      };

      const productWithSpecialChars: Product = {
        ...mockProduct,
        name: "Produto Especial ©®™",
        batch: "BATCH-2024@#$",
      };

      vi.mocked(mockProductRepository.create).mockResolvedValue(productWithSpecialChars);

      // Act
      const result = await createProductService.handle(requestWithSpecialChars);

      // Assert
      expect(mockProductRepository.create).toHaveBeenCalledWith({
        name: "Produto Especial ©®™",
        description: mockRequest.description,
        price: mockRequest.price,
        quantity_in_stock: mockRequest.quantity_in_stock,
        batch: "BATCH-2024@#$"
      });
      expect(result.product.name).toBe("Produto Especial ©®™");
      expect(result.product.batch).toBe("BATCH-2024@#$");
    });

    it("should handle product with decimal price", async () => {
      // Arrange
      const requestWithDecimalPrice = {
        ...mockRequest,
        price: 123.45,
      };

      const productWithDecimalPrice: Product = {
        ...mockProduct,
        price: 123.45,
      };

      vi.mocked(mockProductRepository.create).mockResolvedValue(productWithDecimalPrice);

      // Act
      const result = await createProductService.handle(requestWithDecimalPrice);

      // Assert
      expect(mockProductRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 123.45,
        })
      );
      expect(result.product.price).toBe(123.45);
    });
  });
});