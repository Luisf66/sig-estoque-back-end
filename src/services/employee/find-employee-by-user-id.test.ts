import { describe, it, expect, beforeEach, vi } from "vitest";
import { FindEmployeeByUserId } from "./find-employee-by-user-id";
import { EmployeeRepository } from "../../repositories/employee-repository";

describe("FindEmployeeByUserId", () => {
  let findEmployeeByUserIdService: FindEmployeeByUserId;
  let mockEmployeeRepository: { findByUserId: vi.Mock };

  beforeEach(() => {
    mockEmployeeRepository = {
      findByUserId: vi.fn(),
    };

    findEmployeeByUserIdService = new FindEmployeeByUserId(
      mockEmployeeRepository as unknown as EmployeeRepository
    );
  });

  it("deve retornar um funcionário pelo ID do usuário", async () => {
    const employeeMock = {
      id: "employee-1",
      userId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockEmployeeRepository.findByUserId.mockResolvedValueOnce(employeeMock);

    const response = await findEmployeeByUserIdService.execute({
      userId: "user-1",
    });

    expect(mockEmployeeRepository.findByUserId).toHaveBeenCalledTimes(1);
    expect(mockEmployeeRepository.findByUserId).toHaveBeenCalledWith("user-1");
    expect(response).toEqual({ employee: employeeMock });
  });

  it("deve retornar null se o funcionário não for encontrado pelo ID do usuário", async () => {
    mockEmployeeRepository.findByUserId.mockResolvedValueOnce(null);

    const response = await findEmployeeByUserIdService.execute({
      userId: "user-2",
    });

    expect(mockEmployeeRepository.findByUserId).toHaveBeenCalledTimes(1);
    expect(mockEmployeeRepository.findByUserId).toHaveBeenCalledWith("user-2");
    expect(response).toEqual({ employee: null });
  });
});
