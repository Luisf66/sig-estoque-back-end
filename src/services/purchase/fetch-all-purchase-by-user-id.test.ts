// tests/unit/services/purchase/fetch-all-purchase-by-user-id.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FetchAllPurchaseByUserIdService } from "../../../src/services/purchase/fetch-all-purchase-by-user-id";
import type { PurchaseRepository } from "../../../src/repositories/purchase-repository";
import type { UserRepository } from "../../../src/repositories/user-repository";
import { ResourceNotFoundError } from "../../../src/services/errors/resource-not-found-error";
import type { Purchase, User, ROLE } from "@prisma/client";

describe("FetchAllPurchaseByUserIdService", () => {
  let fetchAllPurchaseByUserIdService: FetchAllPurchaseByUserIdService;
  let mockPurchaseRepository: PurchaseRepository;
  let mockUserRepository: UserRepository;

  beforeEach(() => {
    mockPurchaseRepository = {
      findManyByUserId: vi.fn(),
      findManyBySupplierId: vi.fn(),
      create: vi.fn(),
      updateSubTotal: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
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

    fetchAllPurchaseByUserIdService = new FetchAllPurchaseByUserIdService(
      mockPurchaseRepository,
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

    const mockPurchases: Purchase[] = [
      {
        id: "purchase-1",
        nf_number: "NF-001",
        supplier_id: "supplier-123",
        user_id: "user-123",
        sub_total: 1000.50,
        created_at: new Date('2023-01-15'),
        updated_at: new Date('2023-01-15'),
      },
      {
        id: "purchase-2",
        nf_number: "NF-002",
        supplier_id: "supplier-456",
        user_id: "user-123",
        sub_total: 2500.75,
        created_at: new Date('2023-02-20'),
        updated_at: new Date('2023-02-20'),
      },
    ];

    it("should return purchases for user successfully", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockPurchaseRepository.findManyByUserId).mockResolvedValue(mockPurchases);

      // Act
      const result = await fetchAllPurchaseByUserIdService.execute(mockRequest);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockPurchaseRepository.findManyByUserId).toHaveBeenCalledWith(mockRequest.userId);
      expect(result.purchases).toEqual(mockPurchases);
      expect(result.purchases).toHaveLength(2);
    });

    it("should throw ResourceNotFoundError when user not found", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(fetchAllPurchaseByUserIdService.execute(mockRequest))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockPurchaseRepository.findManyByUserId).not.toHaveBeenCalled();
    });

    it("should return empty array when no purchases found for user", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockPurchaseRepository.findManyByUserId).mockResolvedValue([]);

      // Act
      const result = await fetchAllPurchaseByUserIdService.execute(mockRequest);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockPurchaseRepository.findManyByUserId).toHaveBeenCalledWith(mockRequest.userId);
      expect(result.purchases).toEqual([]);
      expect(result.purchases).toHaveLength(0);
    });

    it("should propagate errors from user repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockUserRepository.findById).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(fetchAllPurchaseByUserIdService.execute(mockRequest))
        .rejects
        .toThrow("Database connection error");

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockPurchaseRepository.findManyByUserId).not.toHaveBeenCalled();
    });

    it("should propagate errors from purchase repository", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      const repositoryError = new Error("Purchase search failed");
      vi.mocked(mockPurchaseRepository.findManyByUserId).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(fetchAllPurchaseByUserIdService.execute(mockRequest))
        .rejects
        .toThrow("Purchase search failed");

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockPurchaseRepository.findManyByUserId).toHaveBeenCalledWith(mockRequest.userId);
    });

    it("should search for purchases with correct user ID", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockPurchaseRepository.findManyByUserId).mockResolvedValue(mockPurchases);
      
      const differentUserRequest = {
        userId: "different-user",
      };

      // Act
      await fetchAllPurchaseByUserIdService.execute(differentUserRequest);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith("different-user");
      expect(mockPurchaseRepository.findManyByUserId).toHaveBeenCalledWith("different-user");
      expect(mockUserRepository.findById).not.toHaveBeenCalledWith(mockRequest.userId);
      expect(mockPurchaseRepository.findManyByUserId).not.toHaveBeenCalledWith(mockRequest.userId);
    });

    it("should return purchases with correct structure", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockPurchaseRepository.findManyByUserId).mockResolvedValue(mockPurchases);

      // Act
      const result = await fetchAllPurchaseByUserIdService.execute(mockRequest);

      // Assert
      expect(result.purchases[0]).toHaveProperty('id');
      expect(result.purchases[0]).toHaveProperty('nf_number');
      expect(result.purchases[0]).toHaveProperty('supplier_id');
      expect(result.purchases[0]).toHaveProperty('user_id');
      expect(result.purchases[0]).toHaveProperty('sub_total');
      expect(result.purchases[0]).toHaveProperty('created_at');
      expect(result.purchases[0]).toHaveProperty('updated_at');
      
      expect(result.purchases[0].user_id).toBe("user-123");
      expect(result.purchases[1].user_id).toBe("user-123");
    });

    it("should handle user with multiple purchases", async () => {
      // Arrange
      const multiplePurchases: Purchase[] = [
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
          user_id: "user-123",
          sub_total: 200.00,
          created_at: new Date('2023-01-02'),
          updated_at: new Date('2023-01-02'),
        },
        {
          id: "purchase-3",
          nf_number: "NF-003",
          supplier_id: "supplier-789",
          user_id: "user-123",
          sub_total: 300.00,
          created_at: new Date('2023-01-03'),
          updated_at: new Date('2023-01-03'),
        },
      ];

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockPurchaseRepository.findManyByUserId).mockResolvedValue(multiplePurchases);

      // Act
      const result = await fetchAllPurchaseByUserIdService.execute(mockRequest);

      // Assert
      expect(result.purchases).toHaveLength(3);
      expect(result.purchases[0].nf_number).toBe("NF-001");
      expect(result.purchases[1].nf_number).toBe("NF-002");
      expect(result.purchases[2].nf_number).toBe("NF-003");
    });

    it("should handle user with different roles", async () => {
      // Arrange
      const managerUser: User = {
        ...mockUser,
        role: "MANAGER" as ROLE,
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(managerUser);
      vi.mocked(mockPurchaseRepository.findManyByUserId).mockResolvedValue(mockPurchases);

      // Act
      const result = await fetchAllPurchaseByUserIdService.execute(mockRequest);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockPurchaseRepository.findManyByUserId).toHaveBeenCalledWith(mockRequest.userId);
      expect(result.purchases).toEqual(mockPurchases);
    });

    it("should throw ResourceNotFoundError for empty user ID", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(fetchAllPurchaseByUserIdService.execute({ userId: "" }))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockUserRepository.findById).toHaveBeenCalledWith("");
      expect(mockPurchaseRepository.findManyByUserId).not.toHaveBeenCalled();
    });

    it("should throw ResourceNotFoundError for non-existent user ID", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(fetchAllPurchaseByUserIdService.execute({ userId: "non-existent-user" }))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockUserRepository.findById).toHaveBeenCalledWith("non-existent-user");
      expect(mockPurchaseRepository.findManyByUserId).not.toHaveBeenCalled();
    });

    it("should call repositories in correct order", async () => {
      // Arrange
      let callOrder: string[] = [];
      
      vi.mocked(mockUserRepository.findById).mockImplementation(async () => {
        callOrder.push('findUser');
        return mockUser;
      });
      
      vi.mocked(mockPurchaseRepository.findManyByUserId).mockImplementation(async () => {
        callOrder.push('findPurchases');
        return mockPurchases;
      });

      // Act
      await fetchAllPurchaseByUserIdService.execute(mockRequest);

      // Assert
      // Verifica que primeiro busca o user e depois as compras
      expect(callOrder).toEqual(['findUser', 'findPurchases']);
    });

    it("should return the same purchases array as repository", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockPurchaseRepository.findManyByUserId).mockResolvedValue(mockPurchases);

      // Act
      const result = await fetchAllPurchaseByUserIdService.execute(mockRequest);

      // Assert
      expect(result.purchases).toBe(mockPurchases); // Mesma referência
      expect(result.purchases).toEqual(mockPurchases); // Mesmo conteúdo
    });

    it("should not call purchase repository when user is not found", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(fetchAllPurchaseByUserIdService.execute(mockRequest))
        .rejects
        .toThrow(ResourceNotFoundError);

      // Verifica que findById foi chamado mas findManyByUserId não
      expect(mockUserRepository.findById).toHaveBeenCalled();
      expect(mockPurchaseRepository.findManyByUserId).not.toHaveBeenCalled();
    });

    it("should handle purchases from different suppliers for same user", async () => {
      // Arrange
      const purchasesFromDifferentSuppliers: Purchase[] = [
        {
          id: "purchase-1",
          nf_number: "NF-001",
          supplier_id: "supplier-123",
          user_id: "user-123",
          sub_total: 150.00,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
        {
          id: "purchase-2",
          nf_number: "NF-002",
          supplier_id: "supplier-456",
          user_id: "user-123",
          sub_total: 275.50,
          created_at: new Date('2023-01-02'),
          updated_at: new Date('2023-01-02'),
        },
        {
          id: "purchase-3",
          nf_number: "NF-003",
          supplier_id: "supplier-789",
          user_id: "user-123",
          sub_total: 420.25,
          created_at: new Date('2023-01-03'),
          updated_at: new Date('2023-01-03'),
        },
      ];

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockPurchaseRepository.findManyByUserId).mockResolvedValue(purchasesFromDifferentSuppliers);

      // Act
      const result = await fetchAllPurchaseByUserIdService.execute(mockRequest);

      // Assert
      expect(result.purchases).toHaveLength(3);
      expect(result.purchases[0].supplier_id).toBe("supplier-123");
      expect(result.purchases[1].supplier_id).toBe("supplier-456");
      expect(result.purchases[2].supplier_id).toBe("supplier-789");
      // Todos devem ter o mesmo user_id
      expect(result.purchases.every(purchase => purchase.user_id === "user-123")).toBe(true);
    });
  });
});