import { describe, it, expect, beforeEach, vi } from "vitest";
import { FetchAllEmployeeService } from "./fetch-all-employee";
import { EmployeeRepository } from "../../repositories/employee-repository";

describe("FetchAllEmployeeService", () => {
  let fetchAllEmployeeService: FetchAllEmployeeService;
  let mockEmployeeRepository: { findMany: vi.Mock };

  beforeEach(() => {
    mockEmployeeRepository = {
      findMany: vi.fn(),
    };

    fetchAllEmployeeService = new FetchAllEmployeeService(
      mockEmployeeRepository as unknown as EmployeeRepository
    );
  });

  it("deve retornar todos os funcionários", async () => {
    const employeesMock = [
      {
        id: "employee-1",
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "employee-2",
        userId: "user-2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockEmployeeRepository.findMany.mockResolvedValueOnce(employeesMock);

    const response = await fetchAllEmployeeService.execute();

    expect(mockEmployeeRepository.findMany).toHaveBeenCalledTimes(1);
    expect(response).toEqual({ employee: employeesMock });
  });

  it("deve retornar uma lista vazia se não houver funcionários", async () => {
    mockEmployeeRepository.findMany.mockResolvedValueOnce([]);

    const response = await fetchAllEmployeeService.execute();

    expect(mockEmployeeRepository.findMany).toHaveBeenCalledTimes(1);
    expect(response).toEqual({ employee: [] });
  });
});
