// tests/unit/services/employee/fetch-all-employee.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FetchAllEmployeeService } from "../../../src/services/employee/fetch-all-employee";
import type { EmployeeRepository } from "../../../src/repositories/employee-repository";
import type { Employee } from "@prisma/client";

// Mock do repositório
const mockEmployeeRepository: EmployeeRepository = {
  findMany: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  update: vi.fn(),
};

describe("FetchAllEmployeeService", () => {
  let fetchAllEmployeeService: FetchAllEmployeeService;

  beforeEach(() => {
    fetchAllEmployeeService = new FetchAllEmployeeService(
      mockEmployeeRepository
    );
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should return all employees successfully", async () => {
      // Arrange
      const mockEmployees: Employee[] = [
        {
          id: "employee-1",
          user_id: "user-1",
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01'),
        },
        {
          id: "employee-2", 
          user_id: "user-2",
          created_at: new Date('2023-01-02'),
          updated_at: new Date('2023-01-02'),
        },
      ];

      vi.mocked(mockEmployeeRepository.findMany).mockResolvedValue(mockEmployees);

      // Act
      const result = await fetchAllEmployeeService.execute();

      // Assert
      expect(mockEmployeeRepository.findMany).toHaveBeenCalledOnce();
      expect(result.employee).toEqual(mockEmployees);
      expect(result.employee).toHaveLength(2);
    });

    it("should return empty array when no employees exist", async () => {
      // Arrange
      const mockEmployees: Employee[] = [];
      vi.mocked(mockEmployeeRepository.findMany).mockResolvedValue(mockEmployees);

      // Act
      const result = await fetchAllEmployeeService.execute();

      // Assert
      expect(mockEmployeeRepository.findMany).toHaveBeenCalledOnce();
      expect(result.employee).toEqual([]);
      expect(result.employee).toHaveLength(0);
    });

    it("should propagate errors from employee repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockEmployeeRepository.findMany).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(fetchAllEmployeeService.execute())
        .rejects
        .toThrow("Database connection error");
      
      expect(mockEmployeeRepository.findMany).toHaveBeenCalledOnce();
    });

    it("should return employees with correct structure", async () => {
      // Arrange
      const mockEmployees: Employee[] = [
        {
          id: "employee-123",
          user_id: "user-123", 
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: new Date('2023-01-01T00:00:00Z'),
        },
      ];

      vi.mocked(mockEmployeeRepository.findMany).mockResolvedValue(mockEmployees);

      // Act
      const result = await fetchAllEmployeeService.execute();

      // Assert
      expect(result.employee[0]).toHaveProperty('id');
      expect(result.employee[0]).toHaveProperty('user_id');
      expect(result.employee[0]).toHaveProperty('created_at');
      expect(result.employee[0]).toHaveProperty('updated_at');
      expect(result.employee[0].id).toBe("employee-123");
      expect(result.employee[0].user_id).toBe("user-123");
    });
  });
});