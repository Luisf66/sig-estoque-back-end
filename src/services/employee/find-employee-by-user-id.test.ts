import { describe, it, expect, vi, beforeEach } from "vitest";
import { FindEmployeeByUserId } from "./find-employee-by-user-id";

describe("FindEmployeeByUserId Service", () => {
  let employeeRepository: any;
  let findEmployeeByUserIdService: FindEmployeeByUserId;

  beforeEach(() => {
    employeeRepository = {
      findByUserId: vi.fn(),
    };

    findEmployeeByUserIdService = new FindEmployeeByUserId(employeeRepository);
  });

  it("deve retornar um employee quando o userId existir", async () => {
    const fakeEmployee = {
      id: "emp-1",
      userId: "user-1",
    };

    employeeRepository.findByUserId.mockResolvedValue(fakeEmployee);

    const result = await findEmployeeByUserIdService.execute({ userId: "user-1" });

    expect(employeeRepository.findByUserId).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({ employee: fakeEmployee });
  });

  it("deve retornar null quando o employee não for encontrado", async () => {
    employeeRepository.findByUserId.mockResolvedValue(null);

    const result = await findEmployeeByUserIdService.execute({ userId: "user-999" });

    expect(employeeRepository.findByUserId).toHaveBeenCalledWith("user-999");
    expect(result).toEqual({ employee: null });
  });

  it("deve lançar erro se o repositório falhar", async () => {
    employeeRepository.findByUserId.mockRejectedValue(new Error("Erro interno"));

    await expect(
      findEmployeeByUserIdService.execute({ userId: "user-1" })
    ).rejects.toThrowError("Erro interno");

    expect(employeeRepository.findByUserId).toHaveBeenCalledWith("user-1");
  });
});
