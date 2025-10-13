// tests/unit/services/purchase/find-purchase-by-id.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindPurchaseByIdService } from "../../../src/services/purchase/find-purchase-by-id";
import type { PurchaseRepository } from "../../../src/repositories/purchase-repository";
import { ResourceNotFoundError } from "../../../src/services/errors/resource-not-found-error";
import type { Purchase } from "@prisma/client";

describe("FindPurchaseByIdService", () => {
  let findPurchaseByIdService: FindPurchaseByIdService;
  let mockPurchaseRepository: PurchaseRepository;

  beforeEach(() => {
    mockPurchaseRepository = {
      findById: vi.fn(),
      findMany: vi.fn(),
      findManyByUserId: vi.fn(),
      findManyBySupplierId: vi.fn(),
      create: vi.fn(),
      updateSubTotal: vi.fn(),
      // Adicione outros métodos se necessário
    };

    findPurchaseByIdService = new FindPurchaseByIdService(mockPurchaseRepository);
    vi.clearAllMocks();
  });

  describe("execute", () => {
    const mockRequest = {
      purchaseId: "purchase-123",
    };

    const mockPurchase: Purchase = {
      id: "purchase-123",
      nf_number: "NF-123456",
      supplier_id: "supplier-123",
      user_id: "user-123",
      sub_total: 333.75,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01'),
    };

    it("should return purchase when found by ID", async () => {
      // Arrange
      vi.mocked(mockPurchaseRepository.findById).mockResolvedValue(mockPurchase);

      // Act
      const result = await findPurchaseByIdService.execute(mockRequest);

      // Assert
      expect(mockPurchaseRepository.findById).toHaveBeenCalledWith(mockRequest.purchaseId);
      expect(mockPurchaseRepository.findById).toHaveBeenCalledOnce();
      expect(result.purchase).toEqual(mockPurchase);
    });

    it("should throw ResourceNotFoundError when purchase not found", async () => {
      // Arrange
      vi.mocked(mockPurchaseRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(findPurchaseByIdService.execute(mockRequest))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockPurchaseRepository.findById).toHaveBeenCalledWith(mockRequest.purchaseId);
    });

    it("should propagate errors from purchase repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockPurchaseRepository.findById).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(findPurchaseByIdService.execute(mockRequest))
        .rejects
        .toThrow("Database connection error");
      
      expect(mockPurchaseRepository.findById).toHaveBeenCalledWith(mockRequest.purchaseId);
    });

    it("should search for purchase with correct ID", async () => {
      // Arrange
      vi.mocked(mockPurchaseRepository.findById).mockResolvedValue(mockPurchase);
      const differentIdRequest = {
        purchaseId: "different-purchase-id",
      };

      // Act
      await findPurchaseByIdService.execute(differentIdRequest);

      // Assert
      expect(mockPurchaseRepository.findById).toHaveBeenCalledWith("different-purchase-id");
      expect(mockPurchaseRepository.findById).not.toHaveBeenCalledWith(mockRequest.purchaseId);
    });

    it("should return purchase with correct properties", async () => {
      // Arrange
      vi.mocked(mockPurchaseRepository.findById).mockResolvedValue(mockPurchase);

      // Act
      const result = await findPurchaseByIdService.execute(mockRequest);

      // Assert
      expect(result.purchase).toHaveProperty('id', 'purchase-123');
      expect(result.purchase).toHaveProperty('nf_number', 'NF-123456');
      expect(result.purchase).toHaveProperty('supplier_id', 'supplier-123');
      expect(result.purchase).toHaveProperty('user_id', 'user-123');
      expect(result.purchase).toHaveProperty('sub_total', 333.75);
      expect(result.purchase).toHaveProperty('created_at');
      expect(result.purchase).toHaveProperty('updated_at');
    });

    it("should handle different purchase IDs correctly", async () => {
      // Arrange
      const purchase1: Purchase = {
        id: "purchase-1",
        nf_number: "NF-001",
        supplier_id: "supplier-1",
        user_id: "user-1",
        sub_total: 100.00,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const purchase2: Purchase = {
        id: "purchase-2",
        nf_number: "NF-002",
        supplier_id: "supplier-2",
        user_id: "user-2",
        sub_total: 200.00,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock para diferentes chamadas
      vi.mocked(mockPurchaseRepository.findById)
        .mockResolvedValueOnce(purchase1)
        .mockResolvedValueOnce(purchase2);

      // Act
      const result1 = await findPurchaseByIdService.execute({ purchaseId: "purchase-1" });
      const result2 = await findPurchaseByIdService.execute({ purchaseId: "purchase-2" });

      // Assert
      expect(mockPurchaseRepository.findById).toHaveBeenNthCalledWith(1, "purchase-1");
      expect(mockPurchaseRepository.findById).toHaveBeenNthCalledWith(2, "purchase-2");
      expect(result1.purchase).toEqual(purchase1);
      expect(result2.purchase).toEqual(purchase2);
    });

    it("should throw ResourceNotFoundError for empty ID", async () => {
      // Arrange
      vi.mocked(mockPurchaseRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(findPurchaseByIdService.execute({ purchaseId: "" }))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockPurchaseRepository.findById).toHaveBeenCalledWith("");
    });

    it("should throw ResourceNotFoundError for non-existent ID", async () => {
      // Arrange
      vi.mocked(mockPurchaseRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(findPurchaseByIdService.execute({ purchaseId: "non-existent-id" }))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockPurchaseRepository.findById).toHaveBeenCalledWith("non-existent-id");
    });

    it("should handle purchase with zero subtotal", async () => {
      // Arrange
      const purchaseWithZeroSubtotal: Purchase = {
        ...mockPurchase,
        sub_total: 0,
      };

      vi.mocked(mockPurchaseRepository.findById).mockResolvedValue(purchaseWithZeroSubtotal);

      // Act
      const result = await findPurchaseByIdService.execute(mockRequest);

      // Assert
      expect(result.purchase.sub_total).toBe(0);
    });

    it("should handle purchase with decimal subtotal", async () => {
      // Arrange
      const purchaseWithDecimalSubtotal: Purchase = {
        ...mockPurchase,
        sub_total: 123.45,
      };

      vi.mocked(mockPurchaseRepository.findById).mockResolvedValue(purchaseWithDecimalSubtotal);

      // Act
      const result = await findPurchaseByIdService.execute(mockRequest);

      // Assert
      expect(result.purchase.sub_total).toBe(123.45);
    });

    it("should handle purchase with different nf_number formats", async () => {
      // Arrange
      const purchaseWithDifferentNF: Purchase = {
        ...mockPurchase,
        nf_number: "NF/2023/0001",
      };

      vi.mocked(mockPurchaseRepository.findById).mockResolvedValue(purchaseWithDifferentNF);

      // Act
      const result = await findPurchaseByIdService.execute(mockRequest);

      // Assert
      expect(result.purchase.nf_number).toBe("NF/2023/0001");
    });

    it("should handle purchase from different supplier", async () => {
      // Arrange
      const purchaseFromDifferentSupplier: Purchase = {
        ...mockPurchase,
        supplier_id: "supplier-456",
      };

      vi.mocked(mockPurchaseRepository.findById).mockResolvedValue(purchaseFromDifferentSupplier);

      // Act
      const result = await findPurchaseByIdService.execute(mockRequest);

      // Assert
      expect(result.purchase.supplier_id).toBe("supplier-456");
    });

    it("should handle purchase from different user", async () => {
      // Arrange
      const purchaseFromDifferentUser: Purchase = {
        ...mockPurchase,
        user_id: "user-456",
      };

      vi.mocked(mockPurchaseRepository.findById).mockResolvedValue(purchaseFromDifferentUser);

      // Act
      const result = await findPurchaseByIdService.execute(mockRequest);

      // Assert
      expect(result.purchase.user_id).toBe("user-456");
    });

    it("should handle purchase with old date", async () => {
      // Arrange
      const purchaseWithOldDate: Purchase = {
        ...mockPurchase,
        created_at: new Date('2020-01-01'),
        updated_at: new Date('2020-01-01'),
      };

      vi.mocked(mockPurchaseRepository.findById).mockResolvedValue(purchaseWithOldDate);

      // Act
      const result = await findPurchaseByIdService.execute(mockRequest);

      // Assert
      expect(result.purchase.created_at).toEqual(new Date('2020-01-01'));
      expect(result.purchase.updated_at).toEqual(new Date('2020-01-01'));
    });

    it("should handle purchase with recent date", async () => {
      // Arrange
      const recentDate = new Date();
      const purchaseWithRecentDate: Purchase = {
        ...mockPurchase,
        created_at: recentDate,
        updated_at: recentDate,
      };

      vi.mocked(mockPurchaseRepository.findById).mockResolvedValue(purchaseWithRecentDate);

      // Act
      const result = await findPurchaseByIdService.execute(mockRequest);

      // Assert
      expect(result.purchase.created_at).toEqual(recentDate);
      expect(result.purchase.updated_at).toEqual(recentDate);
    });

    it("should return consistent results for same purchase ID", async () => {
      // Arrange
      vi.mocked(mockPurchaseRepository.findById).mockResolvedValue(mockPurchase);

      // Act
      const result1 = await findPurchaseByIdService.execute(mockRequest);
      const result2 = await findPurchaseByIdService.execute(mockRequest);

      // Assert
      expect(result1.purchase).toEqual(result2.purchase);
      expect(mockPurchaseRepository.findById).toHaveBeenCalledTimes(2);
      expect(mockPurchaseRepository.findById).toHaveBeenNthCalledWith(1, mockRequest.purchaseId);
      expect(mockPurchaseRepository.findById).toHaveBeenNthCalledWith(2, mockRequest.purchaseId);
    });
  });
});