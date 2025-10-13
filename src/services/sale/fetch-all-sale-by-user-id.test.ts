// tests/unit/services/sale/fetch-all-sale-by-user-id.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FetchAllSaleByUserIdService } from "../../../src/services/sale/fetch-all-sale-by-user-id";
import type { SaleRepository } from "../../../src/repositories/sale-repository";
import type { UserRepository } from "../../../src/repositories/user-repository";
import { ResourceNotFoundError } from "../../../src/services/errors/resource-not-found-error";
import type { Sale, User, ROLE } from "@prisma/client";

describe("FetchAllSaleByUserIdService", () => {
  let fetchAllSaleByUserIdService: FetchAllSaleByUserIdService;
  let mockSaleRepository: SaleRepository;
  let mockUserRepository: UserRepository;

  beforeEach(() => {
    mockSaleRepository = {
      findManyByUserId: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      updateSubTotal: vi.fn(),
      findById: vi.fn(),
      // Adicione outros métodos se necessário
    };

    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
      // Adicione outros métodos se necessário
    };

    fetchAllSaleByUserIdService = new FetchAllSaleByUserIdService(
      mockSaleRepository,
      mockUserRepository
    );

    vi.clearAllMocks();
  });

  describe("execute", () => {
    const mockRequest = {
      userId: "user-123",
    };

    const mockUser: User = {
      id: "user-123",
      name: "John Doe",
      email: "john.doe@example.com",
      password_hash: "hashed_password",
      role: "EMPLOYEE" as ROLE,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01'),
    };

    const mockSales: Sale[] = [
      {
        id: "sale-1",
        nf_number: "NF-001",
        user_id: "user-123",
        sub_total: 1000.50,
        created_at: new Date('2023-01-15'),
        updated_at: new Date('2023-01-15'),
      },
      {
        id: "sale-2",
        nf_number: "NF-002",
        user_id: "user-123",
        sub_total: 2500.75,
        created_at: new Date('2023-02-20'),
        updated_at: new Date('2023-02-20'),
      },
    ];

    it("should return sales for user successfully", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockSaleRepository.findManyByUserId).mockResolvedValue(mockSales);

      // Act
      const result = await fetchAllSaleByUserIdService.execute(mockRequest);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockSaleRepository.findManyByUserId).toHaveBeenCalledWith(mockRequest.userId);
      expect(result.sales).toEqual(mockSales);
      expect(result.sales).toHaveLength(2);
    });

    it("should throw ResourceNotFoundError when user not found", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(fetchAllSaleByUserIdService.execute(mockRequest))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockSaleRepository.findManyByUserId).not.toHaveBeenCalled();
    });

    it("should return empty array when no sales found for user", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockSaleRepository.findManyByUserId).mockResolvedValue([]);

      // Act
      const result = await fetchAllSaleByUserIdService.execute(mockRequest);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockSaleRepository.findManyByUserId).toHaveBeenCalledWith(mockRequest.userId);
      expect(result.sales).toEqual([]);
      expect(result.sales).toHaveLength(0);
    });

    it("should propagate errors from user repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockUserRepository.findById).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(fetchAllSaleByUserIdService.execute(mockRequest))
        .rejects
        .toThrow("Database connection error");

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockSaleRepository.findManyByUserId).not.toHaveBeenCalled();
    });

    it("should propagate errors from sale repository", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      const repositoryError = new Error("Sale search failed");
      vi.mocked(mockSaleRepository.findManyByUserId).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(fetchAllSaleByUserIdService.execute(mockRequest))
        .rejects
        .toThrow("Sale search failed");

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockSaleRepository.findManyByUserId).toHaveBeenCalledWith(mockRequest.userId);
    });

    it("should search for sales with correct user ID", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockSaleRepository.findManyByUserId).mockResolvedValue(mockSales);
      
      const differentUserRequest = {
        userId: "different-user",
      };

      // Act
      await fetchAllSaleByUserIdService.execute(differentUserRequest);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith("different-user");
      expect(mockSaleRepository.findManyByUserId).toHaveBeenCalledWith("different-user");
      expect(mockUserRepository.findById).not.toHaveBeenCalledWith(mockRequest.userId);
      expect(mockSaleRepository.findManyByUserId).not.toHaveBeenCalledWith(mockRequest.userId);
    });

    it("should return sales with correct structure", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockSaleRepository.findManyByUserId).mockResolvedValue(mockSales);

      // Act
      const result = await fetchAllSaleByUserIdService.execute(mockRequest);

      // Assert
      expect(result.sales[0]).toHaveProperty('id');
      expect(result.sales[0]).toHaveProperty('nf_number');
      expect(result.sales[0]).toHaveProperty('user_id');
      expect(result.sales[0]).toHaveProperty('sub_total');
      expect(result.sales[0]).toHaveProperty('created_at');
      expect(result.sales[0]).toHaveProperty('updated_at');
      
      expect(result.sales[0].user_id).toBe("user-123");
      expect(result.sales[1].user_id).toBe("user-123");
    });

    it("should handle user with multiple sales", async () => {
      // Arrange
      const multipleSales: Sale[] = [
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
          user_id: "user-123",
          sub_total: 200.00,
          created_at: new Date('2023-01-02'),
          updated_at: new Date('2023-01-02'),
        },
        {
          id: "sale-3",
          nf_number: "NF-003",
          user_id: "user-123",
          sub_total: 300.00,
          created_at: new Date('2023-01-03'),
          updated_at: new Date('2023-01-03'),
        },
      ];

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockSaleRepository.findManyByUserId).mockResolvedValue(multipleSales);

      // Act
      const result = await fetchAllSaleByUserIdService.execute(mockRequest);

      // Assert
      expect(result.sales).toHaveLength(3);
      expect(result.sales[0].nf_number).toBe("NF-001");
      expect(result.sales[1].nf_number).toBe("NF-002");
      expect(result.sales[2].nf_number).toBe("NF-003");
    });

    it("should handle user with different roles", async () => {
      // Arrange
      const managerUser: User = {
        ...mockUser,
        role: "MANAGER" as ROLE,
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(managerUser);
      vi.mocked(mockSaleRepository.findManyByUserId).mockResolvedValue(mockSales);

      // Act
      const result = await fetchAllSaleByUserIdService.execute(mockRequest);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockSaleRepository.findManyByUserId).toHaveBeenCalledWith(mockRequest.userId);
      expect(result.sales).toEqual(mockSales);
    });

    it("should throw ResourceNotFoundError for empty user ID", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(fetchAllSaleByUserIdService.execute({ userId: "" }))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockUserRepository.findById).toHaveBeenCalledWith("");
      expect(mockSaleRepository.findManyByUserId).not.toHaveBeenCalled();
    });

    it("should throw ResourceNotFoundError for non-existent user ID", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(fetchAllSaleByUserIdService.execute({ userId: "non-existent-user" }))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockUserRepository.findById).toHaveBeenCalledWith("non-existent-user");
      expect(mockSaleRepository.findManyByUserId).not.toHaveBeenCalled();
    });

    it("should call repositories in correct order", async () => {
      // Arrange
      let callOrder: string[] = [];
      
      vi.mocked(mockUserRepository.findById).mockImplementation(async () => {
        callOrder.push('findUser');
        return mockUser;
      });
      
      vi.mocked(mockSaleRepository.findManyByUserId).mockImplementation(async () => {
        callOrder.push('findSales');
        return mockSales;
      });

      // Act
      await fetchAllSaleByUserIdService.execute(mockRequest);

      // Assert
      // Verifica que primeiro busca o user e depois as vendas
      expect(callOrder).toEqual(['findUser', 'findSales']);
    });

    it("should return the same sales array as repository", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockSaleRepository.findManyByUserId).mockResolvedValue(mockSales);

      // Act
      const result = await fetchAllSaleByUserIdService.execute(mockRequest);

      // Assert
      expect(result.sales).toBe(mockSales); // Mesma referência
      expect(result.sales).toEqual(mockSales); // Mesmo conteúdo
    });

    it("should not call sale repository when user is not found", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(fetchAllSaleByUserIdService.execute(mockRequest))
        .rejects
        .toThrow(ResourceNotFoundError);

      // Verifica que findById foi chamado mas findManyByUserId não
      expect(mockUserRepository.findById).toHaveBeenCalled();
      expect(mockSaleRepository.findManyByUserId).not.toHaveBeenCalled();
    });

    it("should handle sales with different subtotals", async () => {
      // Arrange
      const salesWithDifferentSubtotals: Sale[] = [
        {
          id: "sale-1",
          nf_number: "NF-001",
          user_id: "user-123",
          sub_total: 150.00,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
        {
          id: "sale-2",
          nf_number: "NF-002",
          user_id: "user-123",
          sub_total: 275.50,
          created_at: new Date('2023-01-02'),
          updated_at: new Date('2023-01-02'),
        },
        {
          id: "sale-3",
          nf_number: "NF-003",
          user_id: "user-123",
          sub_total: 420.25,
          created_at: new Date('2023-01-03'),
          updated_at: new Date('2023-01-03'),
        },
      ];

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockSaleRepository.findManyByUserId).mockResolvedValue(salesWithDifferentSubtotals);

      // Act
      const result = await fetchAllSaleByUserIdService.execute(mockRequest);

      // Assert
      expect(result.sales).toHaveLength(3);
      expect(result.sales[0].sub_total).toBe(150.00);
      expect(result.sales[1].sub_total).toBe(275.50);
      expect(result.sales[2].sub_total).toBe(420.25);
      // Todos devem ter o mesmo user_id
      expect(result.sales.every(sale => sale.user_id === "user-123")).toBe(true);
    });

    it("should handle sales with zero subtotal", async () => {
      // Arrange
      const salesWithZeroSubtotal: Sale[] = [
        {
          id: "sale-1",
          nf_number: "NF-001",
          user_id: "user-123",
          sub_total: 0,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
      ];

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockSaleRepository.findManyByUserId).mockResolvedValue(salesWithZeroSubtotal);

      // Act
      const result = await fetchAllSaleByUserIdService.execute(mockRequest);

      // Assert
      expect(result.sales[0].sub_total).toBe(0);
    });

    it("should handle sales with decimal subtotal", async () => {
      // Arrange
      const salesWithDecimalSubtotal: Sale[] = [
        {
          id: "sale-1",
          nf_number: "NF-001",
          user_id: "user-123",
          sub_total: 123.45,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
      ];

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockSaleRepository.findManyByUserId).mockResolvedValue(salesWithDecimalSubtotal);

      // Act
      const result = await fetchAllSaleByUserIdService.execute(mockRequest);

      // Assert
      expect(result.sales[0].sub_total).toBe(123.45);
    });
  });
});