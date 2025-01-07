import { describe, it, expect, beforeEach, vi } from "vitest";
import { FindEmployeeByIdService } from "./find-employee-by-id";
import { EmployeeRepository } from "../../repositories/employee-repository";

describe("FindEmployeeByIdService", () => {
  let findEmployeeByIdService: FindEmployeeByIdService;
  let mockEmployeeRepository: { findById: vi.Mock };

  beforeEach(() => {
    mockEmployeeRepository = {
      findById: vi.fn(),
    };

    findEmployeeByIdService = new FindEmployeeByIdService(
      mockEmployeeRepository as unknown as EmployeeRepository
    );
  });

  it("deve retornar um funcionário pelo ID", async () => {
    const employeeMock = {
      id: "employee-1",
      userId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockEmployeeRepository.findById.mockResolvedValueOnce(employeeMock);

    const response = await findEmployeeByIdService.execute({ id: "employee-1" });

    expect(mockEmployeeRepository.findById).toHaveBeenCalledTimes(1);
    expect(mockEmployeeRepository.findById).toHaveBeenCalledWith("employee-1");
    expect(response).toEqual({ employee: employeeMock });
  });

  it("deve retornar null se o funcionário não for encontrado", async () => {
    mockEmployeeRepository.findById.mockResolvedValueOnce(null);

    const response = await findEmployeeByIdService.execute({ id: "employee-2" });

    expect(mockEmployeeRepository.findById).toHaveBeenCalledTimes(1);
    expect(mockEmployeeRepository.findById).toHaveBeenCalledWith("employee-2");
    expect(response).toEqual({ employee: null });
  });
});
