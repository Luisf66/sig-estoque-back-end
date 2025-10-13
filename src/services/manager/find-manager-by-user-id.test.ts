// tests/unit/services/manager/find-manager-by-user-id.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindManagerByUserId } from "../../../src/services/manager/find-manager-by-user-id";
import type { ManagerRepository } from "../../../src/repositories/manager-repository";
import type { Manager } from "@prisma/client";

describe("FindManagerByUserId", () => {
  let findManagerByUserId: FindManagerByUserId;
  let mockManagerRepository: ManagerRepository;

  beforeEach(() => {
    mockManagerRepository = {
      findByUserId: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    findManagerByUserId = new FindManagerByUserId(mockManagerRepository);
    vi.clearAllMocks();
  });

  describe("execute", () => {
    const mockRequest = {
      userId: "user-123",
    };

    const mockManager: Manager = {
      id: "manager-123",
      user_id: "user-123",
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01'),
    };

    it("should return manager when found by user ID", async () => {
      // Arrange
      vi.mocked(mockManagerRepository.findByUserId).mockResolvedValue(mockManager);

      // Act
      const result = await findManagerByUserId.execute(mockRequest);

      // Assert
      expect(mockManagerRepository.findByUserId).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockManagerRepository.findByUserId).toHaveBeenCalledOnce();
      expect(result.manager).toEqual(mockManager);
    });

    it("should return null when manager not found for user ID", async () => {
      // Arrange
      vi.mocked(mockManagerRepository.findByUserId).mockResolvedValue(null);

      // Act
      const result = await findManagerByUserId.execute(mockRequest);

      // Assert
      expect(mockManagerRepository.findByUserId).toHaveBeenCalledWith(mockRequest.userId);
      expect(result.manager).toBeNull();
    });

    it("should propagate errors from manager repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockManagerRepository.findByUserId).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(findManagerByUserId.execute(mockRequest))
        .rejects
        .toThrow("Database connection error");
      
      expect(mockManagerRepository.findByUserId).toHaveBeenCalledWith(mockRequest.userId);
    });

    it("should search for manager with correct user ID", async () => {
      // Arrange
      vi.mocked(mockManagerRepository.findByUserId).mockResolvedValue(mockManager);
      const differentUserIdRequest = {
        userId: "different-user-id",
      };

      // Act
      await findManagerByUserId.execute(differentUserIdRequest);

      // Assert
      expect(mockManagerRepository.findByUserId).toHaveBeenCalledWith("different-user-id");
      expect(mockManagerRepository.findByUserId).not.toHaveBeenCalledWith(mockRequest.userId);
    });

    it("should return manager with correct user ID relationship", async () => {
      // Arrange
      vi.mocked(mockManagerRepository.findByUserId).mockResolvedValue(mockManager);

      // Act
      const result = await findManagerByUserId.execute(mockRequest);

      // Assert
      expect(result.manager?.user_id).toBe(mockRequest.userId);
      expect(result.manager?.id).toBe("manager-123");
    });

    it("should handle different user IDs correctly", async () => {
      // Arrange
      const manager1: Manager = {
        id: "manager-1",
        user_id: "user-1",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const manager2: Manager = {
        id: "manager-2",
        user_id: "user-2",
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock para diferentes chamadas
      vi.mocked(mockManagerRepository.findByUserId)
        .mockResolvedValueOnce(manager1)
        .mockResolvedValueOnce(manager2);

      // Act
      const result1 = await findManagerByUserId.execute({ userId: "user-1" });
      const result2 = await findManagerByUserId.execute({ userId: "user-2" });

      // Assert
      expect(mockManagerRepository.findByUserId).toHaveBeenNthCalledWith(1, "user-1");
      expect(mockManagerRepository.findByUserId).toHaveBeenNthCalledWith(2, "user-2");
      expect(result1.manager).toEqual(manager1);
      expect(result2.manager).toEqual(manager2);
    });

    it("should handle case-sensitive user IDs", async () => {
      // Arrange
      vi.mocked(mockManagerRepository.findByUserId)
        .mockResolvedValueOnce(mockManager)
        .mockResolvedValueOnce(null);

      // Act
      const result1 = await findManagerByUserId.execute({ userId: "user-123" });
      const result2 = await findManagerByUserId.execute({ userId: "USER-123" });

      // Assert
      expect(result1.manager).not.toBeNull();
      expect(result2.manager).toBeNull(); // User IDs são case-sensitive
    });

    it("should return null for empty user ID", async () => {
      // Arrange
      vi.mocked(mockManagerRepository.findByUserId).mockResolvedValue(null);

      // Act
      const result = await findManagerByUserId.execute({ userId: "" });

      // Assert
      expect(result.manager).toBeNull();
      expect(mockManagerRepository.findByUserId).toHaveBeenCalledWith("");
    });

    it("should maintain one-to-one relationship between user and manager", async () => {
      // Arrange
      vi.mocked(mockManagerRepository.findByUserId).mockResolvedValue(mockManager);

      // Act
      const result = await findManagerByUserId.execute(mockRequest);

      // Assert
      expect(result.manager).not.toBeNull();
      expect(result.manager?.user_id).toBe(mockRequest.userId);
    });

    it("should return consistent results for same user ID", async () => {
      // Arrange
      vi.mocked(mockManagerRepository.findByUserId).mockResolvedValue(mockManager);

      // Act
      const result1 = await findManagerByUserId.execute(mockRequest);
      const result2 = await findManagerByUserId.execute(mockRequest);

      // Assert
      expect(result1.manager).toEqual(result2.manager);
      expect(mockManagerRepository.findByUserId).toHaveBeenCalledTimes(2);
      expect(mockManagerRepository.findByUserId).toHaveBeenNthCalledWith(1, mockRequest.userId);
      expect(mockManagerRepository.findByUserId).toHaveBeenNthCalledWith(2, mockRequest.userId);
    });
  });
});