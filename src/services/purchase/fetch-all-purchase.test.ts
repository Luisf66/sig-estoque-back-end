// tests/unit/services/purchase/fetch-all-purchase.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FetchAllPurchaseService } from "../../../src/services/purchase/fetch-all-purchase";
import type { PurchaseRepository } from "../../../src/repositories/purchase-repository";
import type { Purchase } from "@prisma/client";

describe("FetchAllPurchaseService", () => {
  let fetchAllPurchaseService: FetchAllPurchaseService;
  let mockPurchaseRepository: PurchaseRepository;

  beforeEach(() => {
    mockPurchaseRepository = {
      findMany: vi.fn(),
      findManyByUserId: vi.fn(),
      findManyBySupplierId: vi.fn(),
      create: vi.fn(),
      updateSubTotal: vi.fn(),
      findById: vi.fn(),
      // Adicione outros métodos se necessário
    };

    fetchAllPurchaseService = new FetchAllPurchaseService(mockPurchaseRepository);
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should return all purchases successfully", async () => {
      // Arrange
      const mockPurchases: Purchase[] = [
        {
          id: "purchase-1",
          nf_number: "NF-001",
          supplier_id: "supplier-123",
          user_id: "user-1",
          sub_total: 1000.50,
          created_at: new Date('2023-01-15'),
          updated_at: new Date('2023-01-15'),
        },
        {
          id: "purchase-2",
          nf_number: "NF-002",
          supplier_id: "supplier-456",
          user_id: "user-2",
          sub_total: 2500.75,
          created_at: new Date('2023-02-20'),
          updated_at: new Date('2023-02-20'),
        },
        {
          id: "purchase-3",
          nf_number: "NF-003",
          supplier_id: "supplier-789",
          user_id: "user-3",
          sub_total: 3500.25,
          created_at: new Date('2023-03-10'),
          updated_at: new Date('2023-03-10'),
        },
      ];

      vi.mocked(mockPurchaseRepository.findMany).mockResolvedValue(mockPurchases);

      // Act
      const result = await fetchAllPurchaseService.execute();

      // Assert
      expect(mockPurchaseRepository.findMany).toHaveBeenCalledOnce();
      expect(result.purchase).toEqual(mockPurchases);
      expect(result.purchase).toHaveLength(3);
    });

    it("should return empty array when no purchases exist", async () => {
      // Arrange
      const mockPurchases: Purchase[] = [];
      vi.mocked(mockPurchaseRepository.findMany).mockResolvedValue(mockPurchases);

      // Act
      const result = await fetchAllPurchaseService.execute();

      // Assert
      expect(mockPurchaseRepository.findMany).toHaveBeenCalledOnce();
      expect(result.purchase).toEqual([]);
      expect(result.purchase).toHaveLength(0);
    });

    it("should propagate errors from purchase repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockPurchaseRepository.findMany).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(fetchAllPurchaseService.execute())
        .rejects
        .toThrow("Database connection error");
      
      expect(mockPurchaseRepository.findMany).toHaveBeenCalledOnce();
    });

    it("should return purchases with correct structure", async () => {
      // Arrange
      const mockPurchases: Purchase[] = [
        {
          id: "purchase-123",
          nf_number: "NF-123456",
          supplier_id: "supplier-123",
          user_id: "user-123",
          sub_total: 333.75,
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: new Date('2023-01-01T00:00:00Z'),
        },
      ];

      vi.mocked(mockPurchaseRepository.findMany).mockResolvedValue(mockPurchases);

      // Act
      const result = await fetchAllPurchaseService.execute();

      // Assert
      expect(result.purchase[0]).toHaveProperty('id');
      expect(result.purchase[0]).toHaveProperty('nf_number');
      expect(result.purchase[0]).toHaveProperty('supplier_id');
      expect(result.purchase[0]).toHaveProperty('user_id');
      expect(result.purchase[0]).toHaveProperty('sub_total');
      expect(result.purchase[0]).toHaveProperty('created_at');
      expect(result.purchase[0]).toHaveProperty('updated_at');
      
      expect(result.purchase[0].id).toBe("purchase-123");
      expect(result.purchase[0].nf_number).toBe("NF-123456");
      expect(result.purchase[0].supplier_id).toBe("supplier-123");
      expect(result.purchase[0].user_id).toBe("user-123");
      expect(result.purchase[0].sub_total).toBe(333.75);
    });

    it("should handle purchases from different users and suppliers", async () => {
      // Arrange
      const mockPurchases: Purchase[] = [
        {
          id: "purchase-1",
          nf_number: "NF-001",
          supplier_id: "supplier-1",
          user_id: "user-1",
          sub_total: 100.00,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
        {
          id: "purchase-2",
          nf_number: "NF-002",
          supplier_id: "supplier-2",
          user_id: "user-2",
          sub_total: 200.00,
          created_at: new Date('2023-01-02'),
          updated_at: new Date('2023-01-02'),
        },
        {
          id: "purchase-3",
          nf_number: "NF-003",
          supplier_id: "supplier-3",
          user_id: "user-3",
          sub_total: 300.00,
          created_at: new Date('2023-01-03'),
          updated_at: new Date('2023-01-03'),
        },
      ];

      vi.mocked(mockPurchaseRepository.findMany).mockResolvedValue(mockPurchases);

      // Act
      const result = await fetchAllPurchaseService.execute();

      // Assert
      expect(result.purchase).toHaveLength(3);
      expect(result.purchase[0].user_id).toBe("user-1");
      expect(result.purchase[1].user_id).toBe("user-2");
      expect(result.purchase[2].user_id).toBe("user-3");
      expect(result.purchase[0].supplier_id).toBe("supplier-1");
      expect(result.purchase[1].supplier_id).toBe("supplier-2");
      expect(result.purchase[2].supplier_id).toBe("supplier-3");
    });

    it("should handle purchases with zero subtotal", async () => {
      // Arrange
      const mockPurchases: Purchase[] = [
        {
          id: "purchase-1",
          nf_number: "NF-001",
          supplier_id: "supplier-123",
          user_id: "user-123",
          sub_total: 0,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
      ];

      vi.mocked(mockPurchaseRepository.findMany).mockResolvedValue(mockPurchases);

      // Act
      const result = await fetchAllPurchaseService.execute();

      // Assert
      expect(result.purchase[0].sub_total).toBe(0);
    });

    it("should handle purchases with decimal subtotal", async () => {
      // Arrange
      const mockPurchases: Purchase[] = [
        {
          id: "purchase-1",
          nf_number: "NF-001",
          supplier_id: "supplier-123",
          user_id: "user-123",
          sub_total: 123.45,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
      ];

      vi.mocked(mockPurchaseRepository.findMany).mockResolvedValue(mockPurchases);

      // Act
      const result = await fetchAllPurchaseService.execute();

      // Assert
      expect(result.purchase[0].sub_total).toBe(123.45);
    });

    it("should call repository method only once", async () => {
      // Arrange
      const mockPurchases: Purchase[] = [
        {
          id: "purchase-1",
          nf_number: "NF-001",
          supplier_id: "supplier-123",
          user_id: "user-123",
          sub_total: 100.00,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      vi.mocked(mockPurchaseRepository.findMany).mockResolvedValue(mockPurchases);

      // Act
      await fetchAllPurchaseService.execute();

      // Assert
      expect(mockPurchaseRepository.findMany).toHaveBeenCalledOnce();
      expect(mockPurchaseRepository.findMany).not.toHaveBeenCalledTimes(2);
    });

    it("should return the same purchases array as repository", async () => {
      // Arrange
      const mockPurchases: Purchase[] = [
        {
          id: "purchase-1",
          nf_number: "NF-001",
          supplier_id: "supplier-123",
          user_id: "user-123",
          sub_total: 100.00,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
        {
          id: "purchase-2",
          nf_number: "NF-002",
          supplier_id: "supplier-456",
          user_id: "user-456",
          sub_total: 200.00,
          created_at: new Date('2023-01-02'),
          updated_at: new Date('2023-01-02'),
        },
      ];

      vi.mocked(mockPurchaseRepository.findMany).mockResolvedValue(mockPurchases);

      // Act
      const result = await fetchAllPurchaseService.execute();

      // Assert
      expect(result.purchase).toBe(mockPurchases); // Mesma referência
      expect(result.purchase).toEqual(mockPurchases); // Mesmo conteúdo
    });

    it("should handle large number of purchases", async () => {
      // Arrange
      const mockPurchases: Purchase[] = Array.from({ length: 50 }, (_, index) => ({
        id: `purchase-${index + 1}`,
        nf_number: `NF-${String(index + 1).padStart(3, '0')}`,
        supplier_id: `supplier-${(index % 5) + 1}`,
        user_id: `user-${(index % 10) + 1}`,
        sub_total: (index + 1) * 10,
        created_at: new Date(2023, 0, index + 1),
        updated_at: new Date(2023, 0, index + 1),
      }));

      vi.mocked(mockPurchaseRepository.findMany).mockResolvedValue(mockPurchases);

      // Act
      const result = await fetchAllPurchaseService.execute();

      // Assert
      expect(result.purchase).toHaveLength(50);
      expect(result.purchase[0].id).toBe("purchase-1");
      expect(result.purchase[49].id).toBe("purchase-50");
      expect(result.purchase[0].nf_number).toBe("NF-001");
      expect(result.purchase[49].nf_number).toBe("NF-050");
    });

    it("should handle purchases with different date ranges", async () => {
      // Arrange
      const mockPurchases: Purchase[] = [
        {
          id: "purchase-1",
          nf_number: "NF-001",
          supplier_id: "supplier-123",
          user_id: "user-123",
          sub_total: 100.00,
          created_at: new Date('2022-12-01'),
          updated_at: new Date('2022-12-01'),
        },
        {
          id: "purchase-2",
          nf_number: "NF-002",
          supplier_id: "supplier-456",
          user_id: "user-456",
          sub_total: 200.00,
          created_at: new Date('2023-01-15'),
          updated_at: new Date('2023-01-15'),
        },
        {
          id: "purchase-3",
          nf_number: "NF-003",
          supplier_id: "supplier-789",
          user_id: "user-789",
          sub_total: 300.00,
          created_at: new Date('2023-03-20'),
          updated_at: new Date('2023-03-20'),
        },
      ];

      vi.mocked(mockPurchaseRepository.findMany).mockResolvedValue(mockPurchases);

      // Act
      const result = await fetchAllPurchaseService.execute();

      // Assert
      expect(result.purchase).toHaveLength(3);
      expect(result.purchase[0].created_at).toEqual(new Date('2022-12-01'));
      expect(result.purchase[1].created_at).toEqual(new Date('2023-01-15'));
      expect(result.purchase[2].created_at).toEqual(new Date('2023-03-20'));
    });
  });
});