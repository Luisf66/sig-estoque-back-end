// tests/unit/services/purchase/fetch-all-purchase-by-supplier-id.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FetchAllPurchaseBySupplierIdService } from "../../../src/services/purchase/fetch-all-purchase-by-supplier-id";
import type { PurchaseRepository } from "../../../src/repositories/purchase-repository";
import type { SupplierRepository } from "../../../src/repositories/supplier-repository";
import { ResourceNotFoundError } from "../../../src/services/errors/resource-not-found-error";
import type { Purchase, Supplier } from "@prisma/client";

describe("FetchAllPurchaseBySupplierIdService", () => {
  let fetchAllPurchaseBySupplierIdService: FetchAllPurchaseBySupplierIdService;
  let mockPurchaseRepository: PurchaseRepository;
  let mockSupplierRepository: SupplierRepository;

  beforeEach(() => {
    mockPurchaseRepository = {
      findManyBySupplierId: vi.fn(),
      create: vi.fn(),
      updateSubTotal: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      findManyByUserId: vi.fn(),
      // Adicione outros métodos se necessário
    };

    mockSupplierRepository = {
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      findManyByCompanyName: vi.fn(),
      findManyBySocialName: vi.fn(),
      // Adicione outros métodos se necessário
    };

    fetchAllPurchaseBySupplierIdService = new FetchAllPurchaseBySupplierIdService(
      mockPurchaseRepository,
      mockSupplierRepository
    );

    vi.clearAllMocks();
  });

  describe("execute", () => {
    const mockRequest = {
      supplierId: "supplier-123",
    };

    const mockSupplier: Supplier = {
      id: "supplier-123",
      social_name: "Supplier LTDA",
      company_name: "Supplier Company",
      cnpj: "12345678000195",
      email: "supplier@example.com",
      phone: "11999999999",
      active: true,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01'),
    };

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
        supplier_id: "supplier-123",
        user_id: "user-2",
        sub_total: 2500.75,
        created_at: new Date('2023-02-20'),
        updated_at: new Date('2023-02-20'),
      },
    ];

    it("should return purchases for supplier successfully", async () => {
      // Arrange
      vi.mocked(mockSupplierRepository.findById).mockResolvedValue(mockSupplier);
      vi.mocked(mockPurchaseRepository.findManyBySupplierId).mockResolvedValue(mockPurchases);

      // Act
      const result = await fetchAllPurchaseBySupplierIdService.execute(mockRequest);

      // Assert
      expect(mockSupplierRepository.findById).toHaveBeenCalledWith(mockRequest.supplierId);
      expect(mockPurchaseRepository.findManyBySupplierId).toHaveBeenCalledWith(mockRequest.supplierId);
      expect(result.purchases).toEqual(mockPurchases);
      expect(result.purchases).toHaveLength(2);
    });

    it("should throw ResourceNotFoundError when supplier not found", async () => {
      // Arrange
      vi.mocked(mockSupplierRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(fetchAllPurchaseBySupplierIdService.execute(mockRequest))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockSupplierRepository.findById).toHaveBeenCalledWith(mockRequest.supplierId);
      expect(mockPurchaseRepository.findManyBySupplierId).not.toHaveBeenCalled();
    });

    it("should return empty array when no purchases found for supplier", async () => {
      // Arrange
      vi.mocked(mockSupplierRepository.findById).mockResolvedValue(mockSupplier);
      vi.mocked(mockPurchaseRepository.findManyBySupplierId).mockResolvedValue([]);

      // Act
      const result = await fetchAllPurchaseBySupplierIdService.execute(mockRequest);

      // Assert
      expect(mockSupplierRepository.findById).toHaveBeenCalledWith(mockRequest.supplierId);
      expect(mockPurchaseRepository.findManyBySupplierId).toHaveBeenCalledWith(mockRequest.supplierId);
      expect(result.purchases).toEqual([]);
      expect(result.purchases).toHaveLength(0);
    });

    it("should propagate errors from supplier repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockSupplierRepository.findById).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(fetchAllPurchaseBySupplierIdService.execute(mockRequest))
        .rejects
        .toThrow("Database connection error");

      expect(mockSupplierRepository.findById).toHaveBeenCalledWith(mockRequest.supplierId);
      expect(mockPurchaseRepository.findManyBySupplierId).not.toHaveBeenCalled();
    });

    it("should propagate errors from purchase repository", async () => {
      // Arrange
      vi.mocked(mockSupplierRepository.findById).mockResolvedValue(mockSupplier);
      const repositoryError = new Error("Purchase search failed");
      vi.mocked(mockPurchaseRepository.findManyBySupplierId).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(fetchAllPurchaseBySupplierIdService.execute(mockRequest))
        .rejects
        .toThrow("Purchase search failed");

      expect(mockSupplierRepository.findById).toHaveBeenCalledWith(mockRequest.supplierId);
      expect(mockPurchaseRepository.findManyBySupplierId).toHaveBeenCalledWith(mockRequest.supplierId);
    });

    it("should search for purchases with correct supplier ID", async () => {
      // Arrange
      vi.mocked(mockSupplierRepository.findById).mockResolvedValue(mockSupplier);
      vi.mocked(mockPurchaseRepository.findManyBySupplierId).mockResolvedValue(mockPurchases);
      
      const differentSupplierRequest = {
        supplierId: "different-supplier",
      };

      // Act
      await fetchAllPurchaseBySupplierIdService.execute(differentSupplierRequest);

      // Assert
      expect(mockSupplierRepository.findById).toHaveBeenCalledWith("different-supplier");
      expect(mockPurchaseRepository.findManyBySupplierId).toHaveBeenCalledWith("different-supplier");
      expect(mockSupplierRepository.findById).not.toHaveBeenCalledWith(mockRequest.supplierId);
      expect(mockPurchaseRepository.findManyBySupplierId).not.toHaveBeenCalledWith(mockRequest.supplierId);
    });

    it("should return purchases with correct structure", async () => {
      // Arrange
      vi.mocked(mockSupplierRepository.findById).mockResolvedValue(mockSupplier);
      vi.mocked(mockPurchaseRepository.findManyBySupplierId).mockResolvedValue(mockPurchases);

      // Act
      const result = await fetchAllPurchaseBySupplierIdService.execute(mockRequest);

      // Assert
      expect(result.purchases[0]).toHaveProperty('id');
      expect(result.purchases[0]).toHaveProperty('nf_number');
      expect(result.purchases[0]).toHaveProperty('supplier_id');
      expect(result.purchases[0]).toHaveProperty('user_id');
      expect(result.purchases[0]).toHaveProperty('sub_total');
      expect(result.purchases[0]).toHaveProperty('created_at');
      expect(result.purchases[0]).toHaveProperty('updated_at');
      
      expect(result.purchases[0].supplier_id).toBe("supplier-123");
      expect(result.purchases[1].supplier_id).toBe("supplier-123");
    });

    it("should handle supplier with multiple purchases", async () => {
      // Arrange
      const multiplePurchases: Purchase[] = [
        {
          id: "purchase-1",
          nf_number: "NF-001",
          supplier_id: "supplier-123",
          user_id: "user-1",
          sub_total: 100.00,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
        {
          id: "purchase-2",
          nf_number: "NF-002",
          supplier_id: "supplier-123",
          user_id: "user-2",
          sub_total: 200.00,
          created_at: new Date('2023-01-02'),
          updated_at: new Date('2023-01-02'),
        },
        {
          id: "purchase-3",
          nf_number: "NF-003",
          supplier_id: "supplier-123",
          user_id: "user-3",
          sub_total: 300.00,
          created_at: new Date('2023-01-03'),
          updated_at: new Date('2023-01-03'),
        },
      ];

      vi.mocked(mockSupplierRepository.findById).mockResolvedValue(mockSupplier);
      vi.mocked(mockPurchaseRepository.findManyBySupplierId).mockResolvedValue(multiplePurchases);

      // Act
      const result = await fetchAllPurchaseBySupplierIdService.execute(mockRequest);

      // Assert
      expect(result.purchases).toHaveLength(3);
      expect(result.purchases[0].nf_number).toBe("NF-001");
      expect(result.purchases[1].nf_number).toBe("NF-002");
      expect(result.purchases[2].nf_number).toBe("NF-003");
    });

    it("should handle inactive supplier with purchases", async () => {
      // Arrange
      const inactiveSupplier: Supplier = {
        ...mockSupplier,
        active: false,
      };

      vi.mocked(mockSupplierRepository.findById).mockResolvedValue(inactiveSupplier);
      vi.mocked(mockPurchaseRepository.findManyBySupplierId).mockResolvedValue(mockPurchases);

      // Act
      const result = await fetchAllPurchaseBySupplierIdService.execute(mockRequest);

      // Assert
      expect(mockSupplierRepository.findById).toHaveBeenCalledWith(mockRequest.supplierId);
      expect(mockPurchaseRepository.findManyBySupplierId).toHaveBeenCalledWith(mockRequest.supplierId);
      expect(result.purchases).toEqual(mockPurchases);
    });

    it("should throw ResourceNotFoundError for empty supplier ID", async () => {
      // Arrange
      vi.mocked(mockSupplierRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(fetchAllPurchaseBySupplierIdService.execute({ supplierId: "" }))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockSupplierRepository.findById).toHaveBeenCalledWith("");
      expect(mockPurchaseRepository.findManyBySupplierId).not.toHaveBeenCalled();
    });

    it("should throw ResourceNotFoundError for non-existent supplier ID", async () => {
      // Arrange
      vi.mocked(mockSupplierRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(fetchAllPurchaseBySupplierIdService.execute({ supplierId: "non-existent-supplier" }))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockSupplierRepository.findById).toHaveBeenCalledWith("non-existent-supplier");
      expect(mockPurchaseRepository.findManyBySupplierId).not.toHaveBeenCalled();
    });

    it("should call repositories in correct order", async () => {
      // Arrange
      let callOrder: string[] = [];
      
      vi.mocked(mockSupplierRepository.findById).mockImplementation(async () => {
        callOrder.push('findSupplier');
        return mockSupplier;
      });
      
      vi.mocked(mockPurchaseRepository.findManyBySupplierId).mockImplementation(async () => {
        callOrder.push('findPurchases');
        return mockPurchases;
      });

      // Act
      await fetchAllPurchaseBySupplierIdService.execute(mockRequest);

      // Assert
      // Verifica que primeiro busca o supplier e depois as compras
      expect(callOrder).toEqual(['findSupplier', 'findPurchases']);
    });

    it("should return the same purchases array as repository", async () => {
      // Arrange
      vi.mocked(mockSupplierRepository.findById).mockResolvedValue(mockSupplier);
      vi.mocked(mockPurchaseRepository.findManyBySupplierId).mockResolvedValue(mockPurchases);

      // Act
      const result = await fetchAllPurchaseBySupplierIdService.execute(mockRequest);

      // Assert
      expect(result.purchases).toBe(mockPurchases); // Mesma referência
      expect(result.purchases).toEqual(mockPurchases); // Mesmo conteúdo
    });

    it("should not call purchase repository when supplier is not found", async () => {
      // Arrange
      vi.mocked(mockSupplierRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(fetchAllPurchaseBySupplierIdService.execute(mockRequest))
        .rejects
        .toThrow(ResourceNotFoundError);

      // Verifica que findById foi chamado mas findManyBySupplierId não
      expect(mockSupplierRepository.findById).toHaveBeenCalled();
      expect(mockPurchaseRepository.findManyBySupplierId).not.toHaveBeenCalled();
    });
  });
});