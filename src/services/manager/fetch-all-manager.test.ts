// tests/unit/services/manager/fetch-all-manager.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FetchAllManagerService } from "../../../src/services/manager/fetch-all-manager";
import type { ManagerRepository } from "../../../src/repositories/manager-repository";
import type { Manager } from "@prisma/client";

describe("FetchAllManagerService", () => {
  let fetchAllManagerService: FetchAllManagerService;
  let mockManagerRepository: ManagerRepository;

  beforeEach(() => {
    mockManagerRepository = {
      findMany: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      update: vi.fn(),
    };

    fetchAllManagerService = new FetchAllManagerService(mockManagerRepository);
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should return all managers successfully", async () => {
      // Arrange
      const mockManagers: Manager[] = [
        {
          id: "manager-1",
          user_id: "user-1",
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
        {
          id: "manager-2",
          user_id: "user-2",
          created_at: new Date('2023-01-02'),
          updated_at: new Date('2023-01-02'),
        },
      ];

      vi.mocked(mockManagerRepository.findMany).mockResolvedValue(mockManagers);

      // Act
      const result = await fetchAllManagerService.execute();

      // Assert
      expect(mockManagerRepository.findMany).toHaveBeenCalledOnce();
      expect(result.managers).toEqual(mockManagers);
      expect(result.managers).toHaveLength(2);
    });

    it("should return empty array when no managers exist", async () => {
      // Arrange
      const mockManagers: Manager[] = [];
      vi.mocked(mockManagerRepository.findMany).mockResolvedValue(mockManagers);

      // Act
      const result = await fetchAllManagerService.execute();

      // Assert
      expect(mockManagerRepository.findMany).toHaveBeenCalledOnce();
      expect(result.managers).toEqual([]);
      expect(result.managers).toHaveLength(0);
    });

    it("should propagate errors from manager repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockManagerRepository.findMany).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(fetchAllManagerService.execute())
        .rejects
        .toThrow("Database connection error");
      
      expect(mockManagerRepository.findMany).toHaveBeenCalledOnce();
    });

    it("should return managers with correct structure", async () => {
      // Arrange
      const mockManagers: Manager[] = [
        {
          id: "manager-123",
          user_id: "user-123",
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: new Date('2023-01-01T00:00:00Z'),
        },
      ];

      vi.mocked(mockManagerRepository.findMany).mockResolvedValue(mockManagers);

      // Act
      const result = await fetchAllManagerService.execute();

      // Assert
      expect(result.managers[0]).toHaveProperty('id');
      expect(result.managers[0]).toHaveProperty('user_id');
      expect(result.managers[0]).toHaveProperty('created_at');
      expect(result.managers[0]).toHaveProperty('updated_at');
      expect(result.managers[0].id).toBe("manager-123");
      expect(result.managers[0].user_id).toBe("user-123");
    });

    it("should call repository method only once", async () => {
      // Arrange
      const mockManagers: Manager[] = [
        {
          id: "manager-1",
          user_id: "user-1",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      vi.mocked(mockManagerRepository.findMany).mockResolvedValue(mockManagers);

      // Act
      await fetchAllManagerService.execute();

      // Assert
      expect(mockManagerRepository.findMany).toHaveBeenCalledOnce();
      expect(mockManagerRepository.findMany).not.toHaveBeenCalledTimes(2);
    });

    it("should return the same managers array as repository", async () => {
      // Arrange
      const mockManagers: Manager[] = [
        {
          id: "manager-1",
          user_id: "user-1",
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
        {
          id: "manager-2",
          user_id: "user-2",
          created_at: new Date('2023-01-02'),
          updated_at: new Date('2023-01-02'),
        },
        {
          id: "manager-3",
          user_id: "user-3",
          created_at: new Date('2023-01-03'),
          updated_at: new Date('2023-01-03'),
        },
      ];

      vi.mocked(mockManagerRepository.findMany).mockResolvedValue(mockManagers);

      // Act
      const result = await fetchAllManagerService.execute();

      // Assert
      expect(result.managers).toBe(mockManagers); // Mesma referência
      expect(result.managers).toEqual(mockManagers); // Mesmo conteúdo
    });
  });
});