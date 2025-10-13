// tests/unit/services/sale/find-sale-by-id.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindSaleByIdService } from "../../../src/services/sale/find-sale-by-id";
import type { SaleRepository } from "../../../src/repositories/sale-repository";
import { ResourceNotFoundError } from "../../../src/services/errors/resource-not-found-error";
import type { Sale } from "@prisma/client";

describe("FindSaleByIdService", () => {
  let findSaleByIdService: FindSaleByIdService;
  let mockSaleRepository: SaleRepository;

  beforeEach(() => {
    mockSaleRepository = {
      findById: vi.fn(),
      findMany: vi.fn(),
      findManyByUserId: vi.fn(),
      create: vi.fn(),
      updateSubTotal: vi.fn(),
      // Adicione outros métodos se necessário
    };

    findSaleByIdService = new FindSaleByIdService(mockSaleRepository);
    vi.clearAllMocks();
  });

  describe("execute", () => {
    const mockRequest = {
      saleId: "sale-123",
    };

    const mockSale: Sale = {
      id: "sale-123",
      nf_number: "NF-123456",
      user_id: "user-123",
      sub_total: 174.75,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01'),
    };

    it("should return sale when found by ID", async () => {
      // Arrange
      vi.mocked(mockSaleRepository.findById).mockResolvedValue(mockSale);

      // Act
      const result = await findSaleByIdService.execute(mockRequest);

      // Assert
      expect(mockSaleRepository.findById).toHaveBeenCalledWith(mockRequest.saleId);
      expect(mockSaleRepository.findById).toHaveBeenCalledOnce();
      expect(result.sale).toEqual(mockSale);
    });

    it("should throw ResourceNotFoundError when sale not found", async () => {
      // Arrange
      vi.mocked(mockSaleRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(findSaleByIdService.execute(mockRequest))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockSaleRepository.findById).toHaveBeenCalledWith(mockRequest.saleId);
    });

    it("should propagate errors from sale repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockSaleRepository.findById).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(findSaleByIdService.execute(mockRequest))
        .rejects
        .toThrow("Database connection error");
      
      expect(mockSaleRepository.findById).toHaveBeenCalledWith(mockRequest.saleId);
    });

    it("should search for sale with correct ID", async () => {
      // Arrange
      vi.mocked(mockSaleRepository.findById).mockResolvedValue(mockSale);
      const differentIdRequest = {
        saleId: "different-sale-id",
      };

      // Act
      await findSaleByIdService.execute(differentIdRequest);

      // Assert
      expect(mockSaleRepository.findById).toHaveBeenCalledWith("different-sale-id");
      expect(mockSaleRepository.findById).not.toHaveBeenCalledWith(mockRequest.saleId);
    });

    it("should return sale with correct properties", async () => {
      // Arrange
      vi.mocked(mockSaleRepository.findById).mockResolvedValue(mockSale);

      // Act
      const result = await findSaleByIdService.execute(mockRequest);

      // Assert
      expect(result.sale).toHaveProperty('id', 'sale-123');
      expect(result.sale).toHaveProperty('nf_number', 'NF-123456');
      expect(result.sale).toHaveProperty('user_id', 'user-123');
      expect(result.sale).toHaveProperty('sub_total', 174.75);
      expect(result.sale).toHaveProperty('created_at');
      expect(result.sale).toHaveProperty('updated_at');
    });

    it("should handle different sale IDs correctly", async () => {
      // Arrange
      const sale1: Sale = {
        id: "sale-1",
        nf_number: "NF-001",
        user_id: "user-1",
        sub_total: 100.00,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const sale2: Sale = {
        id: "sale-2",
        nf_number: "NF-002",
        user_id: "user-2",
        sub_total: 200.00,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock para diferentes chamadas
      vi.mocked(mockSaleRepository.findById)
        .mockResolvedValueOnce(sale1)
        .mockResolvedValueOnce(sale2);

      // Act
      const result1 = await findSaleByIdService.execute({ saleId: "sale-1" });
      const result2 = await findSaleByIdService.execute({ saleId: "sale-2" });

      // Assert
      expect(mockSaleRepository.findById).toHaveBeenNthCalledWith(1, "sale-1");
      expect(mockSaleRepository.findById).toHaveBeenNthCalledWith(2, "sale-2");
      expect(result1.sale).toEqual(sale1);
      expect(result2.sale).toEqual(sale2);
    });

    it("should throw ResourceNotFoundError for empty ID", async () => {
      // Arrange
      vi.mocked(mockSaleRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(findSaleByIdService.execute({ saleId: "" }))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockSaleRepository.findById).toHaveBeenCalledWith("");
    });

    it("should throw ResourceNotFoundError for non-existent ID", async () => {
      // Arrange
      vi.mocked(mockSaleRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(findSaleByIdService.execute({ saleId: "non-existent-id" }))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockSaleRepository.findById).toHaveBeenCalledWith("non-existent-id");
    });

    it("should handle sale with zero subtotal", async () => {
      // Arrange
      const saleWithZeroSubtotal: Sale = {
        ...mockSale,
        sub_total: 0,
      };

      vi.mocked(mockSaleRepository.findById).mockResolvedValue(saleWithZeroSubtotal);

      // Act
      const result = await findSaleByIdService.execute(mockRequest);

      // Assert
      expect(result.sale.sub_total).toBe(0);
    });

    it("should handle sale with decimal subtotal", async () => {
      // Arrange
      const saleWithDecimalSubtotal: Sale = {
        ...mockSale,
        sub_total: 123.45,
      };

      vi.mocked(mockSaleRepository.findById).mockResolvedValue(saleWithDecimalSubtotal);

      // Act
      const result = await findSaleByIdService.execute(mockRequest);

      // Assert
      expect(result.sale.sub_total).toBe(123.45);
    });

    it("should handle sale with high precision decimal subtotal", async () => {
      // Arrange
      const saleWithHighPrecisionSubtotal: Sale = {
        ...mockSale,
        sub_total: 123.456789,
      };

      vi.mocked(mockSaleRepository.findById).mockResolvedValue(saleWithHighPrecisionSubtotal);

      // Act
      const result = await findSaleByIdService.execute(mockRequest);

      // Assert
      expect(result.sale.sub_total).toBe(123.456789);
    });

    it("should handle sale with different nf_number formats", async () => {
      // Arrange
      const saleWithDifferentNF: Sale = {
        ...mockSale,
        nf_number: "NF/2023/0001",
      };

      vi.mocked(mockSaleRepository.findById).mockResolvedValue(saleWithDifferentNF);

      // Act
      const result = await findSaleByIdService.execute(mockRequest);

      // Assert
      expect(result.sale.nf_number).toBe("NF/2023/0001");
    });

    it("should handle sale from different user", async () => {
      // Arrange
      const saleFromDifferentUser: Sale = {
        ...mockSale,
        user_id: "user-456",
      };

      vi.mocked(mockSaleRepository.findById).mockResolvedValue(saleFromDifferentUser);

      // Act
      const result = await findSaleByIdService.execute(mockRequest);

      // Assert
      expect(result.sale.user_id).toBe("user-456");
    });

    it("should handle sale with old date", async () => {
      // Arrange
      const saleWithOldDate: Sale = {
        ...mockSale,
        created_at: new Date('2020-01-01'),
        updated_at: new Date('2020-01-01'),
      };

      vi.mocked(mockSaleRepository.findById).mockResolvedValue(saleWithOldDate);

      // Act
      const result = await findSaleByIdService.execute(mockRequest);

      // Assert
      expect(result.sale.created_at).toEqual(new Date('2020-01-01'));
      expect(result.sale.updated_at).toEqual(new Date('2020-01-01'));
    });

    it("should handle sale with recent date", async () => {
      // Arrange
      const recentDate = new Date();
      const saleWithRecentDate: Sale = {
        ...mockSale,
        created_at: recentDate,
        updated_at: recentDate,
      };

      vi.mocked(mockSaleRepository.findById).mockResolvedValue(saleWithRecentDate);

      // Act
      const result = await findSaleByIdService.execute(mockRequest);

      // Assert
      expect(result.sale.created_at).toEqual(recentDate);
      expect(result.sale.updated_at).toEqual(recentDate);
    });

    it("should handle sale with different created and updated dates", async () => {
      // Arrange
      const createdDate = new Date('2023-01-01');
      const updatedDate = new Date('2023-01-02');
      const saleWithDifferentDates: Sale = {
        ...mockSale,
        created_at: createdDate,
        updated_at: updatedDate,
      };

      vi.mocked(mockSaleRepository.findById).mockResolvedValue(saleWithDifferentDates);

      // Act
      const result = await findSaleByIdService.execute(mockRequest);

      // Assert
      expect(result.sale.created_at).toEqual(createdDate);
      expect(result.sale.updated_at).toEqual(updatedDate);
      expect(result.sale.created_at).not.toEqual(result.sale.updated_at);
    });

    it("should return consistent results for same sale ID", async () => {
      // Arrange
      vi.mocked(mockSaleRepository.findById).mockResolvedValue(mockSale);

      // Act
      const result1 = await findSaleByIdService.execute(mockRequest);
      const result2 = await findSaleByIdService.execute(mockRequest);

      // Assert
      expect(result1.sale).toEqual(result2.sale);
      expect(mockSaleRepository.findById).toHaveBeenCalledTimes(2);
      expect(mockSaleRepository.findById).toHaveBeenNthCalledWith(1, mockRequest.saleId);
      expect(mockSaleRepository.findById).toHaveBeenNthCalledWith(2, mockRequest.saleId);
    });

    it("should handle UUID format sale IDs", async () => {
      // Arrange
      const uuidSaleId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
      const saleWithUUID: Sale = {
        id: uuidSaleId,
        nf_number: "NF-001",
        user_id: "user-123",
        sub_total: 100.00,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(mockSaleRepository.findById).mockResolvedValue(saleWithUUID);

      // Act
      const result = await findSaleByIdService.execute({ saleId: uuidSaleId });

      // Assert
      expect(mockSaleRepository.findById).toHaveBeenCalledWith(uuidSaleId);
      expect(result.sale.id).toBe(uuidSaleId);
    });

    it("should handle numeric format sale IDs", async () => {
      // Arrange
      const numericSaleId = "12345";
      const saleWithNumericID: Sale = {
        id: numericSaleId,
        nf_number: "NF-001",
        user_id: "user-123",
        sub_total: 100.00,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(mockSaleRepository.findById).mockResolvedValue(saleWithNumericID);

      // Act
      const result = await findSaleByIdService.execute({ saleId: numericSaleId });

      // Assert
      expect(mockSaleRepository.findById).toHaveBeenCalledWith(numericSaleId);
      expect(result.sale.id).toBe(numericSaleId);
    });

    it("should complete successfully without throwing when sale exists", async () => {
      // Arrange
      vi.mocked(mockSaleRepository.findById).mockResolvedValue(mockSale);

      // Act & Assert
      await expect(findSaleByIdService.execute(mockRequest)).resolves.not.toThrow();
      
      const result = await findSaleByIdService.execute(mockRequest);
      expect(result.sale).toEqual(mockSale);
    });
  });
});