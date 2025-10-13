// tests/unit/services/product/find-product-by-id.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindProductByIdService } from "../../../src/services/product/find-product-by-id";
import type { ProductRepository } from "../../../src/repositories/product-repository";
import { ResourceNotFoundError } from "../../../src/services/errors/resource-not-found-error";
import { InactiveError } from "../../../src/services/errors/inactive-error";
import type { Product } from "@prisma/client";

// Interface extendida para incluir is_active
interface ProductWithIsActive extends Product {
  is_active: boolean;
}

describe("FindProductByIdService", () => {
  let findProductByIdService: FindProductByIdService;
  let mockProductRepository: ProductRepository;

  beforeEach(() => {
    mockProductRepository = {
      findById: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      // Adicione outros métodos se necessário
    };

    findProductByIdService = new FindProductByIdService(mockProductRepository);
    vi.clearAllMocks();
  });

  describe("execute", () => {
    const mockRequest = {
      productId: "product-123",
    };

    const mockActiveProduct: ProductWithIsActive = {
      id: "product-123",
      name: "Notebook Dell",
      description: "Notebook Dell Inspiron 15",
      price: 2500.99,
      quantity_in_stock: 50,
      batch: "BATCH-001",
      active: true,
      is_active: true, // Propriedade adicional para o serviço
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01'),
    };

    const mockInactiveProduct: ProductWithIsActive = {
      ...mockActiveProduct,
      active: false,
      is_active: false, // Propriedade adicional para o serviço
    };

    it("should return product when found and active", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct as Product);

      // Act
      const result = await findProductByIdService.execute(mockRequest);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.productId);
      expect(mockProductRepository.findById).toHaveBeenCalledOnce();
      expect(result.product).toEqual(mockActiveProduct);
    });

    it("should throw ResourceNotFoundError when product not found", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(findProductByIdService.execute(mockRequest))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.productId);
    });

    it("should throw InactiveError when product is inactive", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockInactiveProduct as Product);

      // Act & Assert
      await expect(findProductByIdService.execute(mockRequest))
        .rejects
        .toThrow(InactiveError);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.productId);
    });

    it("should propagate errors from product repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockProductRepository.findById).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(findProductByIdService.execute(mockRequest))
        .rejects
        .toThrow("Database connection error");
      
      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.productId);
    });

    it("should search for product with correct ID", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct as Product);
      const differentIdRequest = {
        productId: "different-product-id",
      };

      // Act
      await findProductByIdService.execute(differentIdRequest);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith("different-product-id");
      expect(mockProductRepository.findById).not.toHaveBeenCalledWith(mockRequest.productId);
    });

    it("should return product with correct properties", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct as Product);

      // Act
      const result = await findProductByIdService.execute(mockRequest);

      // Assert
      expect(result.product).toHaveProperty('id', 'product-123');
      expect(result.product).toHaveProperty('name', 'Notebook Dell');
      expect(result.product).toHaveProperty('description', 'Notebook Dell Inspiron 15');
      expect(result.product).toHaveProperty('price', 2500.99);
      expect(result.product).toHaveProperty('quantity_in_stock', 50);
      expect(result.product).toHaveProperty('batch', 'BATCH-001');
      expect(result.product).toHaveProperty('active', true);
      expect(result.product).toHaveProperty('is_active', true);
      expect(result.product).toHaveProperty('created_at');
      expect(result.product).toHaveProperty('updated_at');
    });

    it("should handle different product IDs correctly", async () => {
      // Arrange
      const product1: ProductWithIsActive = {
        id: "product-1",
        name: "Product 1",
        description: "Description 1",
        price: 100.00,
        quantity_in_stock: 10,
        batch: "BATCH-1",
        active: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const product2: ProductWithIsActive = {
        id: "product-2",
        name: "Product 2",
        description: "Description 2",
        price: 200.00,
        quantity_in_stock: 20,
        batch: "BATCH-2",
        active: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock para diferentes chamadas
      vi.mocked(mockProductRepository.findById)
        .mockResolvedValueOnce(product1 as Product)
        .mockResolvedValueOnce(product2 as Product);

      // Act
      const result1 = await findProductByIdService.execute({ productId: "product-1" });
      const result2 = await findProductByIdService.execute({ productId: "product-2" });

      // Assert
      expect(mockProductRepository.findById).toHaveBeenNthCalledWith(1, "product-1");
      expect(mockProductRepository.findById).toHaveBeenNthCalledWith(2, "product-2");
      expect(result1.product).toEqual(product1);
      expect(result2.product).toEqual(product2);
    });

    it("should throw ResourceNotFoundError for empty ID", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(findProductByIdService.execute({ productId: "" }))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockProductRepository.findById).toHaveBeenCalledWith("");
    });

    it("should throw ResourceNotFoundError for non-existent ID", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(findProductByIdService.execute({ productId: "non-existent-id" }))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockProductRepository.findById).toHaveBeenCalledWith("non-existent-id");
    });

    it("should throw InactiveError for inactive product with different properties", async () => {
      // Arrange
      const inactiveProduct: ProductWithIsActive = {
        id: "inactive-product",
        name: "Inactive Product",
        description: "This product is inactive",
        price: 99.99,
        quantity_in_stock: 0,
        batch: "BATCH-INACT",
        active: false,
        is_active: false,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01'),
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(inactiveProduct as Product);

      // Act & Assert
      await expect(findProductByIdService.execute({ productId: "inactive-product" }))
        .rejects
        .toThrow(InactiveError);

      expect(mockProductRepository.findById).toHaveBeenCalledWith("inactive-product");
    });

    it("should handle product with zero quantity but active", async () => {
      // Arrange
      const activeProductZeroStock: ProductWithIsActive = {
        ...mockActiveProduct,
        quantity_in_stock: 0,
        active: true,
        is_active: true,
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(activeProductZeroStock as Product);

      // Act
      const result = await findProductByIdService.execute(mockRequest);

      // Assert
      expect(result.product.quantity_in_stock).toBe(0);
      expect((result.product as ProductWithIsActive).is_active).toBe(true);
    });

    it("should handle product with decimal price", async () => {
      // Arrange
      const productWithDecimalPrice: ProductWithIsActive = {
        ...mockActiveProduct,
        price: 123.45,
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(productWithDecimalPrice as Product);

      // Act
      const result = await findProductByIdService.execute(mockRequest);

      // Assert
      expect(result.product.price).toBe(123.45);
    });

    it("should check both existence and activity status", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockInactiveProduct as Product);

      // Act & Assert
      // Primeiro verifica se existe, depois se está ativo
      await expect(findProductByIdService.execute(mockRequest))
        .rejects
        .toThrow(InactiveError); // Não ResourceNotFoundError

      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.productId);
    });
  });
});