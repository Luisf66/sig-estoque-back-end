// tests/unit/services/product/patch-product.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PatchProductService } from "../../../src/services/product/patch-product";
import type { ProductRepository } from "../../../src/repositories/product-repository";
import { ResourceNotFoundError } from "../../../src/services/errors/resource-not-found-error";
import { InactiveError } from "../../../src/services/errors/inactive-error";
import type { Product } from "@prisma/client";

// Interface extendida para incluir is_active
interface ProductWithIsActive extends Product {
  is_active: boolean;
}

describe("PatchProductService", () => {
  let patchProductService: PatchProductService;
  let mockProductRepository: ProductRepository;

  beforeEach(() => {
    mockProductRepository = {
      findById: vi.fn(),
      patch: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      inactivate: vi.fn(),
      // Adicione outros métodos se necessário
    };

    patchProductService = new PatchProductService(mockProductRepository);
    vi.clearAllMocks();
  });

  describe("handle", () => {
    const mockRequest = {
      id: "product-123",
      data: {
        name: "Updated Product Name",
        price: 2999.99,
        quantity_in_stock: 25,
      },
    };

    const mockActiveProduct: ProductWithIsActive = {
      id: "product-123",
      name: "Original Product Name",
      description: "Original Product Description",
      price: 2500.99,
      quantity_in_stock: 50,
      batch: "BATCH-001",
      active: true,
      is_active: true,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01'),
    };

    const mockInactiveProduct: ProductWithIsActive = {
      ...mockActiveProduct,
      active: false,
      is_active: false,
    };

    const mockUpdatedProduct: ProductWithIsActive = {
      ...mockActiveProduct,
      name: "Updated Product Name",
      price: 2999.99,
      quantity_in_stock: 25,
      updated_at: new Date('2023-01-02'),
    };

    it("should patch product successfully with partial data", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct as Product);
      vi.mocked(mockProductRepository.patch).mockResolvedValue(mockUpdatedProduct as Product);

      // Act
      const result = await patchProductService.handle(mockRequest);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.id);
      expect(mockProductRepository.patch).toHaveBeenCalledWith(mockRequest.id, mockRequest.data);
      expect(result.product).toEqual(mockUpdatedProduct);
    });

    it("should throw ResourceNotFoundError when product not found", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(patchProductService.handle(mockRequest))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.id);
      expect(mockProductRepository.patch).not.toHaveBeenCalled();
    });

    it("should throw InactiveError when product is inactive", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockInactiveProduct as Product);

      // Act & Assert
      await expect(patchProductService.handle(mockRequest))
        .rejects
        .toThrow(InactiveError);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.id);
      expect(mockProductRepository.patch).not.toHaveBeenCalled();
    });

    it("should patch product with only name update", async () => {
      // Arrange
      const nameOnlyRequest = {
        id: "product-123",
        data: {
          name: "New Product Name",
        },
      };

      const nameUpdatedProduct: ProductWithIsActive = {
        ...mockActiveProduct,
        name: "New Product Name",
        updated_at: new Date('2023-01-02'),
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct as Product);
      vi.mocked(mockProductRepository.patch).mockResolvedValue(nameUpdatedProduct as Product);

      // Act
      const result = await patchProductService.handle(nameOnlyRequest);

      // Assert
      expect(mockProductRepository.patch).toHaveBeenCalledWith(
        nameOnlyRequest.id,
        nameOnlyRequest.data
      );
      expect(result.product?.name).toBe("New Product Name");
      expect(result.product?.price).toBe(mockActiveProduct.price); // Mantém o valor original
    });

    it("should patch product with only price update", async () => {
      // Arrange
      const priceOnlyRequest = {
        id: "product-123",
        data: {
          price: 1999.99,
        },
      };

      const priceUpdatedProduct: ProductWithIsActive = {
        ...mockActiveProduct,
        price: 1999.99,
        updated_at: new Date('2023-01-02'),
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct as Product);
      vi.mocked(mockProductRepository.patch).mockResolvedValue(priceUpdatedProduct as Product);

      // Act
      const result = await patchProductService.handle(priceOnlyRequest);

      // Assert
      expect(mockProductRepository.patch).toHaveBeenCalledWith(
        priceOnlyRequest.id,
        priceOnlyRequest.data
      );
      expect(result.product?.price).toBe(1999.99);
      expect(result.product?.name).toBe(mockActiveProduct.name); // Mantém o valor original
    });

    it("should patch product with only quantity update", async () => {
      // Arrange
      const quantityOnlyRequest = {
        id: "product-123",
        data: {
          quantity_in_stock: 75,
        },
      };

      const quantityUpdatedProduct: ProductWithIsActive = {
        ...mockActiveProduct,
        quantity_in_stock: 75,
        updated_at: new Date('2023-01-02'),
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct as Product);
      vi.mocked(mockProductRepository.patch).mockResolvedValue(quantityUpdatedProduct as Product);

      // Act
      const result = await patchProductService.handle(quantityOnlyRequest);

      // Assert
      expect(mockProductRepository.patch).toHaveBeenCalledWith(
        quantityOnlyRequest.id,
        quantityOnlyRequest.data
      );
      expect(result.product?.quantity_in_stock).toBe(75);
    });

    it("should patch product with only description update", async () => {
      // Arrange
      const descriptionOnlyRequest = {
        id: "product-123",
        data: {
          description: "Updated product description",
        },
      };

      const descriptionUpdatedProduct: ProductWithIsActive = {
        ...mockActiveProduct,
        description: "Updated product description",
        updated_at: new Date('2023-01-02'),
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct as Product);
      vi.mocked(mockProductRepository.patch).mockResolvedValue(descriptionUpdatedProduct as Product);

      // Act
      const result = await patchProductService.handle(descriptionOnlyRequest);

      // Assert
      expect(mockProductRepository.patch).toHaveBeenCalledWith(
        descriptionOnlyRequest.id,
        descriptionOnlyRequest.data
      );
      expect(result.product?.description).toBe("Updated product description");
    });

    it("should patch product with only batch update", async () => {
      // Arrange
      const batchOnlyRequest = {
        id: "product-123",
        data: {
          batch: "BATCH-UPDATED",
        },
      };

      const batchUpdatedProduct: ProductWithIsActive = {
        ...mockActiveProduct,
        batch: "BATCH-UPDATED",
        updated_at: new Date('2023-01-02'),
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct as Product);
      vi.mocked(mockProductRepository.patch).mockResolvedValue(batchUpdatedProduct as Product);

      // Act
      const result = await patchProductService.handle(batchOnlyRequest);

      // Assert
      expect(mockProductRepository.patch).toHaveBeenCalledWith(
        batchOnlyRequest.id,
        batchOnlyRequest.data
      );
      expect(result.product?.batch).toBe("BATCH-UPDATED");
    });

    it("should propagate errors from product repository during find", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockProductRepository.findById).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(patchProductService.handle(mockRequest))
        .rejects
        .toThrow("Database connection error");

      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.id);
      expect(mockProductRepository.patch).not.toHaveBeenCalled();
    });

    it("should propagate errors from product repository during patch", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct as Product);
      
      const repositoryError = new Error("Patch operation failed");
      vi.mocked(mockProductRepository.patch).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(patchProductService.handle(mockRequest))
        .rejects
        .toThrow("Patch operation failed");

      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.id);
      expect(mockProductRepository.patch).toHaveBeenCalledWith(mockRequest.id, mockRequest.data);
    });

    it("should handle empty data object", async () => {
      // Arrange
      const emptyDataRequest = {
        id: "product-123",
        data: {},
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct as Product);
      vi.mocked(mockProductRepository.patch).mockResolvedValue(mockActiveProduct as Product);

      // Act
      const result = await patchProductService.handle(emptyDataRequest);

      // Assert
      expect(mockProductRepository.patch).toHaveBeenCalledWith("product-123", {});
      expect(result.product).toEqual(mockActiveProduct);
    });

    it("should handle product with zero price update", async () => {
      // Arrange
      const zeroPriceRequest = {
        id: "product-123",
        data: {
          price: 0,
        },
      };

      const zeroPriceProduct: ProductWithIsActive = {
        ...mockActiveProduct,
        price: 0,
        updated_at: new Date('2023-01-02'),
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct as Product);
      vi.mocked(mockProductRepository.patch).mockResolvedValue(zeroPriceProduct as Product);

      // Act
      const result = await patchProductService.handle(zeroPriceRequest);

      // Assert
      expect(mockProductRepository.patch).toHaveBeenCalledWith(
        zeroPriceRequest.id,
        zeroPriceRequest.data
      );
      expect(result.product?.price).toBe(0);
    });

    it("should handle product with zero quantity update", async () => {
      // Arrange
      const zeroQuantityRequest = {
        id: "product-123",
        data: {
          quantity_in_stock: 0,
        },
      };

      const zeroQuantityProduct: ProductWithIsActive = {
        ...mockActiveProduct,
        quantity_in_stock: 0,
        updated_at: new Date('2023-01-02'),
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct as Product);
      vi.mocked(mockProductRepository.patch).mockResolvedValue(zeroQuantityProduct as Product);

      // Act
      const result = await patchProductService.handle(zeroQuantityRequest);

      // Assert
      expect(mockProductRepository.patch).toHaveBeenCalledWith(
        zeroQuantityRequest.id,
        zeroQuantityRequest.data
      );
      expect(result.product?.quantity_in_stock).toBe(0);
    });

    it("should check both existence and activity status before patching", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockInactiveProduct as Product);

      // Act & Assert
      await expect(patchProductService.handle(mockRequest))
        .rejects
        .toThrow(InactiveError); // Não ResourceNotFoundError

      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockRequest.id);
      expect(mockProductRepository.patch).not.toHaveBeenCalled();
    });

    it("should return null product when repository returns null", async () => {
      // Arrange
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockActiveProduct as Product);
      vi.mocked(mockProductRepository.patch).mockResolvedValue(null);

      // Act
      const result = await patchProductService.handle(mockRequest);

      // Assert
      expect(result.product).toBeNull();
    });
  });
});