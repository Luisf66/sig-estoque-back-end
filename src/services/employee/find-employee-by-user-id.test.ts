// tests/unit/services/employee/find-employee-by-user-id.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindEmployeeByUserId } from "../../../src/services/employee/find-employee-by-user-id";
import type { EmployeeRepository } from "../../../src/repositories/employee-repository";
import type { Employee } from "@prisma/client";

// Mock do repositório
const mockEmployeeRepository: EmployeeRepository = {
  findByUserId: vi.fn(),
  findById: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};

describe("FindEmployeeByUserId", () => {
  let findEmployeeByUserId: FindEmployeeByUserId;

  beforeEach(() => {
    findEmployeeByUserId = new FindEmployeeByUserId(mockEmployeeRepository);
    vi.clearAllMocks();
  });

  describe("execute", () => {
    const mockRequest = {
      userId: "user-123",
    };

    const mockEmployee: Employee = {
      id: "employee-123",
      user_id: "user-123",
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01'),
    };

    it("should return employee when found by user ID", async () => {
      // Arrange
      vi.mocked(mockEmployeeRepository.findByUserId).mockResolvedValue(mockEmployee);

      // Act
      const result = await findEmployeeByUserId.execute(mockRequest);

      // Assert
      expect(mockEmployeeRepository.findByUserId).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockEmployeeRepository.findByUserId).toHaveBeenCalledOnce();
      expect(result.employee).toEqual(mockEmployee);
    });

    it("should return null when employee not found for user ID", async () => {
      // Arrange
      vi.mocked(mockEmployeeRepository.findByUserId).mockResolvedValue(null);

      // Act
      const result = await findEmployeeByUserId.execute(mockRequest);

      // Assert
      expect(mockEmployeeRepository.findByUserId).toHaveBeenCalledWith(mockRequest.userId);
      expect(result.employee).toBeNull();
    });

    it("should propagate errors from employee repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockEmployeeRepository.findByUserId).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(findEmployeeByUserId.execute(mockRequest))
        .rejects
        .toThrow("Database connection error");
      
      expect(mockEmployeeRepository.findByUserId).toHaveBeenCalledWith(mockRequest.userId);
    });

    it("should search for employee with correct user ID", async () => {
      // Arrange
      vi.mocked(mockEmployeeRepository.findByUserId).mockResolvedValue(mockEmployee);
      const differentUserIdRequest = {
        userId: "different-user-id",
      };

      // Act
      await findEmployeeByUserId.execute(differentUserIdRequest);

      // Assert
      expect(mockEmployeeRepository.findByUserId).toHaveBeenCalledWith("different-user-id");
      expect(mockEmployeeRepository.findByUserId).not.toHaveBeenCalledWith(mockRequest.userId);
    });

    it("should return employee with correct user ID relationship", async () => {
      // Arrange
      vi.mocked(mockEmployeeRepository.findByUserId).mockResolvedValue(mockEmployee);

      // Act
      const result = await findEmployeeByUserId.execute(mockRequest);

      // Assert
      expect(result.employee?.user_id).toBe(mockRequest.userId);
      expect(result.employee?.id).toBe("employee-123");
    });

    it("should handle different user IDs correctly", async () => {
      // Arrange
      const employee1: Employee = {
        id: "employee-1",
        user_id: "user-1",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const employee2: Employee = {
        id: "employee-2",
        user_id: "user-2",
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock para diferentes chamadas
      vi.mocked(mockEmployeeRepository.findByUserId)
        .mockResolvedValueOnce(employee1)
        .mockResolvedValueOnce(employee2);

      // Act
      const result1 = await findEmployeeByUserId.execute({ userId: "user-1" });
      const result2 = await findEmployeeByUserId.execute({ userId: "user-2" });

      // Assert
      expect(mockEmployeeRepository.findByUserId).toHaveBeenNthCalledWith(1, "user-1");
      expect(mockEmployeeRepository.findByUserId).toHaveBeenNthCalledWith(2, "user-2");
      expect(result1.employee).toEqual(employee1);
      expect(result2.employee).toEqual(employee2);
    });
  });
});