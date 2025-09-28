import { describe, it, expect, vi, beforeEach } from "vitest";
import { FetchAllEmployeeService } from "./fetch-all-employee";

describe("FetchAllEmployeeService", () => {
  let employeeRepository: any;
  let fetchAllEmployeeService: FetchAllEmployeeService;

  beforeEach(() => {
    employeeRepository = {
      findMany: vi.fn(),
    };

    fetchAllEmployeeService = new FetchAllEmployeeService(employeeRepository);
  });

  it("deve retornar uma lista de employees com sucesso", async () => {
    const fakeEmployees = [
      { id: "emp-1", userId: "user-1" },
      { id: "emp-2", userId: "user-2" },
    ];

    employeeRepository.findMany.mockResolvedValue(fakeEmployees);

    const result = await fetchAllEmployeeService.execute();

    expect(employeeRepository.findMany).toHaveBeenCalled();
    expect(result).toEqual({ employee: fakeEmployees });
  });

  it("deve retornar uma lista vazia quando não houver employees", async () => {
    employeeRepository.findMany.mockResolvedValue([]);

    const result = await fetchAllEmployeeService.execute();

    expect(employeeRepository.findMany).toHaveBeenCalled();
    expect(result).toEqual({ employee: [] });
  });

  it("deve lançar erro se o repositório falhar", async () => {
    employeeRepository.findMany.mockRejectedValue(new Error("Erro interno"));

    await expect(fetchAllEmployeeService.execute()).rejects.toThrowError("Erro interno");
    expect(employeeRepository.findMany).toHaveBeenCalled();
  });
});
