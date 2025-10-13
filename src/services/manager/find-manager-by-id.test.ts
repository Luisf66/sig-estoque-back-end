// tests/unit/services/manager/find-manager-by-id.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindManagerByIdService } from "../../../src/services/manager/find-manager-by-id";
import type { ManagerRepository } from "../../../src/repositories/manager-repository";
import { NoRecordsFoundError } from "../../../src/services/errors/no-records-found-error";
import type { Manager } from "@prisma/client";

describe("FindManagerByIdService", () => {
  let findManagerByIdService: FindManagerByIdService;
  let mockManagerRepository: ManagerRepository;

  beforeEach(() => {
    mockManagerRepository = {
      findById: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      findByUserId: vi.fn(),
      update: vi.fn(),
    };

    findManagerByIdService = new FindManagerByIdService(mockManagerRepository);
    vi.clearAllMocks();
  });

  describe("execute", () => {
    const mockRequest = {
      id: "manager-123",
    };

    const mockManager: Manager = {
      id: "manager-123",
      user_id: "user-123",
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01'),
    };

    it("should return manager when found by ID", async () => {
      // Arrange
      vi.mocked(mockManagerRepository.findById).mockResolvedValue(mockManager);

      // Act
      const result = await findManagerByIdService.execute(mockRequest);

      // Assert
      expect(mockManagerRepository.findById).toHaveBeenCalledWith(mockRequest.id);
      expect(mockManagerRepository.findById).toHaveBeenCalledOnce();
      expect(result.manager).toEqual(mockManager);
    });

    it("should throw NoRecordsFoundError when manager not found", async () => {
      // Arrange
      vi.mocked(mockManagerRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(findManagerByIdService.execute(mockRequest))
        .rejects
        .toThrow(NoRecordsFoundError);

      expect(mockManagerRepository.findById).toHaveBeenCalledWith(mockRequest.id);
    });

    it("should propagate errors from manager repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockManagerRepository.findById).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(findManagerByIdService.execute(mockRequest))
        .rejects
        .toThrow("Database connection error");
      
      expect(mockManagerRepository.findById).toHaveBeenCalledWith(mockRequest.id);
    });

    it("should search for manager with correct ID", async () => {
      // Arrange
      vi.mocked(mockManagerRepository.findById).mockResolvedValue(mockManager);
      const differentIdRequest = {
        id: "different-manager-id",
      };

      // Act
      await findManagerByIdService.execute(differentIdRequest);

      // Assert
      expect(mockManagerRepository.findById).toHaveBeenCalledWith("different-manager-id");
      expect(mockManagerRepository.findById).not.toHaveBeenCalledWith(mockRequest.id);
    });

    it("should return manager with correct properties", async () => {
      // Arrange
      vi.mocked(mockManagerRepository.findById).mockResolvedValue(mockManager);

      // Act
      const result = await findManagerByIdService.execute(mockRequest);

      // Assert
      expect(result.manager).toHaveProperty('id', 'manager-123');
      expect(result.manager).toHaveProperty('user_id', 'user-123');
      expect(result.manager).toHaveProperty('created_at');
      expect(result.manager).toHaveProperty('updated_at');
    });

    it("should handle different manager IDs correctly", async () => {
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
      vi.mocked(mockManagerRepository.findById)
        .mockResolvedValueOnce(manager1)
        .mockResolvedValueOnce(manager2);

      // Act
      const result1 = await findManagerByIdService.execute({ id: "manager-1" });
      const result2 = await findManagerByIdService.execute({ id: "manager-2" });

      // Assert
      expect(mockManagerRepository.findById).toHaveBeenNthCalledWith(1, "manager-1");
      expect(mockManagerRepository.findById).toHaveBeenNthCalledWith(2, "manager-2");
      expect(result1.manager).toEqual(manager1);
      expect(result2.manager).toEqual(manager2);
    });

    it("should throw NoRecordsFoundError for empty ID", async () => {
      // Arrange
      vi.mocked(mockManagerRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(findManagerByIdService.execute({ id: "" }))
        .rejects
        .toThrow(NoRecordsFoundError);

      expect(mockManagerRepository.findById).toHaveBeenCalledWith("");
    });

    it("should throw NoRecordsFoundError for non-existent ID", async () => {
      // Arrange
      vi.mocked(mockManagerRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(findManagerByIdService.execute({ id: "non-existent-id" }))
        .rejects
        .toThrow(NoRecordsFoundError);

      expect(mockManagerRepository.findById).toHaveBeenCalledWith("non-existent-id");
    });
  });
});