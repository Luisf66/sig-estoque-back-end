import { describe, it, expect, vi, beforeEach } from "vitest";
import { FindEmployeeByIdService } from "./find-employee-by-id";

describe("FindEmployeeByIdService", () => {
  let employeeRepository: any;
  let findEmployeeByIdService: FindEmployeeByIdService;

  beforeEach(() => {
    employeeRepository = {
      findById: vi.fn(),
    };

    findEmployeeByIdService = new FindEmployeeByIdService(employeeRepository);
  });

  it("deve retornar um employee quando o ID existir", async () => {
    const fakeEmployee = {
      id: "emp-1",
      userId: "user-1",
    };

    employeeRepository.findById.mockResolvedValue(fakeEmployee);

    const result = await findEmployeeByIdService.execute({ id: "emp-1" });

    expect(employeeRepository.findById).toHaveBeenCalledWith("emp-1");
    expect(result).toEqual({ employee: fakeEmployee });
  });

  it("deve retornar null quando o employee não for encontrado", async () => {
    employeeRepository.findById.mockResolvedValue(null);

    const result = await findEmployeeByIdService.execute({ id: "emp-999" });

    expect(employeeRepository.findById).toHaveBeenCalledWith("emp-999");
    expect(result).toEqual({ employee: null });
  });

  it("deve lançar erro se o repositório falhar", async () => {
    employeeRepository.findById.mockRejectedValue(new Error("Erro interno"));

    await expect(
      findEmployeeByIdService.execute({ id: "emp-1" })
    ).rejects.toThrowError("Erro interno");

    expect(employeeRepository.findById).toHaveBeenCalledWith("emp-1");
  });
});
