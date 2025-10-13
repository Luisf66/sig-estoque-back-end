// tests/unit/services/sale/fetch-all-sale.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FetchAllSaleService } from "../../../src/services/sale/fetch-all-sale";
import type { SaleRepository } from "../../../src/repositories/sale-repository";
import type { Sale } from "@prisma/client";

describe("FetchAllSaleService", () => {
  let fetchAllSaleService: FetchAllSaleService;
  let mockSaleRepository: SaleRepository;

  beforeEach(() => {
    mockSaleRepository = {
      findMany: vi.fn(),
      findManyByUserId: vi.fn(),
      create: vi.fn(),
      updateSubTotal: vi.fn(),
      findById: vi.fn(),
      // Adicione outros métodos se necessário
    };

    fetchAllSaleService = new FetchAllSaleService(mockSaleRepository);
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should return all sales successfully", async () => {
      // Arrange
      const mockSales: Sale[] = [
        {
          id: "sale-1",
          nf_number: "NF-001",
          user_id: "user-1",
          sub_total: 1000.50,
          created_at: new Date('2023-01-15'),
          updated_at: new Date('2023-01-15'),
        },
        {
          id: "sale-2",
          nf_number: "NF-002",
          user_id: "user-2",
          sub_total: 2500.75,
          created_at: new Date('2023-02-20'),
          updated_at: new Date('2023-02-20'),
        },
        {
          id: "sale-3",
          nf_number: "NF-003",
          user_id: "user-3",
          sub_total: 3500.25,
          created_at: new Date('2023-03-10'),
          updated_at: new Date('2023-03-10'),
        },
      ];

      vi.mocked(mockSaleRepository.findMany).mockResolvedValue(mockSales);

      // Act
      const result = await fetchAllSaleService.execute();

      // Assert
      expect(mockSaleRepository.findMany).toHaveBeenCalledOnce();
      expect(result.sale).toEqual(mockSales);
      expect(result.sale).toHaveLength(3);
    });

    it("should return empty array when no sales exist", async () => {
      // Arrange
      const mockSales: Sale[] = [];
      vi.mocked(mockSaleRepository.findMany).mockResolvedValue(mockSales);

      // Act
      const result = await fetchAllSaleService.execute();

      // Assert
      expect(mockSaleRepository.findMany).toHaveBeenCalledOnce();
      expect(result.sale).toEqual([]);
      expect(result.sale).toHaveLength(0);
    });

    it("should propagate errors from sale repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockSaleRepository.findMany).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(fetchAllSaleService.execute())
        .rejects
        .toThrow("Database connection error");
      
      expect(mockSaleRepository.findMany).toHaveBeenCalledOnce();
    });

    it("should return sales with correct structure", async () => {
      // Arrange
      const mockSales: Sale[] = [
        {
          id: "sale-123",
          nf_number: "NF-123456",
          user_id: "user-123",
          sub_total: 174.75,
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: new Date('2023-01-01T00:00:00Z'),
        },
      ];

      vi.mocked(mockSaleRepository.findMany).mockResolvedValue(mockSales);

      // Act
      const result = await fetchAllSaleService.execute();

      // Assert
      expect(result.sale[0]).toHaveProperty('id');
      expect(result.sale[0]).toHaveProperty('nf_number');
      expect(result.sale[0]).toHaveProperty('user_id');
      expect(result.sale[0]).toHaveProperty('sub_total');
      expect(result.sale[0]).toHaveProperty('created_at');
      expect(result.sale[0]).toHaveProperty('updated_at');
      
      expect(result.sale[0].id).toBe("sale-123");
      expect(result.sale[0].nf_number).toBe("NF-123456");
      expect(result.sale[0].user_id).toBe("user-123");
      expect(result.sale[0].sub_total).toBe(174.75);
    });

    it("should handle sales from different users", async () => {
      // Arrange
      const mockSales: Sale[] = [
        {
          id: "sale-1",
          nf_number: "NF-001",
          user_id: "user-1",
          sub_total: 100.00,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
        {
          id: "sale-2",
          nf_number: "NF-002",
          user_id: "user-2",
          sub_total: 200.00,
          created_at: new Date('2023-01-02'),
          updated_at: new Date('2023-01-02'),
        },
        {
          id: "sale-3",
          nf_number: "NF-003",
          user_id: "user-3",
          sub_total: 300.00,
          created_at: new Date('2023-01-03'),
          updated_at: new Date('2023-01-03'),
        },
      ];

      vi.mocked(mockSaleRepository.findMany).mockResolvedValue(mockSales);

      // Act
      const result = await fetchAllSaleService.execute();

      // Assert
      expect(result.sale).toHaveLength(3);
      expect(result.sale[0].user_id).toBe("user-1");
      expect(result.sale[1].user_id).toBe("user-2");
      expect(result.sale[2].user_id).toBe("user-3");
    });

    it("should handle sales with zero subtotal", async () => {
      // Arrange
      const mockSales: Sale[] = [
        {
          id: "sale-1",
          nf_number: "NF-001",
          user_id: "user-123",
          sub_total: 0,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
      ];

      vi.mocked(mockSaleRepository.findMany).mockResolvedValue(mockSales);

      // Act
      const result = await fetchAllSaleService.execute();

      // Assert
      expect(result.sale[0].sub_total).toBe(0);
    });

    it("should handle sales with decimal subtotal", async () => {
      // Arrange
      const mockSales: Sale[] = [
        {
          id: "sale-1",
          nf_number: "NF-001",
          user_id: "user-123",
          sub_total: 123.45,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
      ];

      vi.mocked(mockSaleRepository.findMany).mockResolvedValue(mockSales);

      // Act
      const result = await fetchAllSaleService.execute();

      // Assert
      expect(result.sale[0].sub_total).toBe(123.45);
    });

    it("should call repository method only once", async () => {
      // Arrange
      const mockSales: Sale[] = [
        {
          id: "sale-1",
          nf_number: "NF-001",
          user_id: "user-123",
          sub_total: 100.00,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      vi.mocked(mockSaleRepository.findMany).mockResolvedValue(mockSales);

      // Act
      await fetchAllSaleService.execute();

      // Assert
      expect(mockSaleRepository.findMany).toHaveBeenCalledOnce();
      expect(mockSaleRepository.findMany).not.toHaveBeenCalledTimes(2);
    });

    it("should return the same sales array as repository", async () => {
      // Arrange
      const mockSales: Sale[] = [
        {
          id: "sale-1",
          nf_number: "NF-001",
          user_id: "user-123",
          sub_total: 100.00,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
        {
          id: "sale-2",
          nf_number: "NF-002",
          user_id: "user-456",
          sub_total: 200.00,
          created_at: new Date('2023-01-02'),
          updated_at: new Date('2023-01-02'),
        },
      ];

      vi.mocked(mockSaleRepository.findMany).mockResolvedValue(mockSales);

      // Act
      const result = await fetchAllSaleService.execute();

      // Assert
      expect(result.sale).toBe(mockSales); // Mesma referência
      expect(result.sale).toEqual(mockSales); // Mesmo conteúdo
    });

    it("should handle large number of sales", async () => {
      // Arrange
      const mockSales: Sale[] = Array.from({ length: 50 }, (_, index) => ({
        id: `sale-${index + 1}`,
        nf_number: `NF-${String(index + 1).padStart(3, '0')}`,
        user_id: `user-${(index % 10) + 1}`,
        sub_total: (index + 1) * 10,
        created_at: new Date(2023, 0, index + 1),
        updated_at: new Date(2023, 0, index + 1),
      }));

      vi.mocked(mockSaleRepository.findMany).mockResolvedValue(mockSales);

      // Act
      const result = await fetchAllSaleService.execute();

      // Assert
      expect(result.sale).toHaveLength(50);
      expect(result.sale[0].id).toBe("sale-1");
      expect(result.sale[49].id).toBe("sale-50");
      expect(result.sale[0].nf_number).toBe("NF-001");
      expect(result.sale[49].nf_number).toBe("NF-050");
    });

    it("should handle sales with different date ranges", async () => {
      // Arrange
      const mockSales: Sale[] = [
        {
          id: "sale-1",
          nf_number: "NF-001",
          user_id: "user-123",
          sub_total: 100.00,
          created_at: new Date('2022-12-01'),
          updated_at: new Date('2022-12-01'),
        },
        {
          id: "sale-2",
          nf_number: "NF-002",
          user_id: "user-456",
          sub_total: 200.00,
          created_at: new Date('2023-01-15'),
          updated_at: new Date('2023-01-15'),
        },
        {
          id: "sale-3",
          nf_number: "NF-003",
          user_id: "user-789",
          sub_total: 300.00,
          created_at: new Date('2023-03-20'),
          updated_at: new Date('2023-03-20'),
        },
      ];

      vi.mocked(mockSaleRepository.findMany).mockResolvedValue(mockSales);

      // Act
      const result = await fetchAllSaleService.execute();

      // Assert
      expect(result.sale).toHaveLength(3);
      expect(result.sale[0].created_at).toEqual(new Date('2022-12-01'));
      expect(result.sale[1].created_at).toEqual(new Date('2023-01-15'));
      expect(result.sale[2].created_at).toEqual(new Date('2023-03-20'));
    });

    it("should handle sales with different NF number formats", async () => {
      // Arrange
      const mockSales: Sale[] = [
        {
          id: "sale-1",
          nf_number: "NF/2023/0001",
          user_id: "user-123",
          sub_total: 150.00,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
        {
          id: "sale-2",
          nf_number: "NF-2023-0002",
          user_id: "user-456",
          sub_total: 250.00,
          created_at: new Date('2023-01-02'),
          updated_at: new Date('2023-01-02'),
        },
        {
          id: "sale-3",
          nf_number: "2023/NF/0003",
          user_id: "user-789",
          sub_total: 350.00,
          created_at: new Date('2023-01-03'),
          updated_at: new Date('2023-01-03'),
        },
      ];

      vi.mocked(mockSaleRepository.findMany).mockResolvedValue(mockSales);

      // Act
      const result = await fetchAllSaleService.execute();

      // Assert
      expect(result.sale).toHaveLength(3);
      expect(result.sale[0].nf_number).toBe("NF/2023/0001");
      expect(result.sale[1].nf_number).toBe("NF-2023-0002");
      expect(result.sale[2].nf_number).toBe("2023/NF/0003");
    });

    it("should handle sales with high precision decimal subtotals", async () => {
      // Arrange
      const mockSales: Sale[] = [
        {
          id: "sale-1",
          nf_number: "NF-001",
          user_id: "user-123",
          sub_total: 123.4567,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
        {
          id: "sale-2",
          nf_number: "NF-002",
          user_id: "user-456",
          sub_total: 789.0123,
          created_at: new Date('2023-01-02'),
          updated_at: new Date('2023-01-02'),
        },
      ];

      vi.mocked(mockSaleRepository.findMany).mockResolvedValue(mockSales);

      // Act
      const result = await fetchAllSaleService.execute();

      // Assert
      expect(result.sale[0].sub_total).toBe(123.4567);
      expect(result.sale[1].sub_total).toBe(789.0123);
    });

    it("should complete successfully without errors", async () => {
      // Arrange
      const mockSales: Sale[] = [
        {
          id: "sale-1",
          nf_number: "NF-001",
          user_id: "user-123",
          sub_total: 100.00,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      vi.mocked(mockSaleRepository.findMany).mockResolvedValue(mockSales);

      // Act & Assert
      await expect(fetchAllSaleService.execute()).resolves.not.toThrow();
      
      const result = await fetchAllSaleService.execute();
      expect(result.sale).toEqual(mockSales);
    });
  });
});