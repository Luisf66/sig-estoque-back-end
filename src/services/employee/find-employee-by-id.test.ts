// tests/unit/services/employee/find-employee-by-id.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindEmployeeByIdService } from "../../../src/services/employee/find-employee-by-id";
import type { EmployeeRepository } from "../../../src/repositories/employee-repository";
import type { Employee } from "@prisma/client";
import { ResourceNotFoundError } from "../../../src/services/errors/resource-not-found-error";

// Mock do repositório
const mockEmployeeRepository: EmployeeRepository = {
  findById: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  findByUserId: vi.fn(),
  update: vi.fn(),
};

describe("FindEmployeeByIdService", () => {
  let findEmployeeByIdService: FindEmployeeByIdService;

  beforeEach(() => {
    findEmployeeByIdService = new FindEmployeeByIdService(
      mockEmployeeRepository
    );
    vi.clearAllMocks();
  });

  describe("execute", () => {
    const mockRequest = {
      id: "employee-123",
    };

    const mockEmployee: Employee = {
      id: "employee-123",
      user_id: "user-123",
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01'),
    };

    it("should return employee when found", async () => {
      // Arrange
      vi.mocked(mockEmployeeRepository.findById).mockResolvedValue(mockEmployee);

      // Act
      const result = await findEmployeeByIdService.execute(mockRequest);

      // Assert
      expect(mockEmployeeRepository.findById).toHaveBeenCalledWith(mockRequest.id);
      expect(mockEmployeeRepository.findById).toHaveBeenCalledOnce();
      expect(result.employee).toEqual(mockEmployee);
    });

    it("should return null when employee not found", async () => {
      // Arrange
      vi.mocked(mockEmployeeRepository.findById).mockResolvedValue(null);

      // Act
      const result = await findEmployeeByIdService.execute(mockRequest);

      // Assert
      expect(mockEmployeeRepository.findById).toHaveBeenCalledWith(mockRequest.id);
      expect(result.employee).toBeNull();
    });

    it("should propagate errors from employee repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockEmployeeRepository.findById).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(findEmployeeByIdService.execute(mockRequest))
        .rejects
        .toThrow("Database connection error");
      
      expect(mockEmployeeRepository.findById).toHaveBeenCalledWith(mockRequest.id);
    });

    it("should search for employee with correct ID", async () => {
      // Arrange
      vi.mocked(mockEmployeeRepository.findById).mockResolvedValue(mockEmployee);
      const differentIdRequest = {
        id: "different-employee-id",
      };

      // Act
      await findEmployeeByIdService.execute(differentIdRequest);

      // Assert
      expect(mockEmployeeRepository.findById).toHaveBeenCalledWith("different-employee-id");
      expect(mockEmployeeRepository.findById).not.toHaveBeenCalledWith(mockRequest.id);
    });

    it("should return employee with correct properties", async () => {
      // Arrange
      vi.mocked(mockEmployeeRepository.findById).mockResolvedValue(mockEmployee);

      // Act
      const result = await findEmployeeByIdService.execute(mockRequest);

      // Assert
      expect(result.employee).toHaveProperty('id', 'employee-123');
      expect(result.employee).toHaveProperty('user_id', 'user-123');
      expect(result.employee).toHaveProperty('created_at');
      expect(result.employee).toHaveProperty('updated_at');
    });
  });
});